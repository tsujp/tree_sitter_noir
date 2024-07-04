# Tree Sitter Noir

## Files

Currently the `tree-sitter` CLI creates a lot of autogenerated files at the repo root, options to configure another directory are not properly respected. Until that is fixed upstream beware that only the following files are sources of truth with all else autogenerated (and overwritten):

TODO: Put other oracle files here.

```txt
grammar.js
```


## Tests

TODO: All possible (valid) noir syntax combinations with parse tree assertions.

TODO: Parse all of noir_stdlib in repo noir-lang/noir but without asserting the structure of the parse tree, only that it does not error. Otherwise would have to add manual parse tree for every single line of code in noir_stdlib. Maybe the stuff in test_programs of that repo too?

TODO: Track issues on repo noir-lang/noir which will change language syntax, collab with Aztec?

^^ examples include lowercase keyword for `field` instead of current `Field`: https://github.com/noir-lang/noir/pull/3631

^^ new `unsafe` keyword?: https://github.com/noir-lang/noir/pull/4429

Existing vscode-noir textmate syntax issues:

`fmtstr` broken: https://github.com/noir-lang/vscode-noir/issues/50

textmate grammar: https://github.com/noir-lang/vscode-noir/blob/master/syntaxes/noir.tmLanguage.json


## Queries

### Formatting

TODO: When its time for this mimic the canonical formatting as described in tooling/nargo_fmt/tests of repo noir-lang/noir, maybe some collab with Noir people too.


## Misc (temporary dumping ground)

--- noirc compiler internals:


ASTs at:
https://github.com/noir-lang/noir/tree/master/compiler/noirc_frontend/src/ast


Lexer token definitions:
https://github.com/noir-lang/noir/blob/master/compiler/noirc_frontend/src/lexer/token.rs


Lexer-proper:
https://github.com/noir-lang/noir/blob/master/compiler/noirc_frontend/src/lexer/lexer.rs


Type check errors at:
https://github.com/noir-lang/noir/blob/master/compiler/noirc_frontend/src/hir/type_check/errors.rs


Interesting noirc_frontend debug stuff:
https://github.com/noir-lang/noir/blob/c2eab6f4eb1437c16a0bad8cfca4634991df31c7/compiler/noirc_frontend/src/debug/mod.rs#L200-L211

Mentions cancer syntax like: `let (((a,b,c),D { d }),e,f) = x;` being translated automatically, so we can write such cancer let bindings? So this parser needs to account for that too?


--- Scratch notes:

- Zed for some general highlighting grammars, queries etc (for other projects).
- That guy that maintains 250 neovim treesitter languages or whatever, any stuff there?
- Zed blog has some nice posts about TS.

- The tree-sitter CLI is creates A LOT of binding-file spam at the root of the directory and currently does not respect paths to place these elsewhere. Very annoying indeed. As and when that's fixed (upstream) clean up repo root and what not. Relevant issues for this:
  - https://github.com/tree-sitter/tree-sitter/issues/3415
  - https://github.com/tree-sitter/tree-sitter/issues/3300
  - https://github.com/tree-sitter/tree-sitter/issues/930


--- Random down-the-rabbit-hole ideas:

- Use rust's tree-sitter parser to parse noir's lexer tokens file and watch for changes in keywords as a form of weak automation concerning keyword changes and what not? Not fool-proof but one component along the line of keeping things in-sync.

- Generate textmate grammar from tree-sitter grammar?
