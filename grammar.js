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

module.exports = grammar({
  name: 'noir',

    rules: {
        source_file: $ => repeat($._definition),

        _definition: $ => choice(
            $.function_definition
        ),

        // Function definition canonical: https://github.com/noir-lang/noir/blob/d4e03d0/compiler/noirc_frontend/src/parser/parser/function.rs#L19-L52
        // TODO: Complete coverage.
        function_definition: $ => seq(
            // TODO: Attributes; modifiers.
            'fn',
            $.identifier,
            // TODO: Generics.
            $.parameter_list,
            // TODO: Function return type.
            $.block
        ),

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
