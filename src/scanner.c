#include "tree_sitter/parser.h"
#include "tree_sitter/alloc.h"
#include "tree_sitter/array.h"


// Order must match that in grammar's `externals`, enumerants names need not match.
enum TokenType {
  BLOCK_COMMENT_CONTENT
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


bool tree_sitter_noir_external_scanner_scan(
  void *payload,
  TSLexer *lexer,
  const bool *valid_symbols
) {
  if (!valid_symbols[BLOCK_COMMENT_CONTENT]) return false;

  // TODO: Clean up this scanners logic, hacked together for now. Maybe this is the best form but I doubt it.

  unsigned depth = 0;

  while (!lexer->eof(lexer)) {
    // Is this: /*
    if (lexer->lookahead == '/') {
      lexer->advance(lexer, false);
      if (lexer->lookahead == '*') {
        lexer->advance(lexer, false);
        depth++;
      }
        
      continue;
    }

    // Is this: */
    if (lexer->lookahead == '*') {
      if (depth == 0) {
        lexer->mark_end(lexer);
      }
      lexer->advance(lexer, false);
      
      if (lexer->lookahead == '/') {
        lexer->advance(lexer, false);

        if (depth == 0) {
          lexer->result_symbol = BLOCK_COMMENT_CONTENT;
          return true;
        }
        
        depth--;
      }
        
      continue;
    }
      
    if (0 <= lexer->lookahead && lexer->lookahead <= 127) {
      lexer->advance(lexer, false);
    } else {
      return false;
    }
  }

  if (depth == 0) {
    lexer->mark_end(lexer);
    lexer->result_symbol = BLOCK_COMMENT_CONTENT;
    return true;
  }

  return false;
}
