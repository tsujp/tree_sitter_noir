const REG_ALPHABETIC = /[a-zA-Z]/
const REG_NUMERIC = /[0-9]/
const REG_ASCII_PUNCTUATION = /[!"#$%&'()*+,\-./:;<=>?@\[\\\]^_`\{|\}~]/

// Noir no longer allows arbitrarily-sized integers. Also, `U128` is a struct not a numeric type.
const NUMERIC_TYPES = [
    // Signed.
    'u1',
    'u8',
    'u32',
    'u64',
    // Unsigned
    'i1',
    'i8',
    'i32',
    'i64'
]

// TODO: Attributes have some further captures in the Noir lexer, e.g. `foreign` captures a name afterwards. So do that also (and for the secondary attributes).
// Functions can only have one primary attribute.
const PRIMARY_ATTRIBUTES = [
    'foreign',
    'builtin',
    'oracle',
    'test',
    'recursive',
    'fold',
    'no_predicates',
    'test',
    'field',
]

// Functions can have any number of secondary attributes.
const SECONDARY_ATTRIBUTES = [
    'deprecated',
    'contract_library_method',
    'abi',
    'export',
]

// TODO: Code whitespace is \t \n \r and literal space.
// TODO: Whitespace attributes like #[bing bong] are valid.. cancer. What does the canonical noir compiler think the attribute is called? `bing bong`?
// Keyword::Pub

module.exports = grammar({
  name: 'noir',

    rules: {
        source_file: $ => repeat($._definition),

        _definition: $ => choice(
            $.function_definition,
            $.attribute,
        ),

        // Function definition canonical: https://github.com/noir-lang/noir/blob/d4e03d0/compiler/noirc_frontend/src/parser/parser/function.rs#L19-L52
        // TODO: Complete coverage.
        function_definition: $ => seq(
            // TODO: Attributes.
            optional($.function_modifiers),
            optional($.visibility_modifier),
            'fn',
            $.identifier,
            // TODO: Generics.
            $.parameter_list,
            // TODO: Function return type.
            $.block
        ),

        // TODO: Logic for `pub crate`.
        visibility_modifier: $ => choice(
            'pub'
        ),

        // TODO: Comptime.
        function_modifiers: $ => repeat1(choice(
            'unconstrained'
        )),

        // Hi, there hi asd
        parameter_list: $ => seq(
            '(',
            // TODO: Parameters.
            ')'
        ),

        // TODO: Does Noir support empty blocks?
        block: $ => seq(
            '{',
            // repeat($._statement),
            '}'
        ),

        attribute: $ => seq(
            '#',
            '[',
            // TODO: It's actually a lot more lenient, replace with other regex later.
            // TODO: Ask upstream if they intend for satanic attribute definitions.
            // TODO: Splits on ( and ) and that being sub-tokens.
            repeat1(choice(
                ' ',
                REG_ALPHABETIC,
                REG_NUMERIC,
                REG_ASCII_PUNCTUATION,
            )),
            ']',
        ),

        // _statement: $ => choice(
        //     $.return_statement
        //     // TODO: Other statements.
        // ),

        // TODO: Change this to explicit or implicit return statement (with or without return keyword) as well as `;` affecting returning a value or not.
        // return_statement: $ => seq(
        // ),

        // Currently this is the canonical identifier representation.
        identifier: $ => /[a-zA-Z_][a-zA-Z0-9_]*/
  }
});
