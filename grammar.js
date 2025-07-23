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
    // Term and children.
    call: 20,
    access: 19,
    cast: 18,
    index: 17,
    // From EqualOrNotEqualExpression before it eventually calls to Term (latter thus /higher/ precedence).
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

    // Rule names tree-sitter will automatically inline at their callsites when generating the parser. Unlike anonymous CST nodes these will then NEVER result in a CST node.
    inline: ($) => [
        $.identifier_or_path,
        $.identifier_or_path_no_turbofish,
        $.tmp__let_to_type,
    ],

    // TODO: Conflicts as-is work but is this the best way? It's mostly around Path.
    conflicts: ($) => [
        [$._type, $.__atom_type_expr],
        [$.path, $.__path_no_turbofish],
        // XXX: slice_expression is causing unresolved sequences error because the '&' of the slice sequence is also a character in binary expression. No attempt to set precedences worked and had to add conflict. This feels wrong.. try and fix without a conflict later?
        // [nil, $.__literal],
        // XXX: Temporary or required?
        [$.function_item_modifiers, $.global_item_modifiers],
        // XXX: Temporary or required? When adding generic_type to Type AST.
        [$._type, $.generic],
    ],

    // TODO: Need to document (for myself) keyword extraction to check we're doing it properly.
    word: ($) => $.identifier,

    rules: {
        // Noirc: Module -- top-level AST node is really Program but it immediately wraps Module.
        source_file: ($) => repeat($._module),

        // Can statement-ise anything so we'll use this as top-level.
        // _statement: ($) => choice($._expression_statement, $._declaration_statement),
        // _expression_statement: ($) => seq($._expression, ';'),
        _module: ($) => choice($._top_level_item),

        // Noirc: Module -- Since doc comments can appear anywhere, Module is Item which is ItemKind.
        _top_level_item: ($) => choice(
            $.attribute_item,
            $.use_item,
            $.module_or_contract_item,
            $.struct_item,
            $.impl_item,
            $.trait_item,
            $.global_item,
            $.type_item,
            $.function_item,
        ),

        item_list: ($) => seq(
            '{',
            repeat($._top_level_item),
            '}',
        ),

        // * * * * * * * * * * * * * * * * * * * * * * * * * DECLARATIONS / DEFINITIONS / ITEMS
        
        // [[file:noir_grammar.org::item_visibility]]
        visibility_modifier: $ => seq('pub', optional('(crate)')),
        
        // [[file:noir_grammar.org::visibility]]
        visibility: $ => choice(
            'pub',
            'return_data',
            seq('call_data', '(', $.int_literal ,')'),
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
        use_item: $ => seq(
            optional($.visibility_modifier),
            'use',
            field('decl', $.__use_variants),
            ';',
        ),
        // [[file:noir_grammar.org::use_variants]]
        __use_variants: $ => choice(
            $.identifier,
            $.use_list,
            alias($.__use_variants_scoped, $.path),
        ),
        // [[file:noir_grammar.org::use_variants_scoped]]
        __use_variants_scoped: $ => seq(
            optional(
                field('scope', choice(
                    $.__use_variants,
                    $.__path_kind,
                ),
            )),
            choice(
                seq(
                    '::',
                    choice(
                        field('name', $.identifier),
                        field('list', $.use_list),
                    ),
                ),
                // Inlined Noirc UseTreeAs.
                seq(
                    'as',
                    field('alias', $.identifier),
                ),
            ),
        ),
        // [[file:noir_grammar.org::use_list]]
        use_list: $ => seq(
            '{',
            sepBy($.__use_variants, ','),
            optional(','),
            '}',
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
            field('type_parameters', optional($._generic_parameters)),
            choice(
                field('body', $.struct_field_list), // TODO: If this is similar to others, e.g. Impl or Enum we can reduce it to one.
                ';', // Empty struct.
            ),
        ),
        // [[file:noir_grammar.org::struct_field]]
        struct_field_item: $ => seq(
            // OuterDocComments are extras.
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
            field('type_parameters', optional($._generic_parameters)),
            // If this optional matches it's a TraitImpl, otherwise a TypeImpl.
            optional(seq(
                field('trait', choice(
                    $.identifier_or_path_no_turbofish,
                    $.generic,
                )),
                'for',
            )),
            field('type', $._type),
            optional($.where_clause),
            // TODO: Rename and reduce trait_impl_body rule name.
            field('body', $.trait_impl_body),
        ),
        // [[file:noir_grammar.org::trait_impl_body]]
        trait_impl_body: $ => seq(
            // TODO: Rename this CST rule?
            '{',
            // Inlined Noirc: TraitImplItem.
            repeat(choice(
                // OuterDocComments are extras.
                // Attributes only (strictly) associated with TraitImplFunction but that's too narrow for the raw grammar.
                $.attribute_item,
                $.trait_impl_type,
                alias($.trait_impl_constant, $.let_statement),
                $.function_item, // TraitImplFunction.
            )),
            '}',
        ),
        // [[file:noir_grammar.org::trait_impl_type]]
        trait_impl_type: $ => seq(
            // TODO: Rename this CST rule?
            'type',
            field('name', $.identifier),
            '=',
            // TODO: What name for this CST node? It's not an associated type surely?
            field('alias', $._type),
            ';',
        ),
        // [[file:noir_grammar.org::trait_impl_constant]]
        trait_impl_constant: $ => seq(
            // TODO: Rename this CST rule?
            'let',
            field('name', $.identifier),
            field('type', optional($._type_annotation)), // Inlined Noirc: OptionalTypeAnnotation.,
            '=',
            field('value', $._expression),
            ';',
        ),
        
        // [[file:noir_grammar.org::trait]]
        trait_item: $ => seq(
            optional($.visibility_modifier),
            'trait',
            field('name', $.identifier),
            field('type_parameters', optional($._generic_parameters)),
            field('bounds', optional($.trait_bounds)),
            optional($.where_clause),
            field('body', alias($.__trait_declaration_list, $.declaration_list)),
        ),
        // [[file:noir_grammar.org::trait_bounds]]
        trait_bounds: $ => seq(
            ':', // Common prefix reduction.
            sepBy1($.__trait_bound, '+'),
            // optional('+'), // TODO: I think not allowed, test compiler methods post-grammar.
        ),
        // [[file:noir_grammar.org::trait_bound]]
        __trait_bound: $ => choice(
            // TraitBound without generics associated.
            $.identifier_or_path_no_turbofish,
            // TraitBound with generics needs to be wrapped in a CST node.
            $.generic,
        ),
        // [[file:noir_grammar.org::trait_body]]
        __trait_declaration_list: $ => seq(
            '{',
            // OuterDocComments are extras.
            repeat(
                // Inlined Noirc: TraitItem.
                choice(
                    $.trait_type,
                    $.trait_constant,
                    $.trait_function,
                ),
            ),
            '}',
        ),
        // [[file:noir_grammar.org::trait_type]]
        trait_type: $ => seq(
            'type',
            field('name', $.identifier),
            ';',
        ),
        // [[file:noir_grammar.org::trait_constant]]
        trait_constant: $ => seq(
            $.tmp__let_to_type,
            optional(seq(
                '=', // We don't want '=' part of the CST node for the (default) value.
                field('value', $._expression),
            )),
            ';',
        ),
        // [[file:noir_grammar.org::trait_function]]
        trait_function: _ => 'TODO____TRAIT_FUNCTION__TEMP_COMMENT_IS_IT_SIMILAR_TO_NORMAL_FUNCTION',
        
        // [[file:noir_grammar.org::global]]
        global_item: $ => seq(
            optional($.visibility_modifier),
            optional(alias($.global_item_modifiers, $.modifiers)),
            'global',
            field('name', $.identifier),
            field('type', optional($._type_annotation)), // Inlined Noirc: OptionalTypeAnnotation.,
            '=',
            $._expression,
            ';',
        ),
        // [[file:noir_grammar.org::global_item_modifiers]]
        global_item_modifiers: _ => repeat1(choice(
            'mut',
            'comptime',
        )),
        
        // [[file:noir_grammar.org::type_alias]]
        type_item: $ => seq(
            'type',
            field('name', $.identifier),
            field('type_parameters', optional($._generic_parameters)),
            '=',
            field('type', $._type),
            ';',
        ),
        
        // [[file:noir_grammar.org::function]]
        function_item: $ => seq(
            optional($.visibility_modifier),
            optional(alias($.function_item_modifiers, $.modifiers)),
            'fn',
            field('name', $.identifier),
            field('type_parameters', optional($._generic_parameters)),
            field('parameters', $.parameters),
            field('return_type', optional($.return_type)),
            // TODO: Field name for where clause like on Traits and so forth?
            optional($.where_clause),
            // No optional body allowed at this locus.
            field('body', $.block),
        ),
        // [[file:noir_grammar.org::function_item_modifiers]]
        function_item_modifiers: _ => repeat1(choice(
            'comptime',
            'unconstrained',
        )),
        // [[file:noir_grammar.org::function_return_type]]
        return_type: $ => seq(
            '->',
            optional($.visibility),
            field('type', $._type),
        ),
        // [[file:noir_grammar.org::function_parameters]]
        parameters: $ => seq(
            '(',
            optional(seq(
                // Inlined Noirc: FunctionParametersList.
                sepBy1(choice(
                    alias($.function_parameter, $.parameter),
                    $.self_pattern,
                ), ','),
                optional(','),
            )),
            ')',
        ),
        // [[file:noir_grammar.org::function_parameter]]
        function_parameter: $ => seq(
            field('pattern', $._pattern),
            field('type', choice(
                $._type_annotation,
                $.visible_type,
            )),
        ),
        // [[file:noir_grammar.org::function_parameter_type]]
        visible_type: $ => seq(
            ':',
            $.visibility,
            $._type,
        ),
        
        // [[file:noir_grammar.org::where]]
        where_clause: $ => seq(
            'where',
            sepBy($.where_constraint, ','), // Inlined Noirc: WhereClauseItems.
            optional(',')
        ),
        // [[file:noir_grammar.org::where_clause]]
        where_constraint: $ => seq(
            field('type', $._type),
            field('bounds', $.trait_bounds),
        ),

        // * * * * * * * * * * * * * * * * * * * * * * * * * STATEMENT KINDS (AST)
        // TODO: Consider all Noirc 'statements' except we enforce trailing semicolon where required? Or just have a statements section idk yet.
        
        // [[file:noir_grammar.org::statement]]
        _statement: $ => seq(
            // TODO: Attributes.
            choice(
                // Inlined Noirc: StatementKind.
                $.break_statement,
                $.continue_statement,
                $.return_statement,
                $.let_statement,
                $.constrain_statement,
                $.comptime, // Inlined Noirc: ComptimeBlock.
                // Inlined Noirc: ComptimeStatement sans ComptimeBlock.
                alias($.comptime_statement__let_for, $.comptime),
                $.for_statement,
                $.if_expression,
                $.block,
                $.assign_statement,
                $.expression_statement,
            ),
        ),
        
        // [[file:noir_grammar.org::break_statement]]
        break_statement: _ => seq('break', ';'),
        // [[file:noir_grammar.org::continue_statement]]
        continue_statement: _ => seq('continue', ';'),
        // [[file:noir_grammar.org::return_statement]]
        return_statement: $ => seq('return', optional($._expression), ';'),
        // [[file:noir_grammar.org::let_statement]]
        let_statement: $ => seq(
            'let',
            optional($.mut_bound),
            field('pattern', $._pattern),
            field('type', optional($._type_annotation)), // Inlined Noirc: OptionalTypeAnnotation.,
            '=',
            field('value', $._expression),
            ';',
        ),
        // [[file:noir_grammar.org::constrain_statement]]
        constrain_statement: $ => seq(
            // XXX: Keyword 'constrain' is deprecated, we're not going to include it at all.
            // 'assert' expects 1 or 2 parameters, 'assert_eq' expects 2 or 3. This is out of scope for tree-sitter grammar (at least for now), if it's a boon without huge complexity the rules can be augmented to enforce this later.
            choice('assert', 'assert_eq'),
            field('arguments', $.arguments),
            ';',
        ),
        // [[file:noir_grammar.org::comptime_statement__let_for]]
        comptime_statement__let_for: $ => seq(
            'comptime',
            choice(
                $.let_statement, // Inlined Noirc: ComptimeLet.
                $.for_statement, // Inlined Noirc: ComptimeFor.
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
        // [[file:noir_grammar.org::assign_statement]]
        assign_statement: $ => seq(
            field('left', $._expression),
            choice(
                // Desugared (and limited) binary expression assignment, see: next_is_op_assign.
                '+=', '-=', '*=', '/=', '%=', '&=', '^=', '=',
                // Simple assignment.
                '=',
            ),
            field('right', $._expression),
            ';',
        ),
        // [[file:noir_grammar.org::expression_statement]]
        expression_statement: $ => seq($._expression, ';'),

        // * * * * * * * * * * * * * * * * * * * * * * * * * EXPRESSIONS
        
        // [[file:noir_grammar.org::expression]]
        _expression: $ => prec(1, choice(
            $.binary_expression,
            // Inlined Noirc: Atom.
            $.__literal,
              // Inlined Noirc: ParenthesesExpression.
              alias($.unit_type, $.unit_expression),
              $.parenthesized_expression,
              $.tuple_expression,
            $.unsafe,
              // Inlined Noirc: PathExpression.
              $.path, // Inlined Noirc: VariableExpression.
              $.struct_expression,
            $.if_expression,
            $.lambda,
            $.comptime,
            $.unquote_expression,
            // TypePathExpression is Path.
            alias($.trait_path_alias, $.path),
            // Blocked: ResolvedExpression, InternedExpression, InternedStatementExpression.
            // ---/ End: Atom.
            $.call_expression,
            $.access_expression,
            $.cast_expression,
            $.index_expression,
            // TODO: SURELY identifier is allowed in expression, where's the concrete evidence though? Assuming it is for now.
            $.identifier,
        )),
        
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
        
        // [[file:noir_grammar.org::block]]
        block: $ => seq(
            '{',
            repeat($._statement),
            optional($._expression),
            '}',
        ),
        
        // [[file:noir_grammar.org::call_expression]]
        call_expression: $ => prec(PRECEDENCE.call, seq(
            field('function', $._expression),
            field('arguments', $.__call_arguments),
        )),
        // [[file:noir_grammar.org::arguments]]
        arguments: $ => seq(
            '(',
            optional(seq(
                // Inlined Noirc: ArgumentsList.
                sepBy1($._expression, ','),
                optional(','),
            )),
            ')',
        ),
        // [[file:noir_grammar.org::call_arguments]]
        __call_arguments: $ => seq(
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
        
        
        // [[file:noir_grammar.org::member_access_expression]]
        access_expression: $ => prec(PRECEDENCE.access, seq(
            field('scope', $._expression),
            '.',
            field('name', $.identifier),
        )),
        // [[file:noir_grammar.org::cast_expression]]
        cast_expression: $ => prec(PRECEDENCE.cast, seq(
            field('value', $._expression),
            'as',
            field('type', $._type),
        )),
        // [[file:noir_grammar.org::index_expression]]
        index_expression: $ => prec(PRECEDENCE.cast, seq(
            field('collection', $._expression),
            '[',
            field('index', $._expression),
            ']',
        )),
        
        // Ordered as at Atom.
        
        // [[file:noir_grammar.org::parenthesised_expression]]
        parenthesized_expression: $ => seq('(', $._expression, ')'),
        
        // [[file:noir_grammar.org::tuple_expression]]
        tuple_expression: $ => seq(
            '(',
            // Required trailing colon to match.
            seq($._expression, ','),
            // Additional either includes trailing colon or doesn't.
            repeat(seq($._expression, ',')),
            optional($._expression),
            ')',
        ),
        
        // [[file:noir_grammar.org::unsafe_block]]
        unsafe: $ => seq('unsafe', $.block),
        // VariableExpression is Path (see elsewhere).
        
        // [[file:noir_grammar.org::constructor_expression]]
        struct_expression: $ => seq(
            field('name', $.identifier),
            field('body', alias($.constructor_body, $.initializer_list)),
        ),
        // [[file:noir_grammar.org::constructor_body]]
        constructor_body: $ => seq(
            '{',
            optional(seq(
                sepBy1(alias($.constructor_field, $.field_initializer), ','),
                optional(','),
            )),
            '}',
        ),
        // [[file:noir_grammar.org::constructor_field]]
        constructor_field: $ => choice(
            $.identifier,
            seq(
                field('field', $.identifier),
                ':',
                field('value', $._expression),
            ),
        ),
        
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
        
        // [[file:noir_grammar.org::lambda]]
        lambda: $ => seq(
            field('parameters', $.lambda_parameters),
            field('return_type', optional($.lambda_return_type)),
            field('body', $._expression),
        ),
        // [[file:noir_grammar.org::lambda_return_type]]
        lambda_return_type: $ => seq(
            '->',
            field('type', $._type),
        ),
        // [[file:noir_grammar.org::lambda_parameters]]
        lambda_parameters: $ => seq(
            '|',
            optional(seq(
                sepBy1(choice(
                    $._pattern,
                    alias($.lambda_parameter, $.parameter),
                ), ','),
                optional(','),
            )),
            '|',
        ),
        // [[file:noir_grammar.org::lambda_parameter]]
        lambda_parameter: $ => seq(
            field('pattern', $._pattern),
            field('type', $._type_annotation), // Inlined Noirc: OptionalTypeAnnotation (except required).
        ),
        
        // [[file:noir_grammar.org::comptime_block]]
        comptime: $ => seq('comptime', $.block),
        
        // [[file:noir_grammar.org::unquote_expression]]
        unquote_expression: $ => seq(
            '$',
            choice(
                $.path,
                seq('(', $._expression, ')'),
            ),
        ),
        
        // [[file:noir_grammar.org::trait_path_alias]]
        trait_path_alias: $ => seq(
            '<',
            field('type', $._type),
            'as',
            field('alias', $.__trait_bound),
            '>',
            '::',
            field('name', $.identifier),
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
            $.identifier_or_path_no_turbofish,
            // parser/types.rs:58-61
            $.generic,
        ),
        
        // [[file:noir_grammar.org::type_annotation]]
        _type_annotation: $ => seq(':', $._type),
        
        // [[file:noir_grammar.org::primitive_type]]
        primitive_type: $ => choice(
            $.__field_type,
            $.__integer_type,
            $.__bool_type,
            $.__string_type,
            $.__format_string_type,
            // TODO: ComptimeType (blocked for now).
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
        
        // [[file:noir_grammar.org::generics]]
        _generics: $ => seq(
            '<',
            optional(seq(
                sepBy1($.__generic, ','), // Inlined Noirc: GenericsList.
                optional(','),
            )),
            '>',
        ),
        // [[file:noir_grammar.org::generic]]
        __generic: $ => choice(
            $.identifier, // Inlined Noirc: VariableGeneric.
            $.constrained_type,
            // TODO: ResolvedGeneric IFF it even matters for CST.
        ),
        // [[file:noir_grammar.org::constrained_type]]
        constrained_type: $ => $.tmp__let_to_type,
        
        // [[file:noir_grammar.org::generic_type]]
        generic: $ => seq(
            field('trait', $.identifier_or_path_no_turbofish),
            field('type_parameters', $._generic_type_parameters),
        ),
        
        // [[file:noir_grammar.org::generic_type_args]]
        _generic_type_args: $ => seq(
            '<',
            optional(seq(
                sepBy1($.__generic_type_arg, ','), // Inlined Noirc: GenericTypeArgsList.
                optional(','),
            )),
            '>',
        ),
        // [[file:noir_grammar.org::generic_type_arg]]
        __generic_type_arg: $ => choice(
            $.associated_type,
            $.__ordered_type_arg,
        ),
        // [[file:noir_grammar.org::named_type_arg]]
        associated_type: $ => seq(
            field('name', $.identifier),
            '=',
            field('type', $._type),
        ),
        // [[file:noir_grammar.org::ordered_type_arg]]
        __ordered_type_arg: $ => $._type_or_type_expr,
        
        // 'TypeExpressions' are limited to constant integers, variables, and basic numeric binary operators; they are a special type that is allowed in the length position of an array (and some other limited places).
        // Using 'expr' in-place of 'expression' so-as-to- not conflate with _real_ expressions.
        
        // [[file:noir_grammar.org::type_or_type_expr]]
        _type_or_type_expr: $ => choice(
            $._type,
            $._type_expr,
        ),
        
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
            $.identifier_or_path, // Inlined Noirc: VariableTypeExpression.
            // TODO: Replace hardcoded rule name with noweb ref.
            alias($.__parenthesized_type_expr, $.parenthesized_expression),
        ),
        // [[file:noir_grammar.org::parenthesised_type_expr]]
        __parenthesized_type_expr: $ => seq('(', $._type_expr, ')'),

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
            optional($.mutable_modifier),
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

        // * * * * * * * * * * * * * * * * * * * * * * * * * TEMPLATES / MISC
        
        // Alias both Generic and GenericType parameters to a node of the same name.
        
        // [[file:noir_grammar.org::generic_parameters]]
        _generic_parameters: $ => alias($._generics, $.type_parameters),
        // [[file:noir_grammar.org::generic_type_parameters]]
        _generic_type_parameters: $ => alias($._generic_type_args, $.type_parameters),
        
        // [[file:noir_grammar.org::tmp__let_to_type]]
        tmp__let_to_type: $ => seq(
            'let',
            field('name', $.identifier),
            ':',
            field('type', $._type),
        ),

        // * * * * * * * * * * * * * * * * * * * * * * * * * LITERALS
        
        // [[file:noir_grammar.org::literal]]
        __literal: $ => prec(
            // Literals need to bind more tightly than Statement so things like SliceExpression are correctly associated. Since this is similar to Unary we use the same precedence level.
            PRECEDENCE.unary,
            choice(
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
        path: $ => seq(
            field('scope', choice(
                $.path,
                $.identifier,
                $.__path_kind,
            )),
            '::',
            choice(
                field('type_parameters', $._generic_type_parameters),
                field('name', $.identifier),
            ),
        ),
        // [[file:noir_grammar.org::identifier_or_path]]
        identifier_or_path: $ => choice(
            $.identifier,
            $.path,
        ),
        // [[file:noir_grammar.org::path_no_turbofish]]
        __path_no_turbofish: $ => seq(
            field('scope', choice(
                alias($.__path_no_turbofish, $.path),
                $.identifier,
                $.__path_kind,
            )),
            '::',
            field('name', $.identifier),
        ),
        // [[file:noir_grammar.org::identifier_or_path_no_turbofish]]
        identifier_or_path_no_turbofish: $ => choice(
            $.identifier,
            alias($.__path_no_turbofish, $.path),
        ),
        
        // [[file:noir_grammar.org::path_kind]]
        __path_kind: $ => choice($.crate, $.dep, $.super),
        
        // [[file:noir_grammar.org::identifier]]
        identifier: _ => /[a-zA-Z_][a-zA-Z0-9_]*/,
        
        // Modifiers except for visibility (in order).
        
        // [[file:noir_grammar.org::modifier_mut]]
        mutable_modifier: _ => 'mut',
        // [[file:noir_grammar.org::modifier_comptime]]
        comptime_modifier: _ => 'comptimez',
        // [[file:noir_grammar.org::modifier_unconstrained]]
        unconstrained_modifier: _ => 'unconstrained',

        // TODO: Delete mut_bound in favour of modifier_mut.
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
