set dotenv-load
set shell := ['bash', '-uc']

js_bin := 'bun'
# js_cmd := js_bin + ' ' + '--bun'
js_cmd := 'bun'

ts_bin := 'tree-sitter'
ts_abi := '15'
ts_cmd := js_cmd + ' --silent ' + ts_bin

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
build _dbg='' *args: (compile _dbg) (test _dbg args)


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
generate _dbg='': sanity-check-ts-lib-cache && (__ts_generate_cmd _dbg)

# Compile generated parser to shared library.
[group: 'build']
compile _dbg='': sanity-check-ts-lib-cache && (__ts_generate_cmd _dbg '--build')

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
debug:
    gcc \
    -g -O0 \
    -I{{mk_ts_lib_base}}/include/tree_sitter \
    -I{{mk_ts_lib_base}}/src \
    {{mk_ts_lib_base}}/src/lib.c \
    -I{{gen_dir}} \
    {{gen_dir}}/parser.c \
    {{gen_dir}}/scanner.c \
    -o sample \
    debug_parser.c

# Debug parser execution using the tree-sitter-cli's debug logging flags.
[group: 'debug']
debug-log *args: (build '--debug' args)

# Find probably EBNF comments in Noirc sources.
[group: 'debug']
fd-ebnf rule *args:
    ugrep -r '///.*{{rule}}' -t rust noir -n {{args}}

# Run ugrep over Noirc sources, searching for a fixed string.
[group: 'debug']
fd term *args:
    ugrep -r -F {{quote(term)}} -t rust noir -n {{args}}

# Parse a test case and display it's CST.
[group: 'debug']
@parse test_number='':
    # Running test command since it's the easiest way to get the list of test cases as tree-sitter would render them versus constructing that list ourselves.
    {{ if test_number == '' { \
        'NO_COLOR=1 ' + ts_cmd + ' test --overview-only |' + \
        ''' \
        awk '$1 ~ /[0-9]/ { $2=""; print $0 }' | \
        fzy --show-info --lines=20 | \
        tee /dev/tty | \
        cut -f1 -d '.' \
        ''' \
    } else { \
        'echo ' + test_number \
    } }} | xargs {{ts_cmd}} parse --cst --test-number

# Parse a given Noir source file.
[group: 'debug']
@parse-file file_path='':
    # Running test command since it's the easiest way to get the list of test cases as tree-sitter would render them versus constructing that list ourselves.
    {{ if file_path == '' { \
        ''' \
        find noir/noir_stdlib/src -name *.nr | \
        fzy --show-info --lines=20 | \
        tee /dev/tty \
        ''' \
    } else { \
        'echo ' + file_path \
    } }} | xargs {{ts_cmd}} parse --quiet --stat --time --cst

# Print the file CST of the next error in gamut of Noir vocabulary files.
# [group: 'debug']
# @parse-error:
#     echo '{{BOLD + MAGENTA}}Reporting first parse error (if any)...{{NORMAL}}'
#     rg -m1 'foo' \
#       --no-line-number --only-matching \
#       <(sleep 1; echo 'foo'; sleep 1; echo 'foo'; sleep 1; echo 'done'); kill "$!"

# Print the file CST of the next error in gamut of Noir vocabulary files.
[group: 'debug']
[no-exit-message]
@parse-error:
    # Need to force stderr onto stdout via 2>&1 because Bun has default stderr output for the status of the command 'error: "tree-sitter" exited with code 1' and that output coming over stderr does something wacky to calling shell whereby arrow keys etc produce escape sequences now. Passing --silent to bun fixes it, as does this stderr/out merge approach.
    echo '{{BOLD + MAGENTA}}Reporting first parse error (if any)...{{NORMAL}}'

    # 0 = file ; 1 = starting line ; 2 = column in starting line ; 3, 4 = but for ending line
    declare -i ctx_lns=5; \
    \
    readarray -t err_info <<< "$(\
      rg -m1 --engine=auto '(.*?)[\s]+Parse.*ERROR \[(\d+),\s(\d+)\]\s-\s\[(\d+),\s(\d+)\]' \
        --color never --no-line-number --only-matching --replace=$'$1\n$2\n$3\n$4\n$5' \
        <(just --justfile {{justfile()}} test-vocab); kill "$!" \
        )" \
      && \
    \
    printf -- '--> {{YELLOW}}CST slice{{NORMAL}}\n'; \
    just --justfile {{justfile()}} parse-file "${err_info[0]}" 2> /dev/null | \
      rg --engine=auto -C5 "(${err_info[1]}|${err_info[3]}):" \
      && \
    \
    (( err_info[1]++ )); \
    (( err_info[3]++ )); \
    \
    declare -a slice_range; \
      slice_range[0]=$(( err_info[1] + ctx_lns )); \
      slice_range[1]=$(( err_info[3] < ctx_lns ? 0 : err_info[3] - ctx_lns )); \
    \
    printf -- '\n--> {{YELLOW}}Source code slice{{NORMAL}}    {{BOLD + BLACK}}(sanity: %s < (%s - %s) < %s){{NORMAL}}\n' "${slice_range[0]}" "${err_info[1]}" "${err_info[3]}" "${slice_range[1]}"; \
    sed "$(( 1 + ctx_lns )),$(( 1 + ctx_lns + err_info[3] - err_info[1] )) \
        s/^\(.*\)$/{{RED}}\1{{NORMAL}}/" \
          <(head -n +"${slice_range[0]}" "${err_info[0]}" | tail -n +"${slice_range[1]}") \
      && \
    \
    printf -- '\n--> {{YELLOW}}Locus{{NORMAL}}\n%s\t%s,%s - %s,%s\n' "${err_info[@]}"
# echo "$err_info" | cut -f1 -d$'\t' | xargs just --justfile {{justfile()}} parse-file
# grep 'foo' -m1 <((sleep 5); sleep 1; echo 'foo'; sleep 1; echo 'foo'; sleep 1; echo 'done') && kill "$!"
# (.*?)[\s]+Parse.*ERROR \[(\d+),\s(\d+)\]\s-\s\[(\d+),\s(\d+)\]
# just test-vocab | ugrep -m1 -P 'ERROR \[(\d+),\s(\d+)\]\s-\s\[(\d+),\s(\d+)\]' --format='%1:%2 - %3:%4'


# Test all parser functionality: parse, tags, highlight.
[group: 'test']
test _dbg='' *args: sanity-check-ts-lib-cache
    {{ts_cmd}} test --stat=all --show-fields \
        {{ if _dbg == '--debug' { '--debug' } else { _dbg } }} \
        {{args}}

# Test parser generally works against gamut of language vocabulary.
[group: 'test']
@test-vocab:
    echo '{{BOLD + MAGENTA}}Nargo sanity check Noir stdlib syntax...{{NORMAL}}'
    cd noir/noir_stdlib; nargo check --silence-warnings && echo 'ok'

    echo '{{BOLD + MAGENTA}}Parse with tree-sitter...{{NORMAL}}'
    find noir/noir_stdlib/src -name *.nr | xargs {{ts_cmd}} parse --quiet --stat --time
    # TODO JORDAN: Two commands from same stdout (file list) then interweave results for line count since noir parser doesnt spit that out (or make a PR for nargo that spits out the line count for the file since that's kinda important).
    #find noir/noir_stdlib/src -name *.nr | tee >(wc -l) | xargs {{ts_cmd}} parse --quiet --stat --time

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
[group: 'build']
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
