const REG_ALPHABETIC = /[a-zA-Z]/
// TODO: Using this where Noir parser frontend checks for numeric which actually includes unicode stuff also, but the rest of Noir only allows ASCII so.. this is probably fine.
const REG_NUMERIC = /[0-9]/
const REG_ASCII_PUNCTUATION = /[!"#$%&'()*+,\-./:;<=>?@\[\\\]^_`\{|\}~]/

// TODO: Put this in appropriate tangle location instead of literally part of the tangle template maybe? See PrimitiveType > IntegerType.
const INTEGER_TYPES = [
    'u1',
    'u8',
    'u16',
    'u32',
    'u64',
    //
    'i1',
    'i8',
    'i16',
    'i32',
    'i64',    
]

const PRECEDENCE = {
    // TODO: Term's even-higher precedence items.
    multiplicitive: 9,
    additive: 8,
    bitshift: 7,
    comparative: 6,
    bitxor: 5,
    bitand: 4,
    or: 3,
    equality: 2,
}

// Noirc: Modifiers -- except for visibility (in order).
const MODIFIERS = {
    Unconstrained: 'unconstrained',
    Comptime: 'comptime',
    Mut: 'mut',
}

// Functions can only have one primary attribute.
const PRIMARY_ATTRIBUTES = [
    'foreign',
    'builtin',
    'oracle',
    'test',
    'recursive',
    'fold',
    'no_predicates',
    'inline_always',
    'test',
    'field',
]

// Functions can have any number of secondary attributes.
const SECONDARY_ATTRIBUTES = [
    'deprecated',
    'contract_library_method',
    'abi',
    'export',
    'varargs',
    'use_callers_scope',
    'allow',
]

module.exports = grammar({
    name: 'noir',

    externals: ($) => [
        $._block_comment_content,
        $.__inner_block_comment_doc_style,
        $.__outer_block_comment_doc_style,
    ],

    // TODO: What else for these extras?
    extras: ($) => [
        /\s/,
        $.line_comment,
        $.block_comment,
    ],

    // TODO: Need to document (for myself) keyword extraction to check we're doing it properly.
    word: ($) => $.identifier,

    rules: {
        // Noirc: Module -- top-level AST node is really Program but it immediately wraps Module.
        source_file: ($) => repeat($._statement),

        // Can statement-ise anything so we'll use this as top-level.
        // _statement: ($) => choice($._expression_statement, $._declaration_statement),
        // _expression_statement: ($) => seq($._expression, ';'),
        _statement: ($) => choice($.__item),

        // Noirc: Module -- Since doc comments can appear anywhere, Module is Item which is ItemKind.
        __item: ($) => choice(
            $.attribute_item,
            $.use_declaration,
            $.module_or_contract_item,
            $.struct_item,
            $.impl_item,
            $.global_item,
        ),

        item_list: ($) => seq(
            '{',
            repeat($.__item),
            '}',
        ),

        // * * * * * * * * * * * * * * * * * * * * * * * * * DECLARATIONS / ITEMS

        // Noirc: ItemVisibility.
        visibility_modifier: ($) => seq('pub', optional('(crate)')),
        
        // Noirc: Visibility.
        visibility: ($) => choice(
            'pub',
            'return_data',
            seq('call_data(', $.int_literal ,')'),
        ),
        
        // TODO: Differentiate between inner/non-inner in grammar, for now not doing so in order to focus on completing grammar entirely (broadly).
        // Noirc: Attributes, and InnerAttribute.
        attribute_item: ($) => seq(
            '#',
            optional('!'), // Marks InnerAttribute.
            '[',
            optional("'"), // Marks attribute as having a tag
            alias($.attribute_content, $.content),
            ']',
        ),
        
        attribute_content: ($) => seq(repeat1(choice(' ', REG_ALPHABETIC, REG_NUMERIC, REG_ASCII_PUNCTUATION))),
        
        // Noirc: Use.
        use_declaration: ($) => seq(
            optional($.visibility_modifier),
            'use',
            field('tree', $.__use_tree_variants),
            ';',
        ),
        
        // Noirc: UseTree.
        __use_tree_variants: ($) => choice(
            $.__path_no_kind_no_turbofish,
            $.use_list,
            // XXX: Alias name here needs to match that in __path_no_kind_no_turbofish.
            alias($.__use_list_path_prefix, $.path),
            // TODO: The structure of how use alias appears in the CST isn't really cognate to use_list.. but can refine this later once the entire grammar is done.
            $.use_alias,
        ),
        
        // Noirc: UseTreeList -- if path beforehand.
        __use_list_path_prefix: ($) => seq(
            optional(field('scope', optional($.__path_no_kind_no_turbofish))),
            '::',
            field('list', $.use_list),
        ),
        
        // Noirc: UseTreeList -- if no path beforehand.
        use_list: ($) => seq(
            '{',
            sepBy($.__use_tree_variants, ','),
            optional(','),
            '}',
        ),
        
        // Ours: UseTreeAs.
        use_alias: ($) => seq(
            field('scope', $.__path_no_kind_no_turbofish),
            'as',
            field('alias', $.identifier),
        ),
        
        // Noirc: ModOrContract.
        module_or_contract_item: ($) => seq(
            optional($.visibility_modifier),
            choice('mod', 'contract'), // TODO: Discriminate kind into a field?
            field('name', $.identifier),
            choice(
                ';',
                field('body', $.item_list),
            ),
        ),
        
        // Noirc: Struct.
        struct_item: ($) => seq(
            optional($.visibility_modifier),
            'struct',
            field('name', $.identifier),
            // optional($.generics), // TODO: Generics
            choice(
                field('body', $.struct_field_list), // TODO: If this is similar to others, e.g. Impl or Enum we can reduce it to one.
                ';', // Empty struct.
            ),
        ),
        
        // TODO: If this is general enough and in-use elsewhere like Impl or Enum then reduce it to 1.
        // Noirc: StructField.
        struct_field_item: ($) => seq(
            optional($.visibility_modifier),
            field('name', $.identifier),
            ':',
            field('type', $._type),
        ),
        
        struct_field_list: ($) => seq(
            '{',
            sepBy($.struct_field_item, ','),
            optional(','),
            '}',
        ),
        
        impl_item: ($) => seq(
            'impl',
            // TODO: Generics
            // TODO: Path
        
            // TODO: Choice between TypeImpl or TraitImpl
            $.trait_impl,
        ),
        
        trait_impl: ($) => seq(
            // TODO: Path
            $.generic_type_args,
            'for',
            $._type,
            // optional($.where_clause), // Temp commented for now due to prec error.
        ),
        
        // Noirc: Global.
        global_item: ($) => seq(
            'global',
            field('name', $.identifier),
            // TODO: OptionalTypeAnnotation.
            '=',
            $._expression,
            // prec.left(1, $._expression),
            ';',
        ),
        
        // TODO: Put this elsewhere. ExpressionKind::Literal see ast/expression.rs
        // Noirc: Literal
        _literal: ($) => choice(
            $.bool_literal,
            $.int_literal,
            $.str_literal,
            // rawstr, fmtstr, quoteexpression, arrayexpression, sliceexpression, blockexpression
        ),
        
        // Noirc: FunctionParameters.
        function_parameters: ($) => seq(
            '(',
            sepBy($.function_parameter, ','), // Inlined Noirc: FunctionParametersList
            optional(','),
            ')',
        ),
        
        // Noirc: FunctionParameter.
        function_parameter: ($) => seq(
            optional($.visibility),
            $._pattern_or_self,
            ':',
            $._type,
        ),
        
        // Noirc: Function.
        function_definition: ($) => seq(
            optional($.visibility_modifier),
            optional($.function_modifiers),
            'fn',
            field('name', $.identifier),
            // TODO: Generics
            field('parameters', $.function_parameters),
            optional(seq('->', optional($.visibility), $._type)),
            optional($.where_clause),
            choice($.block, ';'),
        ),
        
        function_modifiers: ($) => repeat1(choice(MODIFIERS.Unconstrained, MODIFIERS.Comptime)),
        
        where_clause: ($) => seq(
                'where',
                sepBy1($.where_clause_item, ','),
                optional(',')
        ),
        
        where_clause_item: ($) => seq(
                $._type,
                ':',
                $.trait_bounds,
        ),
        
        trait_bounds: ($) => seq(
            sepBy1($.trait_bound, '+'),
            optional('+'),
        ),
        
        trait_bound: ($) => seq(
            optional($.__path_no_turbofish),
            $.generic_type_args,
        ),

        // * * * * * * * * * * * * * * * * * * * * * * * * * STATEMENTS

        // TODO: Consider all Noirc 'statements' except we enforce trailing semicolon where required? Or just have a statements section idk yet.
        statement: ($) => choice(
            // TODO: Attributes.
        ),
        
        // Noirc: StatementKind.,
        
        // Statements ending in blocks, thus not requiring semicolons.
        _block_ending_statements: ($) => choice(
            $.for_statement,
            // $.interned_statement, // TODO: Commented temporarily.
            //$.block,
            // $.unsafe_expression, // TODO: Commented temporarily.
            // $.interned_expression, // TODO: Commented temporarily.
            // $.if_statement, // TODO: Commented temporarily.
        ),
        
        // Noirc: BreakStatement.
        break_statement: _ => seq('break'),
        
        // Noirc: ContinueStatement.
        continue_statement: _ => seq('continue'),
        
        for_statement: ($) => 'FOR_STATEMENT___TODO',
        
        // Noirc: BlockStatement.
        block_statement: ($) => choice(
            // TODO
        ),

        // * * * * * * * * * * * * * * * * * * * * * * * * * EXPRESSIONS

        _expression: ($) => choice(
            $.binary_expression,
            $._literal,
        ),
        
        // Noirc: EqualOrNotEqualExpression -- Entire nested hierarchy flattened and renamed.
        binary_expression: ($) => {
            const t = [
                // Highest to lowest.
                [PRECEDENCE.multiplicitive, choice('*', '/', '%',)],
                [PRECEDENCE.additive, choice('+', '-')],
                [PRECEDENCE.bitshift, choice('<<', '>>')],
                [PRECEDENCE.comparative, choice('<', '<=', '>', '>=')],
                [PRECEDENCE.bitxor, '^'],
                [PRECEDENCE.bitand, '&'],
                [PRECEDENCE.or, '|'],
                [PRECEDENCE.equality, choice('==', '!=')],
            ]
        
            return choice(...t.map(([p, o]) => prec.left(p, seq(
                field('left', $._expression),
                field('operator', o),
                field('right', $._expression),
            ))))
        },
        
        block: _ => 'BLOCK_____TODO', // Temp just so grammar.js compiles.
        
        block_expression: _ => seq(
            '{',
            // TODO: Optionally repeated Statement.
            '}',
        ),

        // * * * * * * * * * * * * * * * * * * * * * * * * * TYPES

        // Ours: Type.
        _type: ($) => choice(
            $.primitive_type,
            $._parentheses_type,
            $.array_or_slice_type,
            $.mutable_reference_type,
            $.function_type,
            // TODO: TraitAsType, AsTraitPathType, UnresolvedNamedType
        ),
        
        primitive_type: ($) => choice(
            $._field_type,
            $._integer_type,
            $._bool_type,
            $._string_type,
            $._format_string_type,
        ),
        
        _field_type: _ => 'Field',
        
        _integer_type: _ => choice(...INTEGER_TYPES),
        
        _bool_type: _ => 'bool',
        
        _string_type: ($) => seq(
            'str',
            '<',
            // TODO: TypeExpression goes here.
            '>',
        ),
        
        _format_string_type: _ => 'fmtstr',
        
        _parentheses_type: ($) => choice(
            $.unit_type,
            $.tuple_type,
        ),
        
        unit_type: _ => seq('(', ')'),
        
        tuple_type: ($) => seq(
            '(',
            sepBy1($._type, ','),
            optional(','),
            ')',
        ),
        
        array_or_slice_type: ($) => seq(
            '[',
            $._type,
            optional(seq(
                ';',
                $.type_expr, // TODO: this rule
            )),
            ']',
        ),
        
        mutable_reference_type: ($) => seq(
            '&',
            'mut',
            $._type,
        ),
        
        function_type: ($) => seq(
            'unconstrained',
            'fn',
            optional($.capture_environment),
            $.parameter_list,
            '->',
            $._type,
        ),
        
        capture_environment: ($) => seq(
            '[',
            $._type,
            ']',
        ),
        
        parameter_list: ($) => seq(
            '(',
            sepBy($._type, ','),
            ')',
        ),
        
        // TODO: If GenericTypeArgsList is referenced by anything else in addition to GenericTypeArgs, then it needs to be its own rule so we can re-use it. Here it's been inlined.
        // Noirc: GenericTypeArgs.
        generic_type_args: ($) => seq(
            '<',
            sepBy($.generic_type_arg, ','), // Inlined Noirc: GenericTypeArgsList.
            optional(','),
            '>',
        ),
        
        // Noirc: GenericTypeArg.
        generic_type_arg: ($) => choice(
            $.named_type_arg,
            $._ordered_type_arg,
        ),
        
        // Noirc: NamedTypeArg.
        named_type_arg: ($) => seq(
            $.identifier,
            '=',
            $._type,
        ),
        
        // Noirc: OrderedTypeArg.
        // _ordered_type_arg: _ => alias($.TODO_TYPE_OR_TYPE_EXPRESSION, $.ordered_type_arg)
        _ordered_type_arg: _ => 'ORDERED_TYPE_ARG___TODO',
        
        // Using 'expr' in-place of 'expression' so-as-to not conflate with _real_ expressions.
        // Noirc: TypeExpression -- (see: UnresolvedTypeExpression).
        type_expr: ($) => choice(
            $.term_type_expr,
            $.binary_type_expr,
        ),
        
        binary_type_expr: ($) => choice(
            prec.left(10, seq(
                field('left', $.type_expr),
                field('operator', choice('*', '/', '%')),
                field('right', $.type_expr),
            )),
            prec.left(9, seq(
                field('left', $.type_expr),
                field('operator', choice('+', '-')),
                field('right', $.type_expr),
            )),    
        ),
        
        // Noirc: TermTypeExpression.
        term_type_expr: ($) => choice(
            seq('-', $.atom_type_expr),
            $.atom_type_expr,
        ),
        
        // Noirc: AtomTypeExpression.
        atom_type_expr: ($) => choice(
            $.constant_type_expr,
            // $.variable_type_expr,
            $.parenthesized_type_expr,
        ),
        
        // Noirc: ConstantTypeExpression.
        constant_type_expr: ($) => $.int_literal,
        
        // Noirc: VariableTypeExpression.
        variable_type_expr: ($) => 'PATH_UNKNOWN__TODO',
        
        // Noirc: ParenthesizedTypeExpression.
        parenthesized_type_expr: ($) => seq(
            '(',
            $.type_expr,
            ')',
        ),

        // * * * * * * * * * * * * * * * * * * * * * * * * * PATTERNS

        // Noirc: PatternOrSelf.
        _pattern_or_self: ($) => choice(
            $._pattern,
            $.self_pattern,
        ),
        
        // Noirc: PatternNoMut.
        _pattern: ($) => choice(
            // TODO: InternedPattern? It looks like a compiler-only internal though and not discrete syntax.
            optional($.mut_bound),
            $.tuple_pattern,
            $.struct_pattern,
            $.identifier, // Noirc: IdentifierPattern.
        ),
        
        // Noirc: TuplePattern.
        tuple_pattern: ($) => seq(
            '(',
            sepBy($._pattern, ','), // Inlined Noirc: PatternList.
            optional(','),
            ')',
        ),
        
        // Noirc: StructPattern.
        struct_pattern: ($) => seq(
            // TODO: Path
            '{',
            sepBy($.struct_pattern_field, ','), // Inlined Noirc: StructPatternFields.
            optional(','),
            '}',
        ),
        
        // TODO: Is this similar enough to other rules we can reduce it to a single shared one?
        // Noirc: StructPatternField.
        struct_pattern_field: ($) => seq(
            $.identifier,
            optional(seq(':', $._pattern)),
        ),
        
        // Noirc: SelfPattern.
        self_pattern: ($) => seq(
            optional('&'),
            optional($.mut_bound),
            $.self,
        ),

        // * * * * * * * * * * * * * * * * * * * * * * * * * LITERALS

        // TODO: Inlined in master-template until better home.
        mut_bound: _ => 'mut',
        self: _ => 'self',
        // END TODO
        
        // Noirc: bool.
        bool_literal: _ => choice('true', 'false'),
        
        // Noirc: int.
        int_literal: _ => token(seq(
            choice(
                /[0-9][0-9_]*/,
                /0x[0-9a-fA-F_]+/,
            )
        )),
        
        // Noirc: str.
        str_literal: ($) => seq(
            '"',
            repeat(choice(
                $.str_content,
                $.escape_sequence,
            )),
            token.immediate('"'),
        ),
        
        escape_sequence: ($) => seq(
            '\\',
            // TODO: Do we want to be strict on valid escape sequences (r, n, t etc) or accept any ASCII. Problem is error recovery in tree-sitter and how that affects highlighting.
            token.immediate(choice(
                'r', 'n', 't', '0', '"', '\\',
            )),
        ),
        
        // Whitespace characters, and printable ASCII except " (x22) and \ (x5C).
        str_content: _ => /[\x20-\x21\x23-\x5B\x5D-\x7E\s]+/,
        
        comment: ($) => choice(
            $.line_comment,
            $.block_comment,
        ),
        
        __inner_line_comment_doc_style: _ => token.immediate(prec(2, '!')),
        __outer_line_comment_doc_style: _ => token.immediate(prec(2, '/')),
        
        __line_comment_doc_style: ($) => choice(
            alias($.__inner_line_comment_doc_style, $.inner_doc_style),
            alias($.__outer_line_comment_doc_style, $.outer_doc_style),
        ),
        
        line_comment: ($) => seq(
            '//',
            choice(
                // Four forward-slashes is still a normal line comment, not an outer-style.
                seq(token.immediate(prec(2, '//')), /.*/),
                seq(
                    field('style', $.__line_comment_doc_style),
                    field('content', alias(/.*/, $.doc_comment)),
                ),
                /.*/,
            ),
        ),
        
        __block_comment_doc_style: ($) => choice(
            alias($.__inner_block_comment_doc_style, $.inner_doc_style),
            alias($.__outer_block_comment_doc_style, $.outer_doc_style),
        ),
        
        block_comment: ($) => seq(
            '/*',
            optional(
                choice(
                    // Block comments with doc style (see external parser).
                    seq(
                        field('style', $.__block_comment_doc_style),
                        optional(field('content', alias($._block_comment_content, $.doc_comment))),
                    ),
                    // Normal block comments (see external parser).
                    $._block_comment_content,
                ),
            ),
            '*/',
        ),
        
        _path: ($) => optional(choice(
        
        )),
        
        __path_no_turbofish: ($) => seq(
            optional($.path_kind),
            $.__path_no_kind_no_turbofish,
        ),
        
        // __identifiers_in_path_no_turbofish: ($) => prec.left(seq(
        //     sepBy1($.identifier, '::'),
        //     optional('::'),
        // ))
        
        __nested_scopes_in_path_no_turbofish: ($) => seq(
            field('scope', $.__path_no_kind_no_turbofish),
            '::',
            field('name', $.identifier),
        ),
        
        // TODO: Obviously this rule's name is wrong, but needs to be this way for now.
        // Ours: IdentifiersInPathNoTurbofish.
        __path_no_kind_no_turbofish: ($) => seq(
            choice(
                choice($.crate, $.dep, $.super, $.identifier),
                // $.identifier,
                alias($.__nested_scopes_in_path_no_turbofish, $.path),
            ),
        ),
        
        // TODO: Optional wrapping this or not?
        
        crate: _ => 'crate',
        dep: _ => 'dep',
        super: _ => 'super',
        
        // Noirc: PathKind.
        path_kind: ($) => seq(
            choice($.crate, $.dep, $.super),
            '::',
        ),
        
        // Noir does not support Unicode Identifiers (UAX#31) so XID_Start/XID_Continue. Only ASCII.
        // Noirc: Token::Ident.
        identifier: _ => /[a-zA-Z_][a-zA-Z0-9_]*/,
    },
})

// Match one or more occurrences of rule separated by sep.
function sepBy1(rule, sep) {
    return seq(rule, repeat(seq(sep, rule)))
}

// Match zero or more occurrences of rule separated by sep.
function sepBy(rule, sep) {
    return optional(sepBy1(rule, sep))
}
