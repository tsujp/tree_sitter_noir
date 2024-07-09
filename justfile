ts_bin := "bun tree-sitter"
ts_abi := "14"

# Generate parser from grammar DSL.
generate:
    {{ts_bin}} generate --no-bindings --abi {{ts_abi}}

# Compile generated parser to loadable library.
build:
    {{ts_bin}} build
