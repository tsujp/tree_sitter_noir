#include "tree_sitter/parser.h"
#include "tree_sitter/alloc.h"
#include "tree_sitter/array.h"

// TODO: Benchmark isspace vs a function with switch-case ourselves just for funsies lol?
#include <ctype.h>


// Order must match that in grammar's `externals`, enumerants names need not match.
enum TokenType {
  RAW_STR_LITERAL_START,
  RAW_STR_LITERAL_CONTENT,
  RAW_STR_LITERAL_END,
  // Extras
  BLOCK_COMMENT_CONTENT,
  INNER_BLOCK_COMMENT_DOC_STYLE,
  OUTER_BLOCK_COMMENT_DOC_STYLE,
};

// Serialisable state.
typedef struct {
  uint8_t pound_count;
} State;


// Called once when language set on a parser. Should create the scanner object, if scanner must maintain state allocate memory here. Fine to return NULL.
void * tree_sitter_noir_external_scanner_create() {
  State *s = ts_calloc(1, sizeof(State));
  
  return s;
}


// Called when parser is deleted or assigned to a different language. Should free any memory scanner is using. It receives the same pointer that was returned by the create function. If no state maintained this can be a no-op.
void tree_sitter_noir_external_scanner_destroy(void *payload) {
  ts_free((State *)payload);
}


// Called every time scanner successfully recognises a token. Should copy complete state of scanner into given byte buffer and return number of bytes written. Max number of writable bytes in "parser.h" defined by TREE_SITTER_SERIALIZATION_BUFFER_SIZE.
unsigned tree_sitter_noir_external_scanner_serialize(
                                                     void *payload, // Pointer to scanner
                                                     char *buffer // Pointer to buffer
) {
  // This functions return data is stored in the CST so the scanner can be restored to the correct state when handling edits or ambiguities. So, be sure to store the entire state (and quickly).

  State *s = (State *)payload;
  buffer[0] = (char)s->pound_count;

  // Hardcoded size of State (whose single field is 1 byte).
  return 1;
}


void tree_sitter_noir_external_scanner_deserialize(
                                                   void *payload, // Pointer to scanner
                                                   const char *buffer, // Pointer to buffer
                                                   unsigned length // Number of bytes to read
) {
  // Similarly to serialize be sure to restore the entire state (and quickly). It's good practice to explicitly erase scanner state variables at the start of this function before restoring their values from the byte buffer.
  
  State *s = (State *)payload;
  s->pound_count = 0;

  // Hardcoded size of State (whose single field is 1 byte).
  if (length == 1) {
    s->pound_count = (uint8_t)buffer[0];
  }
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


// Opening delimiter r" or r#" where # may occur 0 to 255 times (inclusive).
// Called with lexer looking at: r
static inline bool scan_raw_str_literal_start(TSLexer *lexer, State *state) {
  advance(lexer);

  // TODO: Enforce up to 255 or just let the scanner crash/overflow as it currently would.
  // Optionally up to 255 pounds (#).
  uint8_t pounds = 0;

  // Opening delimiter pound count.
  while (!lexer->eof(lexer) && lexer->lookahead == '#') {
    pounds++;
    advance(lexer);
  }

  if (lexer->lookahead != '"') return false;

  advance(lexer);
  state->pound_count = pounds;
  lexer->result_symbol = RAW_STR_LITERAL_START;
  return true;
}


// Called with lexer on first character after opening delimiter: "
static inline bool scan_raw_str_literal_content(TSLexer *lexer, State *state) {
  while (!lexer->eof(lexer)) {
    // Ahead of time (i.e. before scan_raw_str_literal_end) check for matching count of closing pounds.
    if (lexer->lookahead == '"') {
      uint8_t pounds = 0;
      lexer->mark_end(lexer);
      advance(lexer);

      // Consume contiguous # for count in state.
      while (pounds < state->pound_count && lexer->lookahead == '#') {
        pounds++;
        advance(lexer);
      }

      // Is this a valid closing delimiter?
      if (pounds == state->pound_count) {
        lexer->result_symbol = RAW_STR_LITERAL_CONTENT;
        return true;
      }
    } else {
      // Do not double advance.
      advance(lexer);
    }
  }

  return false;
}


// Closing delimiter " or "# where # must occur exactly the same amount of times as it did in the opening delimiter.
// Called with lexer looking at: "
static inline bool scan_raw_str_literal_end(TSLexer *lexer, State *state) {
  // Since we check ahead of time for a valid closing delimiter in scan_raw_str_literal_content, we only need to eat count times in state here for the purpose of the AST node.
  advance(lexer);
  for (uint8_t i = 0; i < state->pound_count; i++) {
    advance(lexer);
  }

  lexer->result_symbol = RAW_STR_LITERAL_END;
  return true;
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

  // TODO: c99 isspace only handles ASCII, Noir currently is ASCII only. Post grammar completion get clarity on whether Unicode allowed and adapt this and others as appropriate.
  if (isspace(lexer->lookahead)) skip(lexer);

  // raw_str_literal requires serialised state (the count of pounds) so we'll split up the scanning functions too.
  State *state = (State *)payload;

  // Opening delimiter must start with 'r'.
  if (valid_symbols[RAW_STR_LITERAL_START] && lexer->lookahead == 'r') {
    return scan_raw_str_literal_start(lexer, state);
  }

  if (valid_symbols[RAW_STR_LITERAL_CONTENT]) {
    return scan_raw_str_literal_content(lexer, state);
  }

  // Closing delimited must start with '"'.
  if (valid_symbols[RAW_STR_LITERAL_END] && lexer->lookahead == '"') {
    return scan_raw_str_literal_end(lexer, state);
  }

  return false;
}
