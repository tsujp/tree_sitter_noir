set dotenv-load

js_bin := 'bun'
# js_cmd := js_bin + ' ' + '--bun'
js_cmd := 'bun'

ts_bin := 'tree-sitter'
ts_abi := '15'
ts_cmd := js_cmd + ' ' + ts_bin

ts_lib_dir := justfile_directory() / env('TREE_SITTER_LIBDIR')


# Default path tree-sitter cli will place compiled parser library artefacts.
ts_lib_cache_dir := join(
    if env('XDG_CACHE_HOME', '') =~ '^/' {
        env('XDG_CACHE_HOME')
    } else {
        cache_directory()
    },
    'tree-sitter' / 'lib'
)

# JustFile Directory with Slash.
__jfds := justfile_directory() + '/'

# Absolute path to generated parser files tree-sitter creates.
gen_dir := justfile_directory() / 'src'

# Auto-generated bindings directory tree-sitter creates.
autogen_bind_dir := justfile_directory() / 'bindings'

# Auto-generated binding files tree-sitter creates.
autogen_bind_files := (
  'build.zig build.zig.zon ' +
  'Makefile CMakeLists.txt ' +
  'go.mod ' +
  'binding.gyp ' +
  'pyproject.toml setup.py ' +
  'Cargo.toml Cargo.lock ' +
  'Package.swift '
)

# Path node-gyp dumps it's build artefacts in.
node_gyp_dir := justfile_directory() / 'build'

# Path to node_modules
node_modules_dir := justfile_directory() / 'node_modules'


[private]
default:
    @just --justfile {{justfile()}} --list --list-heading $'Project commands:\n'

# Install package.json dependencies.
bootstrap:
    {{js_cmd}} install

# Shortcut to tree-sitter (cli) command, extra arguments passed as-is.
ts *args: sanity-check-ts-lib-cache
    {{ts_cmd}} {{args}}

# Generate, compile, and run all tests.
build _dbg='': (compile _dbg) (test _dbg)


@__ts_generate_cmd _with_debug='' _with_build='':
    @-mkdir {{gen_dir}}
    @cp -vpRP external_scanner.c {{gen_dir}}/scanner.c
    # The two if expressions respectively:
    #   (1) Add `--debug-build` flag if recipe received `--debug` as a parameter.
    #   (2) Add `--build` flag if receipe received `--build` as a parameter
    @{{ts_cmd}} generate --abi {{ts_abi}} --js-runtime {{js_bin}} \
        {{ if _with_debug == '--debug' { \
            '--debug-build --report-states-for-rule -' \
        } else { '' } }} \
        {{ if _with_build == '--build' { '--build' } else { '' } }}

# Generate (not compile) parser source from grammar DSL.
[group: 'build']
generate _dbg: sanity-check-ts-lib-cache && (__ts_generate_cmd _dbg)

# Compile generated parser to shared library.
[group: 'build']
compile _dbg: sanity-check-ts-lib-cache && (__ts_generate_cmd _dbg '--build')

# Delete all (non-binding) auto-generated files.
[group: 'build']
@clean:
    echo '{{BOLD + MAGENTA}}Removing generated parser...{{NORMAL}}'

    echo '--> {{YELLOW}}parser src dir:{{NORMAL}} {{__jfds + GREEN + trim_start_match(gen_dir, __jfds) + NORMAL}}    {{BOLD + BLACK}}(sanity: {{gen_dir}}){{NORMAL}}'
    -rm -r {{gen_dir}} 2> /dev/null

    echo '--> {{YELLOW}}parser lib dir:{{NORMAL}} {{__jfds + GREEN + trim_start_match(ts_lib_dir, __jfds) + NORMAL}}    {{BOLD + BLACK}}(sanity: {{ts_lib_dir}}){{NORMAL}}'
    -rm -r {{ts_lib_dir}} 2> /dev/null

# Clean and purge.
[group: 'build']
@clean-all: clean purge


# lib.c and friends:  node_modules/tree-sitter/vendor/tree-sitter/lib/src
# api.h header:       node_modules/tree-sitter/vendor/tree-sitter/lib/include/tree_sitter
mk_ts_lib_base := join(node_modules_dir, 'tree-sitter' / 'vendor' / 'tree-sitter' / 'lib')

# Debug parser execution using the gdb command-line debugger.
[group: 'debug']
debug: (generate '--debug')
    echo 'bingbong'

# Debug parser execution using the tree-sitter-cli's debug logging flags.
[group: 'debug']
debug-log:
    echo 'foo'


# Test all parser functionality: parse, tags, highlight.
[group: 'test']
test _dbg='' *args: sanity-check-ts-lib-cache
    {{ts_cmd}} test --stat=all --show-fields \
        {{ if _dbg == '--debug' { '--debug' } else { '' } }} \
        {{args}}

[group: 'test']
fuzz: sanity-check-ts-lib-cache
    {{ts_cmd}} fuzz --edits 20 --iterations 20

# # Test parser against `corpus` (parse).
# [group: 'test']
# test-parse:
#     # Here and elsewhere: simplest way to narrow test areas down, tree-sitter CLI should really let us specify certain areas ourselves optionally.
#     {{ts_cmd}} test --include ':P:$'

# # Test parser against `tags` (capture).
# [group: 'test']
# test-tags:
#     {{ts_cmd}} test --include ':T:$'

# # Test parser against `highlight` (syntax highlight).
# [group: 'test']
# test-highlight:
#     {{ts_cmd}} test --include ':H:$'

# # Test parser generally works against gamut of language vocabulary.
# [group: 'test']
# test-vocab:
#     @echo 'Weak test that parser is /generally/ error-free'
#     {{ts_cmd}} parse --quiet --stat ./test/vocab/*.nr


# Delete all auto-generated tree-sitter bindings, and installed dependencies.
[group: 'binding']
@purge:
    echo '{{BOLD + MAGENTA}}Removing auto-generated bindings, and installed dependencies...{{NORMAL}}'

    echo '--> {{YELLOW}}bindings dir:{{NORMAL}} {{__jfds + GREEN + trim_start_match(autogen_bind_dir, __jfds) + NORMAL}}    {{BOLD + BLACK}}(sanity: {{autogen_bind_dir}}){{NORMAL}}'
    -rm -r {{autogen_bind_dir}} 2> /dev/null

    echo '--> {{YELLOW}}bindings in:{{NORMAL}} {{trim_end_match(__jfds, "/")}}'
    # The only way to get around needing to call a Just function and also surrounding it with {} for shell brace expansion.
    @-rm -f {{join(__jfds, '{' + replace(trim(autogen_bind_files), " ", ",") + '}')}}

    echo '--> {{YELLOW}}node_modules:{{NORMAL}} {{__jfds + GREEN + trim_start_match(node_modules_dir, __jfds) + NORMAL}}    {{BOLD + BLACK}}(sanity: {{node_modules_dir}}){{NORMAL}}'
    -rm -rf {{node_modules_dir}} 2> /dev/null

    # node-gyp build directory.
    echo '--> {{YELLOW}}node-gyp dir:{{NORMAL}} {{__jfds + GREEN + trim_start_match(node_gyp_dir, __jfds) + NORMAL}}    {{BOLD + BLACK}}(sanity: {{node_gyp_dir}}){{NORMAL}}'
    @-rm -rf {{node_gyp_dir}} 2> /dev/null

# Generate (and update) language bindings.
[confirm]
[group: 'binding']
binding:
    {{ts_cmd}} init --update


# Update tree-sitter-cli to latest version.
[group: 'dependencies']
update:
    {{js_cmd}} update --force --latest


[private]
@sanity-check-ts-lib-cache:
    echo '--> {{YELLOW}}tree-sitter lib cache contents at:{{NORMAL}} {{ts_lib_cache_dir}}'
    -ls {{ts_lib_cache_dir}}

# TODO: Maybe use watchman and write some lisp to interface with it.
# TODO: Maybe a watch command later, maybe not.
# watch:
#    watchexec 'just generate && just compile && just test'

# clear; just generate && just compile && just ts test --stat=all --show-fields
