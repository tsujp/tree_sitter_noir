# TODO: Perhaps go back to Makefile with scripts? Cannot construct recipe names, cannot have optional parameter flags only required arguments, cannot invoke another recipe from within justfile unless it's a dependency, crazy plans to implement rust cpython runtime (why choose a language with the WORST syntax). You had so much potential just. Sigh.

set dotenv-load

js_bin := 'bun'
ts_bin := 'tree-sitter'
ts_abi := '14'

# No template strings in `just` currently.
ts_cmd := trim_start(js_bin + " " + ts_bin)

# TODO: Maybe contribute to just to remove this annoying `(no group)`.
[private]
default:
    @just --list --unsorted --list-heading $'\nProject commands:\n'

# Install package.json dependencies.
bootstrap:
    {{js_bin}} install

# Generate (not compile) parser from grammar DSL.
[group('Building')]
generate:
    {{ts_cmd}} generate --no-bindings --abi {{ts_abi}}

# Compile generated parser to loadable library.
[group('Building')]
compile:
    {{ts_cmd}} build

# Test all parser functionality: parse, tags, highlight.
[group('Testing')]
test:
    {{ts_cmd}} test

# Test parser against `corpus` (parse).
[group('Testing')]
test-parse:
    # Here and elsewhere: simplest way to narrow test areas down, tree-sitter CLI should really let us specify certain areas ourselves optionally.
    {{ts_cmd}} test --include ':P:$'

# Test parser against `tags` (capture).
[group('Testing')]
test-tags:
    {{ts_cmd}} test --include ':T:$'

# Test parser against `highlight` (syntax highlight).
[group('Testing')]
test-highlight:
    {{ts_cmd}} test --include ':H:$'

# Test parser generally works against gamut of language vocabulary.
[group('Testing')]
test-vocab:
    @echo 'Weak test that parser is /generally/ error-free'
    {{ts_cmd}} parse --quiet --stat ./test/vocab/*.nr

# Generate, compile, and run all tests.
build: generate compile test

# TODO: Maybe use watchman and write some lisp to interface with it.
# TODO: Maybe a watch command later, maybe not.
# watch:
#    watchexec 'just generate && just compile && just test'
