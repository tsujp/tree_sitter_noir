js_bin := 'bun'
ts_bin := 'tree-sitter'
ts_abi := '14'

# No template strings in `just` currently.
ts_cmd := trim_start(js_bin + " " + ts_bin)

# Install package.json dependencies.
bootstrap:
    {{js_bin}} install

# Generate parser from grammar DSL.
generate:
    {{ts_cmd}} generate --no-bindings --abi {{ts_abi}}

# Compile generated parser to loadable library.
compile:
    {{ts_cmd}} build

# Test parser against specs in corpus.
test:
    {{ts_cmd}} test
