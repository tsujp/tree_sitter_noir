# build with:
tree-sitter generate -0 && tree-sitter build --debug && gcc -g -O0 -I/usr/include/tree_sitter -I"$(pwd)"/src /usr/lib64/libtree-sitter.so "$(pwd)"/parser.so scanner_debug.c
