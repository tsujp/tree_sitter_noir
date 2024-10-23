const REG_ALPHABETIC = /[a-zA-Z]/
const REG_NUMERIC = /[0-9]/
const REG_ASCII_PUNCTUATION = /[!"#$%&'()*+,\-./:;<=>?@\[\\\]^_`\{|\}~]/

// Keywords
const KEYWORDS = {
    Fn: 'fn',
    Pub: 'pub',
    Unconstrained: 'unconstrained',
    Comptime: 'comptime',
}

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
    'i64',
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
const SECONDARY_ATTRIBUTES = ['deprecated', 'contract_library_method', 'abi', 'export']

// TODO: Code whitespace is \t \n \r and literal space.
// TODO: Whitespace attributes like #[bing bong] are valid.. cancer. What does the canonical noir compiler think the attribute is called? `bing bong`?
// Keyword::Pub

module.exports = grammar({
    name: 'noir',

    extras: ($) => [/\s/],

    word: ($) => $.identifier,

    rules: {
        // Conceptually a `program` (in Noir's parser parlance).
        source_file: ($) => repeat($._definitions),

        // Conceptually a `module` (in Noir's parser parlance).
        // Can contain any top-level-statement and other modules.
        _definitions: ($) => choice($.function_definition, $.attribute),

        // * * * * * * * * * * * * * * * * * * * * * * * * * TOP-LEVEL-STATEMENTS

        // TODO: Complete coverage.
        function_definition: ($) =>
            seq(
                // TODO: Attributes.
                optional($.function_modifiers),
                // optional($.visibility_modifier),
                'fn',
                field('name', $.identifier),
                // TODO: Generics.
                $.parameter_list,
                // TODO: Function return type.
                $.block,
            ),

        // TODO: Logic for `pub crate`.
        // visibility_modifier: ($) => choice('pub'),

        // TODO: Make this a granular list instead of all leaf nodes currently being anonymous?
        // TODO: Comptime still part of Noir?
        // TODO: Is comptime function-specific? I don't think it is.
        // TODO: Need to enforce the order of this.
        // function_modifiers: ($) => repeat1(choice('unconstrained', 'comptime')),

        // OPT: I personally don't think tree-sitter should report back a syntax tree as being correct if it isn't, and there's currently no easy way to have epsilon rules (save maybe a custom scanner). Look into this later. Other major languages like Rust don't have this in their tree-sitter grammar either, so for example: `pub unsafe async fn main()` is _invalid_ Rust syntax but tree-sitter will parse that and produce a CST without an error node, the correct form is `pub async unsafe fn main()` which tree-sitter also parses (this time correctly) to a CST without an error node.
        function_modifiers: ($) => repeat1(choice(KEYWORDS.Unconstrained, KEYWORDS.Pub, KEYWORDS.Comptime)),

        parameter_list: ($) =>
            seq(
                '(',
                // TODO: Parameters.
                ')',
            ),

        // TODO: Does Noir support empty blocks?
        block: ($) =>
            seq(
                '{',
                // repeat($._statement),
                '}',
            ),

        attribute: ($) =>
            seq(
                '#',
                '[',
                // TODO: It's actually a lot more lenient, replace with other regex later.
                // TODO: Ask upstream if they intend for satanic attribute definitions.
                // TODO: Splits on ( and ) and that being sub-tokens.
                // TODO: Does Noir call attribute 'names' as 'paths'?
                alias(repeat1(choice(' ', REG_ALPHABETIC, REG_NUMERIC, REG_ASCII_PUNCTUATION)), $.path),
                ']',
            ),

        // TODO: When mostly done see if this is generic or specific to attributes, i.e. rename to just `path` and remove all the aliases elsewhere?
        // TODO: Come back to a field name for this later when what's going on with attributes is more locked down.
        attribute_path: ($) => seq(repeat1(choice(' ', REG_ALPHABETIC, REG_NUMERIC, REG_ASCII_PUNCTUATION))),

        // _statement: $ => choice(
        //     $.return_statement
        //     // TODO: Other statements.
        // ),

        // TODO: Change this to explicit or implicit return statement (with or without return keyword) as well as `;` affecting returning a value or not.
        // return_statement: $ => seq(
        // ),

        // Currently this is the canonical identifier representation.
        identifier: ($) => /[a-zA-Z_][a-zA-Z0-9_]*/,
    },
})
