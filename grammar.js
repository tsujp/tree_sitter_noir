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

    // TODO: What else for these extras?
    extras: ($) => [
        /\s/,
        $.line_comment,
    ],

    // TODO: Need to document (for myself) keyword extraction to check we're doing it properly.
    word: ($) => $.identifier,

    rules: {
        // Noirc: Module -- top-level AST node is really Program but it immediately wraps Module.
        source_file: ($) => repeat($._statement),

        _statement: ($) => choice($._expression_statement, $._declaration_statement),

        _expression_statement: ($) => seq($._expression, ';'),
        _declaration_statement: ($) => choice($.function_definition),

        _expression: ($) => 'foo',

        // TODO: Consider all Noirc 'statements' except we enforce trailing semicolon where required? Or just have a statements section idk yet.
        

        // * * * * * * * * * * * * * * * * * * * * * * * * * DECLARATIONS

        // Noirc: ItemVisibility.
        visibility_modifier: ($) => seq('pub', optional('(crate)')),
        
        // Noirc: Visibility.
        visibility: ($) => optional(choice(
            'pub',
            'return_data',
            seq('call_data(', $.int_literal ,')'),
        )),
        
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
        
        line_comment: ($) => token(seq(
            '//',
            /.*/,
        )),
        
        block_comment: ($) => 'BLOCK_COMMENT___TODO',
        
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
