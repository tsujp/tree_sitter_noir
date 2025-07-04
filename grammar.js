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
    unary: 10,
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
        $._raw_str_literal_start,
        $._raw_str_literal_content,
        $._raw_str_literal_end,
        // Block comments are `extras` and can occur anywhere, so must be last in this list otherwise they will clobber other tokens we use an external scanner for.
        $._block_comment_content,
        $.__inner_block_comment_doc_style,
        $.__outer_block_comment_doc_style,
    ],

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
        
        // [[file:noir_grammar.org::item_visibility]]
        visibility_modifier: $ => seq('pub', optional('(crate)')),
        
        // [[file:noir_grammar.org::visibility]]
        visibility: $ => choice(
            'pub',
            'return_data',
            seq('call_data(', $.int_literal ,')'),
        ),
        
        // [[file:noir_grammar.org::attribute]]
        attribute_item: $ => seq(
            '#',
            optional('!'), // Marks InnerAttribute.
            '[',
            optional("'"), // Marks attribute as having a tag
            alias($.attribute_content, $.content),
            ']',
        ),
        // [[file:noir_grammar.org::attribute_content]]
        attribute_content: _ => seq(repeat1(choice(' ', REG_ALPHABETIC, REG_NUMERIC, REG_ASCII_PUNCTUATION))),
        
        // [[file:noir_grammar.org::use]]
        use_declaration: $ => seq(
            optional($.visibility_modifier),
            'use',
            // field('tree', $.__use_tree_variants),
            field('tree', $.__use_tree_variants),
            ';',
        ),
        // [[file:noir_grammar.org::use_tree]]
        __use_tree_variants: $ => choice(
            $.__path_no_kind_no_turbofish,
            // $.use_list,
            $.use_list,
            // XXX: Alias name here needs to match that in __path_no_kind_no_turbofish.
            // alias($.__use_list_path_prefix, $.path),
            alias($.__use_list_path_prefix, $.path),
            // TODO: The structure of how use alias appears in the CST isn't really cognate to use_list.. but can refine this later once the entire grammar is done.
            // $.use_alias,
            $.use_alias,
        ),
        // [[file:noir_grammar.org::use_tree_list__path]]
        __use_list_path_prefix: $ => seq(
            optional(field('scope', optional($.__path_no_kind_no_turbofish))),
            '::',
            // field('list', $.use_list),
            field('list', $.use_list),
        ),
        // [[file:noir_grammar.org::use_tree_list__nopath]]
        use_list: $ => seq(
            '{',
            // sepBy($.__use_tree_variants, ','),
            sepBy($.__use_tree_variants, ','),
            optional(','),
            '}',
        ),
        // [[file:noir_grammar.org::use_alias]]
        use_alias: $ => seq(
            field('scope', $.__path_no_kind_no_turbofish),
            'as',
            field('alias', $.identifier),
        ),
        
        // [[file:noir_grammar.org::mod_or_contract]]
        module_or_contract_item: $ => seq(
            optional($.visibility_modifier),
            choice('mod', 'contract'), // TODO: Discriminate kind into a field?
            field('name', $.identifier),
            choice(
                ';',
                field('body', $.item_list),
            ),
        ),
        
        // [[file:noir_grammar.org::struct]]
        struct_item: $ => seq(
            optional($.visibility_modifier),
            'struct',
            field('name', $.identifier),
            // optional($.generics), // TODO: Generics
            choice(
                field('body', $.struct_field_list), // TODO: If this is similar to others, e.g. Impl or Enum we can reduce it to one.
                ';', // Empty struct.
            ),
        ),
        // [[file:noir_grammar.org::struct_field]]
        struct_field_item: $ => seq(
            optional($.visibility_modifier),
            field('name', $.identifier),
            ':',
            field('type', $._type),
        ),
        // [[file:noir_grammar.org::struct_field_list]]
        struct_field_list: $ => seq(
            '{',
            sepBy($.struct_field_item, ','),
            optional(','),
            '}',
        ),
        
        // [[file:noir_grammar.org::impl]]
        impl_item: $ => seq(
            'impl',
            // TODO: Generics
            // TODO: Path
        
            // TODO: Choice between TypeImpl or TraitImpl
            // $.trait_impl,
            $.trait_impl,
        ),
        // [[file:noir_grammar.org::trait_impl]]
        trait_impl: $ => seq(
            // TODO: Path
            $.generic_type_args,
            'for',
            $._type,
            // optional($.where_clause), // Temp commented for now due to prec error.
        ),
        // TODO: Trait
        
        // [[file:noir_grammar.org::global]]
        global_item: $ => seq(
            'global',
            field('name', $.identifier),
            // TODO: OptionalTypeAnnotation.
            '=',
            $._expression,
            // prec.left(1, $._expression),
            ';',
        ),
        // TODO: TypeAlias
        
        // [[file:noir_grammar.org::function_parameters]]
        function_parameters: $ => seq(
            '(',
            sepBy($.function_parameter, ','), // Inlined Noirc: FunctionParametersList
            optional(','),
            ')',
        ),
        // [[file:noir_grammar.org::function_parameter]]
        function_parameter: $ => seq(
            optional($.visibility),
            $._pattern_or_self,
            ':',
            $._type,
        ),
        // [[file:noir_grammar.org::function]]
        function: $ => seq(
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
        // [[file:noir_grammar.org::function_modifiers]]
        function_modifiers: $ => repeat1(choice(MODIFIERS.Unconstrained, MODIFIERS.Comptime)),
        
        // [[file:noir_grammar.org::where]]
        where_clause: $ => seq(
                'where',
                sepBy1($.where_clause_item, ','),
                optional(',')
        ),
        // [[file:noir_grammar.org::where_clause]]
        where_clause_item: $ => seq(
                $._type,
                ':',
                $.trait_bounds,
        ),
        // [[file:noir_grammar.org::trait_bounds]]
        trait_bounds: $ => seq(
            sepBy1($.trait_bound, '+'),
            optional('+'),
        ),
        // [[file:noir_grammar.org::trait_bound]]
        trait_bound: $ => seq(
            optional($.__path_no_turbofish),
            $.generic_type_args,
        ),

        // * * * * * * * * * * * * * * * * * * * * * * * * * STATEMENT KINDS (AST)
        // TODO: Consider all Noirc 'statements' except we enforce trailing semicolon where required? Or just have a statements section idk yet.
        
        // [[file:noir_grammar.org::statement]]
        _statement_ast: $ => seq(
            // TODO: Attributes.
            $._statement_kind,
            ';',
        ),
        
        // [[file:noir_grammar.org::statement_kind]]
        _statement_kind: $ => choice(
            $.break_statement,
            $.continue_statement,
            $.return_statement,
            $.let_statement,
            $.constrain_statement,
            $.comptime_statement,
            $.for_statement,
            $.if_expression,
        ),
        // [[file:noir_grammar.org::break_statement]]
        break_statement: _ => 'break',
        // [[file:noir_grammar.org::continue_statement]]
        continue_statement: _ => 'continue',
        // [[file:noir_grammar.org::return_statement]]
        return_statement: $ => seq('return', optional($._expression)),
        // [[file:noir_grammar.org::let_statement]]
        let_statement: $ => seq(
            'let',
            optional($.mut_bound),
            field('pattern', $._pattern),
            // TODO: OptionalTypeAnnotation
            '=',
            field('value', $._expression),
        ),
        // [[file:noir_grammar.org::constrain_statement]]
        constrain_statement: $ => seq(
            // XXX: Keyword 'constrain' is deprecated, we're not going to include it at all.
            // 'assert' expects 1 or 2 parameters, 'assert_eq' expects 2 or 3. This is out of scope for tree-sitter grammar (at least for now), if it's a boon without huge complexity the rules can be augmented to enforce this later.
            choice('assert', 'assert_eq'),
            field('arguments', $.arguments),
        ),
        // [[file:noir_grammar.org::comptime_statement]]
        comptime_statement: $ => seq(
            'comptime',
            choice(
                $.block, // Noirc: ComptimeBlock
                $.let_statement, // Noirc: ComptimeLet
                $.for_statement, // Noirc: ComptimeFor
            ),
        ),
        // [[file:noir_grammar.org::for_statement]]
        for_statement: $ => seq(
            'for',
            field('value', $.identifier),
            'in',
            field('range', choice(
                $._expression,
                $.range_expression,
            )),
            field('body', $.block),
        ),

        // * * * * * * * * * * * * * * * * * * * * * * * * * EXPRESSIONS
        
        // [[file:noir_grammar.org::expression]]
        _expression: $ => choice(
            $.binary_expression,
            $.__literal,
        ),
        
        // [[file:noir_grammar.org::binary_expression]]
        binary_expression: $ => {
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
        
        // [[file:noir_grammar.org::quote_expression]]
        quote_expression: $ => alias($.quote_literal, $.quote_expression),
        
        // [[file:noir_grammar.org::array_expression]]
        array_expression: $ => seq(
            '[',
            choice(
                // Inlined Noirc: StandardArrayLiteral and ArrayElements.
                seq(
                    sepBy($._expression, ','),
                    optional(','),
                ),
                // Inlined Noirc: RepeatedArrayLiteral.
                seq(
                    $._expression,
                    ';',
                    field('length', $._type_expr),
                ),
            ),
            ']',
        ),
        
        // [[file:noir_grammar.org::slice_expression]]
        slice_expression: $ => seq('&', $.array_expression),
        
        // [[file:noir_grammar.org::block_expression]]
        block: $ => seq(
            '{',
            repeat($._statement_ast),
            '}',
        ),
        
        // [[file:noir_grammar.org::arguments]]
        arguments: $ => seq(
            '(',
            sepBy($._expression, ','), // Inlined Noirc: ArgumentsList.
            optional(','),
            ')',
        ),
        // [[file:noir_grammar.org::call_arguments]]
        call_arguments: $ => seq(
            optional('!'),
            $.arguments,
        ),
        
        // [[file:noir_grammar.org::for_range]]
        range_expression: $ => seq(
            $._expression,
            '..',
            optional(token.immediate('=')),
            $._expression,
        ),
        
        // TODO: Order these as makes sense
        
        // [[file:noir_grammar.org::if_expression]]
        if_expression: $ => seq(
            'if',
            field('condition', $._expression),
            field('consequence', $.block),
            optional(seq(
                'else',
                field('alternative', choice($.block, $.if_expression)),
            )),
        ),

        // * * * * * * * * * * * * * * * * * * * * * * * * * TYPES
        
        // [[file:noir_grammar.org::type]]
        _type: $ => choice(
            $.primitive_type,
            $._parentheses_type,
            // $.array_or_slice_type,
            // $.mutable_reference_type,
            // $.function_type,
            // TODO: TraitAsType, AsTraitPathType, UnresolvedNamedType
        ),
        
        // [[file:noir_grammar.org::primitive_type]]
        primitive_type: $ => choice(
            $.__field_type,
            $.__integer_type,
            $.__bool_type,
            $.__string_type,
            $.__format_string_type,
        ),
        // [[file:noir_grammar.org::field_type]]
        __field_type: _ => 'Field',
        // [[file:noir_grammar.org::int_type]]
        __integer_type: _ => choice(...INTEGER_TYPES),
        // [[file:noir_grammar.org::bool_type]]
        __bool_type: _ => 'bool',
        // [[file:noir_grammar.org::str_type]]
        __string_type: $ => seq(
            'str',
            '<',
            // TODO: TypeExpression goes here.
            '>',
        ),
        // [[file:noir_grammar.org::fmt_str_type]]
        __format_string_type: _ => 'fmtstr',
        
        // [[file:noir_grammar.org::parentheses_type]]
        _parentheses_type: $ => choice(
            $.unit_type,
            $.tuple_type,
        ),
        // [[file:noir_grammar.org::unit_type]]
        unit_type: _ => seq('(', ')'),
        // [[file:noir_grammar.org::tuple_type]]
        tuple_type: $ => seq(
            '(',
            sepBy1($._type, ','),
            optional(','),
            ')',
        ),
        
        // [[file:noir_grammar.org::generic_type_args]]
        generic_type_args: $ => seq(
            '<',
            sepBy($.generic_type_arg, ','), // Inlined Noirc: GenericTypeArgsList.
            optional(','),
            '>',
        ),
        // [[file:noir_grammar.org::generic_type_arg]]
        generic_type_arg: $ => choice(
            $.named_type_arg,
            $.__ordered_type_arg,
        ),
        // [[file:noir_grammar.org::named_type_arg]]
        named_type_arg: $ => seq(
            $.identifier,
            '=',
            $._type,
        ),
        // [[file:noir_grammar.org::ordered_type_arg]]
        __ordered_type_arg: _ => 'ORDERED_TYPE_ARG___TODO',
        
        // 'TypeExpressions' are limited to constant integers, variables, and basic numeric binary operators; they are a special type that is allowed in the length position of an array (and some other limited places).
        // Using 'expr' in-place of 'expression' so-as-to- not conflate with _real_ expressions.
        
        // [[file:noir_grammar.org::type_expr]]
        _type_expr: $ => choice(
            alias($.__binary_type_expr, $.binary_expression),
            // TODO: Replace literal $.unary_expression with noweb ref function
            alias($.__unary_type_expr, $.unary_expression),
            $.__atom_type_expr,
        ),
        // [[file:noir_grammar.org::binary_type_expr]]
        __binary_type_expr: $ => {
            const t = [
                // Highest to lowest.
                [PRECEDENCE.multiplicitive, choice('*', '/', '%',)],
                [PRECEDENCE.additive, choice('+', '-')],
            ]
        
            return choice(...t.map(([p, o]) => prec.left(p, seq(
                field('left', $._type_expr),
                field('operator', o),
                field('right', $._type_expr),
            ))))
        },
        // [[file:noir_grammar.org::unary_type_expr]]
        __unary_type_expr: $ => prec(PRECEDENCE.unary, seq('-', $._type_expr)),
        // [[file:noir_grammar.org::atom_type_expr]]
        __atom_type_expr: $ => choice(
            $.int_literal, // Inlined Noirc: ConstantTypeExpression.
            $.__path, // Inlined Noirc: VariableTypeExpression.
            // TODO: Replace hardcoded rule name with noweb ref.
            alias($.parenthesized_expression, $.parenthesized_expression),
        ),
        // [[file:noir_grammar.org::parenthesised_type_expr]]
        parenthesized_expression: $ => seq('(', $._type_expr, ')'),

        // * * * * * * * * * * * * * * * * * * * * * * * * * PATTERNS
        
        // [[file:noir_grammar.org::pattern_or_self]]
        _pattern_or_self: $ => choice(
            $._pattern,
            $.self_pattern,
        ),
        // [[file:noir_grammar.org::pattern]]
        _pattern: $ => seq(
            // alias(seq($.mut_bound, $._pattern_no_mut), $.mut_pattern),
            // optional($.mut_bound),
            $._pattern_no_mut,
        ),
        // [[file:noir_grammar.org::pattern_no_mut]]
        _pattern_no_mut: $ => choice(
            // TODO: InternedPattern? It looks like a compiler-only internal though and not discrete syntax.
            $.tuple_pattern,
            $.struct_pattern,
            $.identifier, // Noirc: IdentifierPattern.
        ),
        // [[file:noir_grammar.org::self_pattern]]
        self_pattern: $ => seq(
            optional('&'),
            optional($.mut_bound),
            $.self,
        ),
        
        // [[file:noir_grammar.org::tuple_pattern]]
        tuple_pattern: $ => seq(
            '(',
            sepBy($._pattern, ','), // Inlined Noirc: PatternList.
            optional(','),
            ')',
        ),
        
        // [[file:noir_grammar.org::struct_pattern]]
        struct_pattern: $ => seq(
            // TODO: Path
            '{',
            sepBy($.struct_pattern_field, ','), // Inlined Noirc: StructPatternFields.
            optional(','),
            '}',
        ),
        // [[file:noir_grammar.org::struct_pattern_field]]
        struct_pattern_field: $ => seq(
            $.identifier,
            optional(seq(':', $._pattern)),
        ),

        // * * * * * * * * * * * * * * * * * * * * * * * * * LITERALS
        
        // [[file:noir_grammar.org::literal]]
        __literal: $ => choice(
            $.bool_literal,
            $.int_literal,
            $.str_literal,
            $.raw_str_literal,
            $.fmt_str_literal,
            // $.quote_expression, // TODO: Broken for now.
            $.array_expression,
            $.slice_expression,
            $.block,
        ),
        
        // [[file:noir_grammar.org::bool]]
        bool_literal: _ => choice('true', 'false'),
        
        // [[file:noir_grammar.org::int]]
        int_literal: _ => token(seq(
            choice(
                /[0-9][0-9_]*/,
                /0x[0-9a-fA-F_]+/,
            )
        )),
        
        // [[file:noir_grammar.org::str]]
        str_literal: $ => seq(
            '"',
            repeat(choice(
                $.str_content,
                $.escape_sequence,
                // $.str_content,
                // $.escape_sequence,
            )),
            token.immediate('"'),
        ),
        // [[file:noir_grammar.org::str_content]]
        str_content: _ => /[\x20-\x21\x23-\x5B\x5D-\x7E\s]+/,
        // [[file:noir_grammar.org::escape_sequence]]
        escape_sequence: $ => seq(
            '\\',
            // TODO: Do we want to be strict on valid escape sequences (r, n, t etc) or accept any ASCII. Problem is error recovery in tree-sitter and how that affects highlighting.
            token.immediate(choice(
                'r', 'n', 't', '0', '"', '\\',
            )),
        ),
        
        // [[file:noir_grammar.org::raw_str]]
        raw_str_literal: $ => seq(
            $._raw_str_literal_start,
            alias($._raw_str_literal_content, $.str_content),
            $._raw_str_literal_end,
        ),
        
        // [[file:noir_grammar.org::fmt_str]]
        fmt_str_literal: $ => seq(
            'f"',
            repeat(alias($.fmt_str_content, $.str_content)),
            token.immediate('"'),
        ),
        // [[file:noir_grammar.org::fmt_str_content]]
        fmt_str_content: _ => /[\x20-\x21\x23-\x7E\s]+/,
        
        // [[file:noir_grammar.org::quote]]
        quote_literal: _ => seq(
            // TODO: Stubbed for now, see org doc.
            'quote',
            '{',
            /.*/,
            '}',
        ),
        
        // [[file:noir_grammar.org::comment]]
        comment: $ => choice(
            $.line_comment,
            $.block_comment,
        ),
        
        // [[file:noir_grammar.org::line_comment__doc_style__inner]]
        __inner_line_comment_doc_style: _ => token.immediate(prec(2, '!')),
        // [[file:noir_grammar.org::line_comment__doc_style__outer]]
        __outer_line_comment_doc_style: _ => token.immediate(prec(2, '/')),
        // [[file:noir_grammar.org::line_comment__doc_style]]
        __line_comment_doc_style: $ => choice(
            alias($.__inner_line_comment_doc_style, $.inner_doc_style),
            alias($.__outer_line_comment_doc_style, $.outer_doc_style),
        ),
        // [[file:noir_grammar.org::line_comment]]
        line_comment: $ => seq(
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
        
        // [[file:noir_grammar.org::block_comment__doc_style]]
        __block_comment_doc_style: $ => choice(
            alias($.__inner_block_comment_doc_style, $.inner_doc_style),
            alias($.__outer_block_comment_doc_style, $.outer_doc_style),
        ),
        // [[file:noir_grammar.org::block_comment]]
        block_comment: $ => seq(
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
        
        // [[file:noir_grammar.org::path]]
        __path: $ => choice(
            'TODO_____PATH_STUB_ALPHA',
            'TODO_____PATH_STUB_BETA',
        ),
        // [[file:noir_grammar.org::path_no_turbofish]]
        __path_no_turbofish: $ => seq(
            optional($.path_kind),
            $.__path_no_kind_no_turbofish,
        ),
        // [[file:noir_grammar.org::path_no_turbofish__nested_scopes]]
        __nested_scopes_in_path_no_turbofish: $ => seq(
            field('scope', $.__path_no_kind_no_turbofish),
            '::',
            field('name', $.identifier),
        ),
        // [[file:noir_grammar.org::path_no_kind_no_turbofish]]
        __path_no_kind_no_turbofish: $ => seq(
            choice(
                choice($.crate, $.dep, $.super, $.identifier),
                // $.identifier,
                alias($.__nested_scopes_in_path_no_turbofish, $.path),
            ),
        ),
        
        // [[file:noir_grammar.org::path_kind]]
        path_kind: $ => seq(
            choice($.crate, $.dep, $.super),
            '::',
        ),
        
        // [[file:noir_grammar.org::identifier]]
        identifier: _ => /[a-zA-Z_][a-zA-Z0-9_]*/,

        mut_bound: _ => 'mut',
        self: _ => 'self',

        crate: _ => 'crate',
        dep: _ => 'dep',
        super: _ => 'super',
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
