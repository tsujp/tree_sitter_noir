set dotenv-load

js_bin := 'bun'
ts_bin := 'tree-sitter'
ts_abi := '15'

ts_cmd := js_bin + " " + ts_bin

[private]
default:
    @just --justfile {{justfile()}} --list --list-heading $'Project commands:\n'

# Install package.json dependencies.
bootstrap:
    {{js_bin}} install

# Generate (not compile) parser from grammar DSL.
[group: 'build']
generate:
    {{ts_cmd}} generate --abi {{ts_abi}} --js-runtime {{js_bin}}

# Compile generated parser to loadable library.
[group: 'build']
compile:
    {{ts_cmd}} build

# Test all parser functionality: parse, tags, highlight.
[group: 'test']
test:
    {{ts_cmd}} test

# Test parser against `corpus` (parse).
[group: 'test']
test-parse:
    # Here and elsewhere: simplest way to narrow test areas down, tree-sitter CLI should really let us specify certain areas ourselves optionally.
    {{ts_cmd}} test --include ':P:$'

# Test parser against `tags` (capture).
[group: 'test']
test-tags:
    {{ts_cmd}} test --include ':T:$'

# Test parser against `highlight` (syntax highlight).
[group: 'test']
test-highlight:
    {{ts_cmd}} test --include ':H:$'

# Test parser generally works against gamut of language vocabulary.
[group: 'test']
test-vocab:
    @echo 'Weak test that parser is /generally/ error-free'
    {{ts_cmd}} parse --quiet --stat ./test/vocab/*.nr

# Generate (and update) language bindings.
[group: 'binding']
binding:
    {{ts_cmd}} init --update

# Shortcut to tree-sitter command, extra arguments passed as-is.
ts *args:
    {{ts_cmd}} {{args}}

# Generate, compile, and run all tests.
build: generate compile test

# TODO: Maybe use watchman and write some lisp to interface with it.
# TODO: Maybe a watch command later, maybe not.
# watch:
#    watchexec 'just generate && just compile && just test'
