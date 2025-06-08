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

        _statement: ($) => choice($._expression_statement, $._declaration_statement),

        _expression_statement: ($) => seq($._expression, ';'),
        
        _declaration_statement: ($) => choice(
            $.attribute,
            $.use_statement, // TODO: Relocate?
            $.function_definition,
        ),

        _expression: ($) => 'foo',

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
        
        // Noirc: Use.
        use_statement: ($) => seq(
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

        // * * * * * * * * * * * * * * * * * * * * * * * * * DECLARATIONS

        // Noirc: ItemVisibility.
        visibility_modifier: ($) => seq('pub', optional('(crate)')),
        
        // Noirc: Visibility.
        visibility: ($) => optional(choice(
            'pub',
            'return_data',
            seq('call_data(', $.int_literal ,')'),
        )),
        
        // TODO: Differentiate between inner/non-inner in grammar, for now not doing so in order to focus on completing grammar entirely (broadly).
        // Noirc: Attributes, and InnerAttribute.
        attribute: ($) => seq(
            '#',
            optional('!'), // Marks InnerAttribute.
            '[',
            optional("'"), // Marks attribute as having a tag
            alias($.attribute_content, $.content),
            ']',
        ),
        
        attribute_content: ($) => seq(repeat1(choice(' ', REG_ALPHABETIC, REG_NUMERIC, REG_ASCII_PUNCTUATION))),
        
        function_parameters: ($) => seq(
            '(',
            // TODO: The rest.
            ')',
        ),
        
        function_definition: ($) => seq(
            optional($.visibility_modifier),
            optional($.function_modifiers),
            'fn',
            field('name', $.identifier),
            // TODO: Generics
            $.function_parameters,
            // optional(seq('->' /* TODO: Return visibility and type */)), // TODO: Temp commented out
            // TODO: Where clause
            // $.block, // TODO: Temp commented out
            // TODO: It's block or ';' see Parser::parse_function()
        ),
        
        function_modifiers: ($) => repeat1(choice(MODIFIERS.Unconstrained, MODIFIERS.Comptime)),

        // * * * * * * * * * * * * * * * * * * * * * * * * * TYPES

        // Ours: Type.
        _type: ($) => choice(
            $.primitive_type,
            $.parentheses_type,
            $.array_or_slice_type,
            $.mutable_reference_type,
            $.function_type,
            // TODO: TraitAsType, AsTraitPathType, UnresolvedNamedType
        ),
        
        primitive_type: ($) => choice(
            $.field_type,
            $.integer_type,
            $.bool_type,
            $.string_type,
            $.format_string_type,
        ),
        
        field_type: _ => 'Field',
        
        integer_type: _ => choice(...INTEGER_TYPES),
        
        bool_type: _ => 'bool',
        
        string_type: ($) => seq(
            'str',
            '<',
            // TODO: TypeExpression goes here.
            '>',
        ),
        
        format_string_type: _ => 'fmtstr',
        
        parentheses_type: ($) => choice(
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

        // * * * * * * * * * * * * * * * * * * * * * * * * * EXPRESSIONS

        block_expression: _ => seq(
            '{',
            // TODO: Optionally repeated Statement.
            '}',
        ),

        // * * * * * * * * * * * * * * * * * * * * * * * * * LITERALS

        int_literal: _ => token(seq(
            choice(
                /[0-9][0-9_]*/,
                /0x[0-9a-fA-F_]+/,
            )
        )),
        
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
