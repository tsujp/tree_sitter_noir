#include "tree_sitter/parser.h"
#include "tree_sitter/alloc.h"
#include "tree_sitter/array.h"


// Order must match that in grammar's `externals`, enumerants names need not match.
enum TokenType {
  BLOCK_COMMENT_CONTENT,
  INNER_BLOCK_COMMENT_DOC_STYLE,
  OUTER_BLOCK_COMMENT_DOC_STYLE,
};


// Called once when language set on a parser. Should create the scanner object, if scanner must maintain state allocate memory here. Fine to return NULL.
void * tree_sitter_noir_external_scanner_create() {
  // TODO
  return NULL;
}


// Called when parser is deleted or assigned to a different language. Should free any memory scanner is using. It receives the same pointer that was returned by the create function. If no state maintained this can be a no-op.
void tree_sitter_noir_external_scanner_destroy(void *payload) {
  // TODO
}


// Called every time scanner successfully recognises a token. Should copy complete state of scanner into given byte buffer and return number of bytes written. Max number of writable bytes in "parser.h" defined by TREE_SITTER_SERIALIZATION_BUFFER_SIZE.
unsigned tree_sitter_noir_external_scanner_serialize(
                                                     void *payload, // Pointer to scanner
                                                     char *buffer // Pointer to buffer
) {
  // This functions return data is stored in the CST so the scanner can be restored to the correct state when handling edits or ambiguities. So, be sure to store the entire state (and quickly).
  
  // TODO
  return 0;
}


void tree_sitter_noir_external_scanner_deserialize(
                                                   void *payload, // Pointer to scanner
                                                   const char *buffer, // Pointer to buffer
                                                   unsigned length // Number of bytes to read
) {
  // Similarly to serialize be sure to restore the entire state (and quickly). It's good practice to explicitly erase scanner state variables at the start of this function before restoring their values from the byte buffer.
  
  // TODO
}


static inline void advance(TSLexer *lexer) { lexer->advance(lexer, false); }

static inline void skip(TSLexer *lexer) { lexer->advance(lexer, true); }

static inline bool is_ascii(TSLexer *lexer) {
  return (0 <= lexer->lookahead && lexer->lookahead <= 127);
}

// Called with the parser cursor on the character immediately after the base block comment opening token: /*
static inline bool scan_block_comment(TSLexer *lexer, const bool *valid_symbols) {
  char first = (char)lexer->lookahead;

  // Matches: /*!
  //            ^
  if (valid_symbols[INNER_BLOCK_COMMENT_DOC_STYLE] && first == '!') {
    lexer->result_symbol = INNER_BLOCK_COMMENT_DOC_STYLE;
    advance(lexer);
    return true;
  }

  // Matches: /**
  //            ^
  if (valid_symbols[OUTER_BLOCK_COMMENT_DOC_STYLE] && first == '*') {
    advance(lexer);
    lexer->mark_end(lexer);

    // Matches: /**/ -- i.e. an empty normal block comment.
    //             ^
    if (lexer->lookahead == '/') return false;

    // Matches: /**x -- where x is not *, ensuring exactly two asterisks and no more.
    //             ^
    if (lexer->lookahead != '*') {
      lexer->result_symbol = OUTER_BLOCK_COMMENT_DOC_STYLE;
      return true;
    }
  } else {
    advance(lexer);
  }
  
  unsigned depth = 1;
  bool has_content = false;

  // Handling the case of an empty inner block comment: /*!*/
  // Such a comment is still marked with the inner docstyle however it has no content, so there should be no content field on the node (requiring us to return false). This also requires us to include that docstyle marker as a token type otherwise it wouldn't be possible to tell if we've been called after /* or /*!

  // Other such empty block comments are not possible and must have at least 1 character to have a content field (as one would expect).

  while (!lexer->eof(lexer) && depth != 0) {
    switch (lexer->lookahead) {
    case '/':
      advance(lexer);
      if (lexer->lookahead == '*') { depth++; };

      continue;
      break;

    case '*':
      if (depth == 1) {
        lexer->mark_end(lexer);
        skip(lexer);
      } else {
        advance(lexer);
      }

      if (lexer->lookahead == '/') {
        depth--;
      }

      continue;
      break;

    default:
      if (is_ascii(lexer) == false) return false;
      has_content = true;
    }

    lexer->mark_end(lexer);
    advance(lexer);
  }

  if (depth == 0 && valid_symbols[BLOCK_COMMENT_CONTENT]) {
    lexer->result_symbol = BLOCK_COMMENT_CONTENT;
    return true;
  }

  return false;
}


bool tree_sitter_noir_external_scanner_scan(
  void *payload,
  TSLexer *lexer,
  const bool *valid_symbols
) {
  if (valid_symbols[BLOCK_COMMENT_CONTENT] ||
      valid_symbols[INNER_BLOCK_COMMENT_DOC_STYLE] ||
      valid_symbols[OUTER_BLOCK_COMMENT_DOC_STYLE]
     ) {
    return scan_block_comment(lexer, valid_symbols);
  }

  return false;
}
