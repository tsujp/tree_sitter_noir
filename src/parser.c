#include "tree_sitter/parser.h"

#if defined(__GNUC__) || defined(__clang__)
#pragma GCC diagnostic ignored "-Wmissing-field-initializers"
#endif

#define LANGUAGE_VERSION 14
#define STATE_COUNT 42
#define LARGE_STATE_COUNT 2
#define SYMBOL_COUNT 31
#define ALIAS_COUNT 1
#define TOKEN_COUNT 20
#define EXTERNAL_TOKEN_COUNT 0
#define FIELD_COUNT 1
#define MAX_ALIAS_SEQUENCE_LENGTH 6
#define PRODUCTION_ID_COUNT 7

enum ts_symbol_identifiers {
  sym_identifier = 1,
  anon_sym_fn = 2,
  anon_sym_pub = 3,
  anon_sym_LPARENcrate_RPAREN = 4,
  anon_sym_unconstrained = 5,
  anon_sym_comptime = 6,
  anon_sym_LPAREN = 7,
  anon_sym_RPAREN = 8,
  anon_sym_LBRACE = 9,
  anon_sym_RBRACE = 10,
  anon_sym_POUND = 11,
  anon_sym_BANG = 12,
  anon_sym_LBRACK = 13,
  anon_sym_SQUOTE = 14,
  anon_sym_SPACE = 15,
  aux_sym_attribute_token1 = 16,
  aux_sym_attribute_token2 = 17,
  aux_sym_attribute_token3 = 18,
  anon_sym_RBRACK = 19,
  sym_source_file = 20,
  sym__definitions = 21,
  sym_function_definition = 22,
  sym_visibility_modifier = 23,
  sym_function_modifiers = 24,
  sym_parameter_list = 25,
  sym_block = 26,
  sym_attribute = 27,
  aux_sym_source_file_repeat1 = 28,
  aux_sym_function_modifiers_repeat1 = 29,
  aux_sym_attribute_repeat1 = 30,
  alias_sym_content = 31,
};

static const char * const ts_symbol_names[] = {
  [ts_builtin_sym_end] = "end",
  [sym_identifier] = "identifier",
  [anon_sym_fn] = "fn",
  [anon_sym_pub] = "pub",
  [anon_sym_LPARENcrate_RPAREN] = "(crate)",
  [anon_sym_unconstrained] = "unconstrained",
  [anon_sym_comptime] = "comptime",
  [anon_sym_LPAREN] = "(",
  [anon_sym_RPAREN] = ")",
  [anon_sym_LBRACE] = "{",
  [anon_sym_RBRACE] = "}",
  [anon_sym_POUND] = "#",
  [anon_sym_BANG] = "!",
  [anon_sym_LBRACK] = "[",
  [anon_sym_SQUOTE] = "'",
  [anon_sym_SPACE] = " ",
  [aux_sym_attribute_token1] = "attribute_token1",
  [aux_sym_attribute_token2] = "attribute_token2",
  [aux_sym_attribute_token3] = "attribute_token3",
  [anon_sym_RBRACK] = "]",
  [sym_source_file] = "source_file",
  [sym__definitions] = "_definitions",
  [sym_function_definition] = "function_definition",
  [sym_visibility_modifier] = "visibility_modifier",
  [sym_function_modifiers] = "function_modifiers",
  [sym_parameter_list] = "parameter_list",
  [sym_block] = "block",
  [sym_attribute] = "attribute",
  [aux_sym_source_file_repeat1] = "source_file_repeat1",
  [aux_sym_function_modifiers_repeat1] = "function_modifiers_repeat1",
  [aux_sym_attribute_repeat1] = "attribute_repeat1",
  [alias_sym_content] = "content",
};

static const TSSymbol ts_symbol_map[] = {
  [ts_builtin_sym_end] = ts_builtin_sym_end,
  [sym_identifier] = sym_identifier,
  [anon_sym_fn] = anon_sym_fn,
  [anon_sym_pub] = anon_sym_pub,
  [anon_sym_LPARENcrate_RPAREN] = anon_sym_LPARENcrate_RPAREN,
  [anon_sym_unconstrained] = anon_sym_unconstrained,
  [anon_sym_comptime] = anon_sym_comptime,
  [anon_sym_LPAREN] = anon_sym_LPAREN,
  [anon_sym_RPAREN] = anon_sym_RPAREN,
  [anon_sym_LBRACE] = anon_sym_LBRACE,
  [anon_sym_RBRACE] = anon_sym_RBRACE,
  [anon_sym_POUND] = anon_sym_POUND,
  [anon_sym_BANG] = anon_sym_BANG,
  [anon_sym_LBRACK] = anon_sym_LBRACK,
  [anon_sym_SQUOTE] = anon_sym_SQUOTE,
  [anon_sym_SPACE] = anon_sym_SPACE,
  [aux_sym_attribute_token1] = aux_sym_attribute_token1,
  [aux_sym_attribute_token2] = aux_sym_attribute_token2,
  [aux_sym_attribute_token3] = aux_sym_attribute_token3,
  [anon_sym_RBRACK] = anon_sym_RBRACK,
  [sym_source_file] = sym_source_file,
  [sym__definitions] = sym__definitions,
  [sym_function_definition] = sym_function_definition,
  [sym_visibility_modifier] = sym_visibility_modifier,
  [sym_function_modifiers] = sym_function_modifiers,
  [sym_parameter_list] = sym_parameter_list,
  [sym_block] = sym_block,
  [sym_attribute] = sym_attribute,
  [aux_sym_source_file_repeat1] = aux_sym_source_file_repeat1,
  [aux_sym_function_modifiers_repeat1] = aux_sym_function_modifiers_repeat1,
  [aux_sym_attribute_repeat1] = aux_sym_attribute_repeat1,
  [alias_sym_content] = alias_sym_content,
};

static const TSSymbolMetadata ts_symbol_metadata[] = {
  [ts_builtin_sym_end] = {
    .visible = false,
    .named = true,
  },
  [sym_identifier] = {
    .visible = true,
    .named = true,
  },
  [anon_sym_fn] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_pub] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_LPARENcrate_RPAREN] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_unconstrained] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_comptime] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_LPAREN] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_RPAREN] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_LBRACE] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_RBRACE] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_POUND] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_BANG] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_LBRACK] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_SQUOTE] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_SPACE] = {
    .visible = true,
    .named = false,
  },
  [aux_sym_attribute_token1] = {
    .visible = false,
    .named = false,
  },
  [aux_sym_attribute_token2] = {
    .visible = false,
    .named = false,
  },
  [aux_sym_attribute_token3] = {
    .visible = false,
    .named = false,
  },
  [anon_sym_RBRACK] = {
    .visible = true,
    .named = false,
  },
  [sym_source_file] = {
    .visible = true,
    .named = true,
  },
  [sym__definitions] = {
    .visible = false,
    .named = true,
  },
  [sym_function_definition] = {
    .visible = true,
    .named = true,
  },
  [sym_visibility_modifier] = {
    .visible = true,
    .named = true,
  },
  [sym_function_modifiers] = {
    .visible = true,
    .named = true,
  },
  [sym_parameter_list] = {
    .visible = true,
    .named = true,
  },
  [sym_block] = {
    .visible = true,
    .named = true,
  },
  [sym_attribute] = {
    .visible = true,
    .named = true,
  },
  [aux_sym_source_file_repeat1] = {
    .visible = false,
    .named = false,
  },
  [aux_sym_function_modifiers_repeat1] = {
    .visible = false,
    .named = false,
  },
  [aux_sym_attribute_repeat1] = {
    .visible = false,
    .named = false,
  },
  [alias_sym_content] = {
    .visible = true,
    .named = true,
  },
};

enum ts_field_identifiers {
  field_name = 1,
};

static const char * const ts_field_names[] = {
  [0] = NULL,
  [field_name] = "name",
};

static const TSFieldMapSlice ts_field_map_slices[PRODUCTION_ID_COUNT] = {
  [1] = {.index = 0, .length = 1},
  [4] = {.index = 1, .length = 1},
  [6] = {.index = 2, .length = 1},
};

static const TSFieldMapEntry ts_field_map_entries[] = {
  [0] =
    {field_name, 1},
  [1] =
    {field_name, 2},
  [2] =
    {field_name, 3},
};

static const TSSymbol ts_alias_sequences[PRODUCTION_ID_COUNT][MAX_ALIAS_SEQUENCE_LENGTH] = {
  [0] = {0},
  [2] = {
    [2] = alias_sym_content,
  },
  [3] = {
    [3] = alias_sym_content,
  },
  [5] = {
    [4] = alias_sym_content,
  },
};

static const uint16_t ts_non_terminal_alias_map[] = {
  aux_sym_attribute_repeat1, 2,
    aux_sym_attribute_repeat1,
    alias_sym_content,
  0,
};

static const TSStateId ts_primary_state_ids[STATE_COUNT] = {
  [0] = 0,
  [1] = 1,
  [2] = 2,
  [3] = 3,
  [4] = 4,
  [5] = 5,
  [6] = 6,
  [7] = 7,
  [8] = 8,
  [9] = 9,
  [10] = 10,
  [11] = 11,
  [12] = 12,
  [13] = 13,
  [14] = 14,
  [15] = 15,
  [16] = 16,
  [17] = 17,
  [18] = 18,
  [19] = 19,
  [20] = 20,
  [21] = 21,
  [22] = 22,
  [23] = 23,
  [24] = 24,
  [25] = 25,
  [26] = 26,
  [27] = 27,
  [28] = 28,
  [29] = 29,
  [30] = 30,
  [31] = 31,
  [32] = 32,
  [33] = 33,
  [34] = 34,
  [35] = 35,
  [36] = 36,
  [37] = 37,
  [38] = 38,
  [39] = 39,
  [40] = 40,
  [41] = 41,
};

static bool ts_lex(TSLexer *lexer, TSStateId state) {
  START_LEXER();
  eof = lexer->eof(lexer);
  switch (state) {
    case 0:
      if (eof) ADVANCE(12);
      ADVANCE_MAP(
        '!', 19,
        '#', 18,
        '\'', 21,
        '(', 14,
        ')', 15,
        '[', 20,
        ']', 28,
        '_', 27,
        '{', 16,
        '}', 17,
      );
      if (('\t' <= lookahead && lookahead <= '\r') ||
          lookahead == ' ') SKIP(0);
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(25);
      if (('"' <= lookahead && lookahead <= '@') ||
          ('\\' <= lookahead && lookahead <= '`') ||
          ('|' <= lookahead && lookahead <= '~')) ADVANCE(26);
      if (('A' <= lookahead && lookahead <= 'z')) ADVANCE(24);
      END_STATE();
    case 1:
      if (lookahead == ' ') ADVANCE(22);
      if (lookahead == '\'') ADVANCE(21);
      if (('\t' <= lookahead && lookahead <= '\r')) SKIP(1);
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(25);
      if (('!' <= lookahead && lookahead <= '@') ||
          ('[' <= lookahead && lookahead <= '`') ||
          ('{' <= lookahead && lookahead <= '~')) ADVANCE(26);
      if (('A' <= lookahead && lookahead <= 'z')) ADVANCE(23);
      END_STATE();
    case 2:
      if (lookahead == ' ') ADVANCE(22);
      if (lookahead == ']') ADVANCE(28);
      if (('\t' <= lookahead && lookahead <= '\r')) SKIP(2);
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(25);
      if (('!' <= lookahead && lookahead <= '@') ||
          ('[' <= lookahead && lookahead <= '`') ||
          ('{' <= lookahead && lookahead <= '~')) ADVANCE(26);
      if (('A' <= lookahead && lookahead <= 'z')) ADVANCE(23);
      END_STATE();
    case 3:
      if (lookahead == ' ') ADVANCE(22);
      if (('\t' <= lookahead && lookahead <= '\r')) SKIP(3);
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(25);
      if (('!' <= lookahead && lookahead <= '@') ||
          ('[' <= lookahead && lookahead <= '`') ||
          ('{' <= lookahead && lookahead <= '~')) ADVANCE(26);
      if (('A' <= lookahead && lookahead <= 'z')) ADVANCE(23);
      END_STATE();
    case 4:
      if (lookahead == '(') ADVANCE(14);
      if (('\t' <= lookahead && lookahead <= '\r') ||
          lookahead == ' ') SKIP(4);
      END_STATE();
    case 5:
      if (lookahead == ')') ADVANCE(13);
      END_STATE();
    case 6:
      if (lookahead == 'a') ADVANCE(10);
      END_STATE();
    case 7:
      if (lookahead == 'c') ADVANCE(9);
      END_STATE();
    case 8:
      if (lookahead == 'e') ADVANCE(5);
      END_STATE();
    case 9:
      if (lookahead == 'r') ADVANCE(6);
      END_STATE();
    case 10:
      if (lookahead == 't') ADVANCE(8);
      END_STATE();
    case 11:
      if (eof) ADVANCE(12);
      if (lookahead == '!') ADVANCE(19);
      if (lookahead == '#') ADVANCE(18);
      if (lookahead == '(') ADVANCE(7);
      if (lookahead == ')') ADVANCE(15);
      if (lookahead == '[') ADVANCE(20);
      if (lookahead == '{') ADVANCE(16);
      if (lookahead == '}') ADVANCE(17);
      if (('\t' <= lookahead && lookahead <= '\r') ||
          lookahead == ' ') SKIP(11);
      if (('A' <= lookahead && lookahead <= 'Z') ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(29);
      END_STATE();
    case 12:
      ACCEPT_TOKEN(ts_builtin_sym_end);
      END_STATE();
    case 13:
      ACCEPT_TOKEN(anon_sym_LPARENcrate_RPAREN);
      END_STATE();
    case 14:
      ACCEPT_TOKEN(anon_sym_LPAREN);
      END_STATE();
    case 15:
      ACCEPT_TOKEN(anon_sym_RPAREN);
      END_STATE();
    case 16:
      ACCEPT_TOKEN(anon_sym_LBRACE);
      END_STATE();
    case 17:
      ACCEPT_TOKEN(anon_sym_RBRACE);
      END_STATE();
    case 18:
      ACCEPT_TOKEN(anon_sym_POUND);
      END_STATE();
    case 19:
      ACCEPT_TOKEN(anon_sym_BANG);
      END_STATE();
    case 20:
      ACCEPT_TOKEN(anon_sym_LBRACK);
      END_STATE();
    case 21:
      ACCEPT_TOKEN(anon_sym_SQUOTE);
      END_STATE();
    case 22:
      ACCEPT_TOKEN(anon_sym_SPACE);
      if (lookahead == ' ') ADVANCE(22);
      END_STATE();
    case 23:
      ACCEPT_TOKEN(aux_sym_attribute_token1);
      END_STATE();
    case 24:
      ACCEPT_TOKEN(aux_sym_attribute_token1);
      if (('0' <= lookahead && lookahead <= '9') ||
          ('A' <= lookahead && lookahead <= 'Z') ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(29);
      END_STATE();
    case 25:
      ACCEPT_TOKEN(aux_sym_attribute_token2);
      END_STATE();
    case 26:
      ACCEPT_TOKEN(aux_sym_attribute_token3);
      END_STATE();
    case 27:
      ACCEPT_TOKEN(aux_sym_attribute_token3);
      if (('0' <= lookahead && lookahead <= '9') ||
          ('A' <= lookahead && lookahead <= 'Z') ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(29);
      END_STATE();
    case 28:
      ACCEPT_TOKEN(anon_sym_RBRACK);
      END_STATE();
    case 29:
      ACCEPT_TOKEN(sym_identifier);
      if (('0' <= lookahead && lookahead <= '9') ||
          ('A' <= lookahead && lookahead <= 'Z') ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(29);
      END_STATE();
    default:
      return false;
  }
}

static bool ts_lex_keywords(TSLexer *lexer, TSStateId state) {
  START_LEXER();
  eof = lexer->eof(lexer);
  switch (state) {
    case 0:
      if (lookahead == 'c') ADVANCE(1);
      if (lookahead == 'f') ADVANCE(2);
      if (lookahead == 'p') ADVANCE(3);
      if (lookahead == 'u') ADVANCE(4);
      if (('\t' <= lookahead && lookahead <= '\r') ||
          lookahead == ' ') SKIP(0);
      END_STATE();
    case 1:
      if (lookahead == 'o') ADVANCE(5);
      END_STATE();
    case 2:
      if (lookahead == 'n') ADVANCE(6);
      END_STATE();
    case 3:
      if (lookahead == 'u') ADVANCE(7);
      END_STATE();
    case 4:
      if (lookahead == 'n') ADVANCE(8);
      END_STATE();
    case 5:
      if (lookahead == 'm') ADVANCE(9);
      END_STATE();
    case 6:
      ACCEPT_TOKEN(anon_sym_fn);
      END_STATE();
    case 7:
      if (lookahead == 'b') ADVANCE(10);
      END_STATE();
    case 8:
      if (lookahead == 'c') ADVANCE(11);
      END_STATE();
    case 9:
      if (lookahead == 'p') ADVANCE(12);
      END_STATE();
    case 10:
      ACCEPT_TOKEN(anon_sym_pub);
      END_STATE();
    case 11:
      if (lookahead == 'o') ADVANCE(13);
      END_STATE();
    case 12:
      if (lookahead == 't') ADVANCE(14);
      END_STATE();
    case 13:
      if (lookahead == 'n') ADVANCE(15);
      END_STATE();
    case 14:
      if (lookahead == 'i') ADVANCE(16);
      END_STATE();
    case 15:
      if (lookahead == 's') ADVANCE(17);
      END_STATE();
    case 16:
      if (lookahead == 'm') ADVANCE(18);
      END_STATE();
    case 17:
      if (lookahead == 't') ADVANCE(19);
      END_STATE();
    case 18:
      if (lookahead == 'e') ADVANCE(20);
      END_STATE();
    case 19:
      if (lookahead == 'r') ADVANCE(21);
      END_STATE();
    case 20:
      ACCEPT_TOKEN(anon_sym_comptime);
      END_STATE();
    case 21:
      if (lookahead == 'a') ADVANCE(22);
      END_STATE();
    case 22:
      if (lookahead == 'i') ADVANCE(23);
      END_STATE();
    case 23:
      if (lookahead == 'n') ADVANCE(24);
      END_STATE();
    case 24:
      if (lookahead == 'e') ADVANCE(25);
      END_STATE();
    case 25:
      if (lookahead == 'd') ADVANCE(26);
      END_STATE();
    case 26:
      ACCEPT_TOKEN(anon_sym_unconstrained);
      END_STATE();
    default:
      return false;
  }
}

static const TSLexMode ts_lex_modes[STATE_COUNT] = {
  [0] = {.lex_state = 0},
  [1] = {.lex_state = 11},
  [2] = {.lex_state = 11},
  [3] = {.lex_state = 11},
  [4] = {.lex_state = 11},
  [5] = {.lex_state = 1},
  [6] = {.lex_state = 1},
  [7] = {.lex_state = 2},
  [8] = {.lex_state = 11},
  [9] = {.lex_state = 11},
  [10] = {.lex_state = 2},
  [11] = {.lex_state = 11},
  [12] = {.lex_state = 2},
  [13] = {.lex_state = 2},
  [14] = {.lex_state = 11},
  [15] = {.lex_state = 11},
  [16] = {.lex_state = 11},
  [17] = {.lex_state = 2},
  [18] = {.lex_state = 11},
  [19] = {.lex_state = 3},
  [20] = {.lex_state = 3},
  [21] = {.lex_state = 11},
  [22] = {.lex_state = 11},
  [23] = {.lex_state = 11},
  [24] = {.lex_state = 11},
  [25] = {.lex_state = 11},
  [26] = {.lex_state = 11},
  [27] = {.lex_state = 4},
  [28] = {.lex_state = 4},
  [29] = {.lex_state = 11},
  [30] = {.lex_state = 11},
  [31] = {.lex_state = 4},
  [32] = {.lex_state = 11},
  [33] = {.lex_state = 11},
  [34] = {.lex_state = 11},
  [35] = {.lex_state = 11},
  [36] = {.lex_state = 11},
  [37] = {.lex_state = 0},
  [38] = {.lex_state = 11},
  [39] = {.lex_state = 11},
  [40] = {.lex_state = 11},
  [41] = {.lex_state = 11},
};

static const uint16_t ts_parse_table[LARGE_STATE_COUNT][SYMBOL_COUNT] = {
  [0] = {
    [ts_builtin_sym_end] = ACTIONS(1),
    [sym_identifier] = ACTIONS(1),
    [anon_sym_fn] = ACTIONS(1),
    [anon_sym_pub] = ACTIONS(1),
    [anon_sym_unconstrained] = ACTIONS(1),
    [anon_sym_comptime] = ACTIONS(1),
    [anon_sym_LPAREN] = ACTIONS(1),
    [anon_sym_RPAREN] = ACTIONS(1),
    [anon_sym_LBRACE] = ACTIONS(1),
    [anon_sym_RBRACE] = ACTIONS(1),
    [anon_sym_POUND] = ACTIONS(1),
    [anon_sym_BANG] = ACTIONS(1),
    [anon_sym_LBRACK] = ACTIONS(1),
    [anon_sym_SQUOTE] = ACTIONS(1),
    [aux_sym_attribute_token1] = ACTIONS(1),
    [aux_sym_attribute_token2] = ACTIONS(1),
    [aux_sym_attribute_token3] = ACTIONS(1),
    [anon_sym_RBRACK] = ACTIONS(1),
  },
  [1] = {
    [sym_source_file] = STATE(37),
    [sym__definitions] = STATE(2),
    [sym_function_definition] = STATE(2),
    [sym_visibility_modifier] = STATE(18),
    [sym_function_modifiers] = STATE(38),
    [sym_attribute] = STATE(2),
    [aux_sym_source_file_repeat1] = STATE(2),
    [aux_sym_function_modifiers_repeat1] = STATE(23),
    [ts_builtin_sym_end] = ACTIONS(3),
    [anon_sym_fn] = ACTIONS(5),
    [anon_sym_pub] = ACTIONS(7),
    [anon_sym_unconstrained] = ACTIONS(9),
    [anon_sym_comptime] = ACTIONS(9),
    [anon_sym_POUND] = ACTIONS(11),
  },
};

static const uint16_t ts_small_parse_table[] = {
  [0] = 9,
    ACTIONS(5), 1,
      anon_sym_fn,
    ACTIONS(7), 1,
      anon_sym_pub,
    ACTIONS(11), 1,
      anon_sym_POUND,
    ACTIONS(13), 1,
      ts_builtin_sym_end,
    STATE(18), 1,
      sym_visibility_modifier,
    STATE(23), 1,
      aux_sym_function_modifiers_repeat1,
    STATE(38), 1,
      sym_function_modifiers,
    ACTIONS(9), 2,
      anon_sym_unconstrained,
      anon_sym_comptime,
    STATE(3), 4,
      sym__definitions,
      sym_function_definition,
      sym_attribute,
      aux_sym_source_file_repeat1,
  [32] = 9,
    ACTIONS(15), 1,
      ts_builtin_sym_end,
    ACTIONS(17), 1,
      anon_sym_fn,
    ACTIONS(20), 1,
      anon_sym_pub,
    ACTIONS(26), 1,
      anon_sym_POUND,
    STATE(18), 1,
      sym_visibility_modifier,
    STATE(23), 1,
      aux_sym_function_modifiers_repeat1,
    STATE(38), 1,
      sym_function_modifiers,
    ACTIONS(23), 2,
      anon_sym_unconstrained,
      anon_sym_comptime,
    STATE(3), 4,
      sym__definitions,
      sym_function_definition,
      sym_attribute,
      aux_sym_source_file_repeat1,
  [64] = 1,
    ACTIONS(29), 6,
      ts_builtin_sym_end,
      anon_sym_fn,
      anon_sym_pub,
      anon_sym_unconstrained,
      anon_sym_comptime,
      anon_sym_POUND,
  [73] = 4,
    ACTIONS(31), 1,
      anon_sym_SQUOTE,
    ACTIONS(33), 1,
      anon_sym_SPACE,
    STATE(7), 1,
      aux_sym_attribute_repeat1,
    ACTIONS(35), 3,
      aux_sym_attribute_token1,
      aux_sym_attribute_token2,
      aux_sym_attribute_token3,
  [88] = 4,
    ACTIONS(33), 1,
      anon_sym_SPACE,
    ACTIONS(37), 1,
      anon_sym_SQUOTE,
    STATE(10), 1,
      aux_sym_attribute_repeat1,
    ACTIONS(35), 3,
      aux_sym_attribute_token1,
      aux_sym_attribute_token2,
      aux_sym_attribute_token3,
  [103] = 4,
    ACTIONS(33), 1,
      anon_sym_SPACE,
    ACTIONS(39), 1,
      anon_sym_RBRACK,
    STATE(12), 1,
      aux_sym_attribute_repeat1,
    ACTIONS(35), 3,
      aux_sym_attribute_token1,
      aux_sym_attribute_token2,
      aux_sym_attribute_token3,
  [118] = 1,
    ACTIONS(41), 6,
      ts_builtin_sym_end,
      anon_sym_fn,
      anon_sym_pub,
      anon_sym_unconstrained,
      anon_sym_comptime,
      anon_sym_POUND,
  [127] = 1,
    ACTIONS(43), 6,
      ts_builtin_sym_end,
      anon_sym_fn,
      anon_sym_pub,
      anon_sym_unconstrained,
      anon_sym_comptime,
      anon_sym_POUND,
  [136] = 4,
    ACTIONS(33), 1,
      anon_sym_SPACE,
    ACTIONS(45), 1,
      anon_sym_RBRACK,
    STATE(12), 1,
      aux_sym_attribute_repeat1,
    ACTIONS(35), 3,
      aux_sym_attribute_token1,
      aux_sym_attribute_token2,
      aux_sym_attribute_token3,
  [151] = 1,
    ACTIONS(47), 6,
      ts_builtin_sym_end,
      anon_sym_fn,
      anon_sym_pub,
      anon_sym_unconstrained,
      anon_sym_comptime,
      anon_sym_POUND,
  [160] = 4,
    ACTIONS(49), 1,
      anon_sym_SPACE,
    ACTIONS(55), 1,
      anon_sym_RBRACK,
    STATE(12), 1,
      aux_sym_attribute_repeat1,
    ACTIONS(52), 3,
      aux_sym_attribute_token1,
      aux_sym_attribute_token2,
      aux_sym_attribute_token3,
  [175] = 4,
    ACTIONS(33), 1,
      anon_sym_SPACE,
    ACTIONS(57), 1,
      anon_sym_RBRACK,
    STATE(12), 1,
      aux_sym_attribute_repeat1,
    ACTIONS(35), 3,
      aux_sym_attribute_token1,
      aux_sym_attribute_token2,
      aux_sym_attribute_token3,
  [190] = 1,
    ACTIONS(59), 6,
      ts_builtin_sym_end,
      anon_sym_fn,
      anon_sym_pub,
      anon_sym_unconstrained,
      anon_sym_comptime,
      anon_sym_POUND,
  [199] = 1,
    ACTIONS(61), 6,
      ts_builtin_sym_end,
      anon_sym_fn,
      anon_sym_pub,
      anon_sym_unconstrained,
      anon_sym_comptime,
      anon_sym_POUND,
  [208] = 1,
    ACTIONS(63), 6,
      ts_builtin_sym_end,
      anon_sym_fn,
      anon_sym_pub,
      anon_sym_unconstrained,
      anon_sym_comptime,
      anon_sym_POUND,
  [217] = 2,
    ACTIONS(65), 1,
      anon_sym_SPACE,
    ACTIONS(67), 4,
      aux_sym_attribute_token1,
      aux_sym_attribute_token2,
      aux_sym_attribute_token3,
      anon_sym_RBRACK,
  [227] = 4,
    ACTIONS(69), 1,
      anon_sym_fn,
    STATE(23), 1,
      aux_sym_function_modifiers_repeat1,
    STATE(40), 1,
      sym_function_modifiers,
    ACTIONS(9), 2,
      anon_sym_unconstrained,
      anon_sym_comptime,
  [241] = 3,
    ACTIONS(33), 1,
      anon_sym_SPACE,
    STATE(10), 1,
      aux_sym_attribute_repeat1,
    ACTIONS(35), 3,
      aux_sym_attribute_token1,
      aux_sym_attribute_token2,
      aux_sym_attribute_token3,
  [253] = 3,
    ACTIONS(33), 1,
      anon_sym_SPACE,
    STATE(13), 1,
      aux_sym_attribute_repeat1,
    ACTIONS(35), 3,
      aux_sym_attribute_token1,
      aux_sym_attribute_token2,
      aux_sym_attribute_token3,
  [265] = 3,
    ACTIONS(71), 1,
      anon_sym_fn,
    STATE(21), 1,
      aux_sym_function_modifiers_repeat1,
    ACTIONS(73), 2,
      anon_sym_unconstrained,
      anon_sym_comptime,
  [276] = 2,
    ACTIONS(78), 1,
      anon_sym_LPARENcrate_RPAREN,
    ACTIONS(76), 3,
      anon_sym_fn,
      anon_sym_unconstrained,
      anon_sym_comptime,
  [285] = 3,
    ACTIONS(80), 1,
      anon_sym_fn,
    STATE(21), 1,
      aux_sym_function_modifiers_repeat1,
    ACTIONS(82), 2,
      anon_sym_unconstrained,
      anon_sym_comptime,
  [296] = 1,
    ACTIONS(84), 3,
      anon_sym_fn,
      anon_sym_unconstrained,
      anon_sym_comptime,
  [302] = 2,
    ACTIONS(86), 1,
      anon_sym_LBRACE,
    STATE(9), 1,
      sym_block,
  [309] = 2,
    ACTIONS(86), 1,
      anon_sym_LBRACE,
    STATE(8), 1,
      sym_block,
  [316] = 2,
    ACTIONS(88), 1,
      anon_sym_LPAREN,
    STATE(30), 1,
      sym_parameter_list,
  [323] = 2,
    ACTIONS(88), 1,
      anon_sym_LPAREN,
    STATE(26), 1,
      sym_parameter_list,
  [330] = 2,
    ACTIONS(90), 1,
      anon_sym_BANG,
    ACTIONS(92), 1,
      anon_sym_LBRACK,
  [337] = 2,
    ACTIONS(86), 1,
      anon_sym_LBRACE,
    STATE(16), 1,
      sym_block,
  [344] = 2,
    ACTIONS(88), 1,
      anon_sym_LPAREN,
    STATE(25), 1,
      sym_parameter_list,
  [351] = 1,
    ACTIONS(94), 1,
      sym_identifier,
  [355] = 1,
    ACTIONS(96), 1,
      anon_sym_LBRACE,
  [359] = 1,
    ACTIONS(98), 1,
      anon_sym_RBRACE,
  [363] = 1,
    ACTIONS(100), 1,
      anon_sym_RPAREN,
  [367] = 1,
    ACTIONS(102), 1,
      anon_sym_LBRACK,
  [371] = 1,
    ACTIONS(104), 1,
      ts_builtin_sym_end,
  [375] = 1,
    ACTIONS(69), 1,
      anon_sym_fn,
  [379] = 1,
    ACTIONS(106), 1,
      sym_identifier,
  [383] = 1,
    ACTIONS(108), 1,
      anon_sym_fn,
  [387] = 1,
    ACTIONS(110), 1,
      sym_identifier,
};

static const uint32_t ts_small_parse_table_map[] = {
  [SMALL_STATE(2)] = 0,
  [SMALL_STATE(3)] = 32,
  [SMALL_STATE(4)] = 64,
  [SMALL_STATE(5)] = 73,
  [SMALL_STATE(6)] = 88,
  [SMALL_STATE(7)] = 103,
  [SMALL_STATE(8)] = 118,
  [SMALL_STATE(9)] = 127,
  [SMALL_STATE(10)] = 136,
  [SMALL_STATE(11)] = 151,
  [SMALL_STATE(12)] = 160,
  [SMALL_STATE(13)] = 175,
  [SMALL_STATE(14)] = 190,
  [SMALL_STATE(15)] = 199,
  [SMALL_STATE(16)] = 208,
  [SMALL_STATE(17)] = 217,
  [SMALL_STATE(18)] = 227,
  [SMALL_STATE(19)] = 241,
  [SMALL_STATE(20)] = 253,
  [SMALL_STATE(21)] = 265,
  [SMALL_STATE(22)] = 276,
  [SMALL_STATE(23)] = 285,
  [SMALL_STATE(24)] = 296,
  [SMALL_STATE(25)] = 302,
  [SMALL_STATE(26)] = 309,
  [SMALL_STATE(27)] = 316,
  [SMALL_STATE(28)] = 323,
  [SMALL_STATE(29)] = 330,
  [SMALL_STATE(30)] = 337,
  [SMALL_STATE(31)] = 344,
  [SMALL_STATE(32)] = 351,
  [SMALL_STATE(33)] = 355,
  [SMALL_STATE(34)] = 359,
  [SMALL_STATE(35)] = 363,
  [SMALL_STATE(36)] = 367,
  [SMALL_STATE(37)] = 371,
  [SMALL_STATE(38)] = 375,
  [SMALL_STATE(39)] = 379,
  [SMALL_STATE(40)] = 383,
  [SMALL_STATE(41)] = 387,
};

static const TSParseActionEntry ts_parse_actions[] = {
  [0] = {.entry = {.count = 0, .reusable = false}},
  [1] = {.entry = {.count = 1, .reusable = false}}, RECOVER(),
  [3] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_source_file, 0, 0, 0),
  [5] = {.entry = {.count = 1, .reusable = true}}, SHIFT(32),
  [7] = {.entry = {.count = 1, .reusable = true}}, SHIFT(22),
  [9] = {.entry = {.count = 1, .reusable = true}}, SHIFT(23),
  [11] = {.entry = {.count = 1, .reusable = true}}, SHIFT(29),
  [13] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_source_file, 1, 0, 0),
  [15] = {.entry = {.count = 1, .reusable = true}}, REDUCE(aux_sym_source_file_repeat1, 2, 0, 0),
  [17] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym_source_file_repeat1, 2, 0, 0), SHIFT_REPEAT(32),
  [20] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym_source_file_repeat1, 2, 0, 0), SHIFT_REPEAT(22),
  [23] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym_source_file_repeat1, 2, 0, 0), SHIFT_REPEAT(23),
  [26] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym_source_file_repeat1, 2, 0, 0), SHIFT_REPEAT(29),
  [29] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_block, 2, 0, 0),
  [31] = {.entry = {.count = 1, .reusable = false}}, SHIFT(19),
  [33] = {.entry = {.count = 1, .reusable = true}}, SHIFT(17),
  [35] = {.entry = {.count = 1, .reusable = false}}, SHIFT(17),
  [37] = {.entry = {.count = 1, .reusable = false}}, SHIFT(20),
  [39] = {.entry = {.count = 1, .reusable = false}}, SHIFT(11),
  [41] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_function_definition, 4, 0, 1),
  [43] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_function_definition, 5, 0, 4),
  [45] = {.entry = {.count = 1, .reusable = false}}, SHIFT(14),
  [47] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_attribute, 4, 0, 2),
  [49] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym_attribute_repeat1, 2, 0, 0), SHIFT_REPEAT(17),
  [52] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_attribute_repeat1, 2, 0, 0), SHIFT_REPEAT(17),
  [55] = {.entry = {.count = 1, .reusable = false}}, REDUCE(aux_sym_attribute_repeat1, 2, 0, 0),
  [57] = {.entry = {.count = 1, .reusable = false}}, SHIFT(15),
  [59] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_attribute, 5, 0, 3),
  [61] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_attribute, 6, 0, 5),
  [63] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_function_definition, 6, 0, 6),
  [65] = {.entry = {.count = 1, .reusable = true}}, REDUCE(aux_sym_attribute_repeat1, 1, 0, 0),
  [67] = {.entry = {.count = 1, .reusable = false}}, REDUCE(aux_sym_attribute_repeat1, 1, 0, 0),
  [69] = {.entry = {.count = 1, .reusable = true}}, SHIFT(39),
  [71] = {.entry = {.count = 1, .reusable = true}}, REDUCE(aux_sym_function_modifiers_repeat1, 2, 0, 0),
  [73] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym_function_modifiers_repeat1, 2, 0, 0), SHIFT_REPEAT(21),
  [76] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_visibility_modifier, 1, 0, 0),
  [78] = {.entry = {.count = 1, .reusable = true}}, SHIFT(24),
  [80] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_function_modifiers, 1, 0, 0),
  [82] = {.entry = {.count = 1, .reusable = true}}, SHIFT(21),
  [84] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_visibility_modifier, 2, 0, 0),
  [86] = {.entry = {.count = 1, .reusable = true}}, SHIFT(34),
  [88] = {.entry = {.count = 1, .reusable = true}}, SHIFT(35),
  [90] = {.entry = {.count = 1, .reusable = true}}, SHIFT(36),
  [92] = {.entry = {.count = 1, .reusable = true}}, SHIFT(5),
  [94] = {.entry = {.count = 1, .reusable = true}}, SHIFT(28),
  [96] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_parameter_list, 2, 0, 0),
  [98] = {.entry = {.count = 1, .reusable = true}}, SHIFT(4),
  [100] = {.entry = {.count = 1, .reusable = true}}, SHIFT(33),
  [102] = {.entry = {.count = 1, .reusable = true}}, SHIFT(6),
  [104] = {.entry = {.count = 1, .reusable = true}},  ACCEPT_INPUT(),
  [106] = {.entry = {.count = 1, .reusable = true}}, SHIFT(31),
  [108] = {.entry = {.count = 1, .reusable = true}}, SHIFT(41),
  [110] = {.entry = {.count = 1, .reusable = true}}, SHIFT(27),
};

#ifdef __cplusplus
extern "C" {
#endif
#ifdef TREE_SITTER_HIDE_SYMBOLS
#define TS_PUBLIC
#elif defined(_WIN32)
#define TS_PUBLIC __declspec(dllexport)
#else
#define TS_PUBLIC __attribute__((visibility("default")))
#endif

TS_PUBLIC const TSLanguage *tree_sitter_noir(void) {
  static const TSLanguage language = {
    .version = LANGUAGE_VERSION,
    .symbol_count = SYMBOL_COUNT,
    .alias_count = ALIAS_COUNT,
    .token_count = TOKEN_COUNT,
    .external_token_count = EXTERNAL_TOKEN_COUNT,
    .state_count = STATE_COUNT,
    .large_state_count = LARGE_STATE_COUNT,
    .production_id_count = PRODUCTION_ID_COUNT,
    .field_count = FIELD_COUNT,
    .max_alias_sequence_length = MAX_ALIAS_SEQUENCE_LENGTH,
    .parse_table = &ts_parse_table[0][0],
    .small_parse_table = ts_small_parse_table,
    .small_parse_table_map = ts_small_parse_table_map,
    .parse_actions = ts_parse_actions,
    .symbol_names = ts_symbol_names,
    .field_names = ts_field_names,
    .field_map_slices = ts_field_map_slices,
    .field_map_entries = ts_field_map_entries,
    .symbol_metadata = ts_symbol_metadata,
    .public_symbol_map = ts_symbol_map,
    .alias_map = ts_non_terminal_alias_map,
    .alias_sequences = &ts_alias_sequences[0][0],
    .lex_modes = ts_lex_modes,
    .lex_fn = ts_lex,
    .keyword_lex_fn = ts_lex_keywords,
    .keyword_capture_token = sym_identifier,
    .primary_state_ids = ts_primary_state_ids,
  };
  return &language;
}
#ifdef __cplusplus
}
#endif
