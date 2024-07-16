#include "tree_sitter/parser.h"

#if defined(__GNUC__) || defined(__clang__)
#pragma GCC diagnostic ignored "-Wmissing-field-initializers"
#endif

#define LANGUAGE_VERSION 14
#define STATE_COUNT 33
#define LARGE_STATE_COUNT 2
#define SYMBOL_COUNT 27
#define ALIAS_COUNT 1
#define TOKEN_COUNT 16
#define EXTERNAL_TOKEN_COUNT 0
#define FIELD_COUNT 1
#define MAX_ALIAS_SEQUENCE_LENGTH 6
#define PRODUCTION_ID_COUNT 5

enum ts_symbol_identifiers {
  anon_sym_fn = 1,
  anon_sym_pub = 2,
  anon_sym_unconstrained = 3,
  anon_sym_LPAREN = 4,
  anon_sym_RPAREN = 5,
  anon_sym_LBRACE = 6,
  anon_sym_RBRACE = 7,
  anon_sym_POUND = 8,
  anon_sym_LBRACK = 9,
  anon_sym_SPACE = 10,
  aux_sym_attribute_token1 = 11,
  aux_sym_attribute_token2 = 12,
  aux_sym_attribute_token3 = 13,
  anon_sym_RBRACK = 14,
  sym_identifier = 15,
  sym_source_file = 16,
  sym__definition = 17,
  sym_function_definition = 18,
  sym_visibility_modifier = 19,
  sym_function_modifiers = 20,
  sym_parameter_list = 21,
  sym_block = 22,
  sym_attribute = 23,
  aux_sym_source_file_repeat1 = 24,
  aux_sym_function_modifiers_repeat1 = 25,
  aux_sym_attribute_repeat1 = 26,
  alias_sym_path = 27,
};

static const char * const ts_symbol_names[] = {
  [ts_builtin_sym_end] = "end",
  [anon_sym_fn] = "fn",
  [anon_sym_pub] = "pub",
  [anon_sym_unconstrained] = "unconstrained",
  [anon_sym_LPAREN] = "(",
  [anon_sym_RPAREN] = ")",
  [anon_sym_LBRACE] = "{",
  [anon_sym_RBRACE] = "}",
  [anon_sym_POUND] = "#",
  [anon_sym_LBRACK] = "[",
  [anon_sym_SPACE] = " ",
  [aux_sym_attribute_token1] = "attribute_token1",
  [aux_sym_attribute_token2] = "attribute_token2",
  [aux_sym_attribute_token3] = "attribute_token3",
  [anon_sym_RBRACK] = "]",
  [sym_identifier] = "identifier",
  [sym_source_file] = "source_file",
  [sym__definition] = "_definition",
  [sym_function_definition] = "function_definition",
  [sym_visibility_modifier] = "visibility_modifier",
  [sym_function_modifiers] = "function_modifiers",
  [sym_parameter_list] = "parameter_list",
  [sym_block] = "block",
  [sym_attribute] = "attribute",
  [aux_sym_source_file_repeat1] = "source_file_repeat1",
  [aux_sym_function_modifiers_repeat1] = "function_modifiers_repeat1",
  [aux_sym_attribute_repeat1] = "attribute_repeat1",
  [alias_sym_path] = "path",
};

static const TSSymbol ts_symbol_map[] = {
  [ts_builtin_sym_end] = ts_builtin_sym_end,
  [anon_sym_fn] = anon_sym_fn,
  [anon_sym_pub] = anon_sym_pub,
  [anon_sym_unconstrained] = anon_sym_unconstrained,
  [anon_sym_LPAREN] = anon_sym_LPAREN,
  [anon_sym_RPAREN] = anon_sym_RPAREN,
  [anon_sym_LBRACE] = anon_sym_LBRACE,
  [anon_sym_RBRACE] = anon_sym_RBRACE,
  [anon_sym_POUND] = anon_sym_POUND,
  [anon_sym_LBRACK] = anon_sym_LBRACK,
  [anon_sym_SPACE] = anon_sym_SPACE,
  [aux_sym_attribute_token1] = aux_sym_attribute_token1,
  [aux_sym_attribute_token2] = aux_sym_attribute_token2,
  [aux_sym_attribute_token3] = aux_sym_attribute_token3,
  [anon_sym_RBRACK] = anon_sym_RBRACK,
  [sym_identifier] = sym_identifier,
  [sym_source_file] = sym_source_file,
  [sym__definition] = sym__definition,
  [sym_function_definition] = sym_function_definition,
  [sym_visibility_modifier] = sym_visibility_modifier,
  [sym_function_modifiers] = sym_function_modifiers,
  [sym_parameter_list] = sym_parameter_list,
  [sym_block] = sym_block,
  [sym_attribute] = sym_attribute,
  [aux_sym_source_file_repeat1] = aux_sym_source_file_repeat1,
  [aux_sym_function_modifiers_repeat1] = aux_sym_function_modifiers_repeat1,
  [aux_sym_attribute_repeat1] = aux_sym_attribute_repeat1,
  [alias_sym_path] = alias_sym_path,
};

static const TSSymbolMetadata ts_symbol_metadata[] = {
  [ts_builtin_sym_end] = {
    .visible = false,
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
  [anon_sym_unconstrained] = {
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
  [anon_sym_LBRACK] = {
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
  [sym_identifier] = {
    .visible = true,
    .named = true,
  },
  [sym_source_file] = {
    .visible = true,
    .named = true,
  },
  [sym__definition] = {
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
  [alias_sym_path] = {
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
  [3] = {.index = 1, .length = 1},
  [4] = {.index = 2, .length = 1},
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
    [2] = alias_sym_path,
  },
};

static const uint16_t ts_non_terminal_alias_map[] = {
  aux_sym_attribute_repeat1, 2,
    aux_sym_attribute_repeat1,
    alias_sym_path,
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
};

static bool ts_lex(TSLexer *lexer, TSStateId state) {
  START_LEXER();
  eof = lexer->eof(lexer);
  switch (state) {
    case 0:
      if (eof) ADVANCE(20);
      if (lookahead == '#') ADVANCE(28);
      if (lookahead == '(') ADVANCE(24);
      if (lookahead == ')') ADVANCE(25);
      if (lookahead == '[') ADVANCE(29);
      if (lookahead == ']') ADVANCE(34);
      if (lookahead == '{') ADVANCE(26);
      if (lookahead == '}') ADVANCE(27);
      if (('\t' <= lookahead && lookahead <= '\r') ||
          lookahead == ' ') SKIP(0);
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(32);
      if (('!' <= lookahead && lookahead <= '@') ||
          ('\\' <= lookahead && lookahead <= '`') ||
          ('|' <= lookahead && lookahead <= '~')) ADVANCE(33);
      if (('A' <= lookahead && lookahead <= 'z')) ADVANCE(31);
      END_STATE();
    case 1:
      if (lookahead == ' ') ADVANCE(30);
      if (lookahead == ']') ADVANCE(34);
      if (('\t' <= lookahead && lookahead <= '\r')) SKIP(1);
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(32);
      if (('!' <= lookahead && lookahead <= '@') ||
          ('[' <= lookahead && lookahead <= '`') ||
          ('{' <= lookahead && lookahead <= '~')) ADVANCE(33);
      if (('A' <= lookahead && lookahead <= 'z')) ADVANCE(31);
      END_STATE();
    case 2:
      if (lookahead == ' ') ADVANCE(30);
      if (('\t' <= lookahead && lookahead <= '\r')) SKIP(2);
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(32);
      if (('!' <= lookahead && lookahead <= '@') ||
          ('[' <= lookahead && lookahead <= '`') ||
          ('{' <= lookahead && lookahead <= '~')) ADVANCE(33);
      if (('A' <= lookahead && lookahead <= 'z')) ADVANCE(31);
      END_STATE();
    case 3:
      if (lookahead == 'a') ADVANCE(8);
      END_STATE();
    case 4:
      if (lookahead == 'b') ADVANCE(22);
      END_STATE();
    case 5:
      if (lookahead == 'c') ADVANCE(13);
      END_STATE();
    case 6:
      if (lookahead == 'd') ADVANCE(23);
      END_STATE();
    case 7:
      if (lookahead == 'e') ADVANCE(6);
      END_STATE();
    case 8:
      if (lookahead == 'i') ADVANCE(12);
      END_STATE();
    case 9:
      if (lookahead == 'n') ADVANCE(21);
      END_STATE();
    case 10:
      if (lookahead == 'n') ADVANCE(5);
      END_STATE();
    case 11:
      if (lookahead == 'n') ADVANCE(15);
      END_STATE();
    case 12:
      if (lookahead == 'n') ADVANCE(7);
      END_STATE();
    case 13:
      if (lookahead == 'o') ADVANCE(11);
      END_STATE();
    case 14:
      if (lookahead == 'r') ADVANCE(3);
      END_STATE();
    case 15:
      if (lookahead == 's') ADVANCE(16);
      END_STATE();
    case 16:
      if (lookahead == 't') ADVANCE(14);
      END_STATE();
    case 17:
      if (lookahead == 'u') ADVANCE(4);
      END_STATE();
    case 18:
      if (('\t' <= lookahead && lookahead <= '\r') ||
          lookahead == ' ') SKIP(18);
      if (('A' <= lookahead && lookahead <= 'Z') ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(35);
      END_STATE();
    case 19:
      if (eof) ADVANCE(20);
      ADVANCE_MAP(
        '#', 28,
        '(', 24,
        ')', 25,
        '[', 29,
        'f', 9,
        'p', 17,
        'u', 10,
        '{', 26,
        '}', 27,
      );
      if (('\t' <= lookahead && lookahead <= '\r') ||
          lookahead == ' ') SKIP(19);
      END_STATE();
    case 20:
      ACCEPT_TOKEN(ts_builtin_sym_end);
      END_STATE();
    case 21:
      ACCEPT_TOKEN(anon_sym_fn);
      END_STATE();
    case 22:
      ACCEPT_TOKEN(anon_sym_pub);
      END_STATE();
    case 23:
      ACCEPT_TOKEN(anon_sym_unconstrained);
      END_STATE();
    case 24:
      ACCEPT_TOKEN(anon_sym_LPAREN);
      END_STATE();
    case 25:
      ACCEPT_TOKEN(anon_sym_RPAREN);
      END_STATE();
    case 26:
      ACCEPT_TOKEN(anon_sym_LBRACE);
      END_STATE();
    case 27:
      ACCEPT_TOKEN(anon_sym_RBRACE);
      END_STATE();
    case 28:
      ACCEPT_TOKEN(anon_sym_POUND);
      END_STATE();
    case 29:
      ACCEPT_TOKEN(anon_sym_LBRACK);
      END_STATE();
    case 30:
      ACCEPT_TOKEN(anon_sym_SPACE);
      if (lookahead == ' ') ADVANCE(30);
      END_STATE();
    case 31:
      ACCEPT_TOKEN(aux_sym_attribute_token1);
      END_STATE();
    case 32:
      ACCEPT_TOKEN(aux_sym_attribute_token2);
      END_STATE();
    case 33:
      ACCEPT_TOKEN(aux_sym_attribute_token3);
      END_STATE();
    case 34:
      ACCEPT_TOKEN(anon_sym_RBRACK);
      END_STATE();
    case 35:
      ACCEPT_TOKEN(sym_identifier);
      if (('0' <= lookahead && lookahead <= '9') ||
          ('A' <= lookahead && lookahead <= 'Z') ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(35);
      END_STATE();
    default:
      return false;
  }
}

static const TSLexMode ts_lex_modes[STATE_COUNT] = {
  [0] = {.lex_state = 0},
  [1] = {.lex_state = 19},
  [2] = {.lex_state = 19},
  [3] = {.lex_state = 19},
  [4] = {.lex_state = 1},
  [5] = {.lex_state = 1},
  [6] = {.lex_state = 19},
  [7] = {.lex_state = 19},
  [8] = {.lex_state = 2},
  [9] = {.lex_state = 19},
  [10] = {.lex_state = 19},
  [11] = {.lex_state = 19},
  [12] = {.lex_state = 1},
  [13] = {.lex_state = 19},
  [14] = {.lex_state = 19},
  [15] = {.lex_state = 19},
  [16] = {.lex_state = 19},
  [17] = {.lex_state = 19},
  [18] = {.lex_state = 19},
  [19] = {.lex_state = 19},
  [20] = {.lex_state = 19},
  [21] = {.lex_state = 19},
  [22] = {.lex_state = 19},
  [23] = {.lex_state = 19},
  [24] = {.lex_state = 19},
  [25] = {.lex_state = 19},
  [26] = {.lex_state = 19},
  [27] = {.lex_state = 18},
  [28] = {.lex_state = 18},
  [29] = {.lex_state = 0},
  [30] = {.lex_state = 19},
  [31] = {.lex_state = 18},
  [32] = {.lex_state = 19},
};

static const uint16_t ts_parse_table[LARGE_STATE_COUNT][SYMBOL_COUNT] = {
  [0] = {
    [ts_builtin_sym_end] = ACTIONS(1),
    [anon_sym_LPAREN] = ACTIONS(1),
    [anon_sym_RPAREN] = ACTIONS(1),
    [anon_sym_LBRACE] = ACTIONS(1),
    [anon_sym_RBRACE] = ACTIONS(1),
    [anon_sym_POUND] = ACTIONS(1),
    [anon_sym_LBRACK] = ACTIONS(1),
    [aux_sym_attribute_token1] = ACTIONS(1),
    [aux_sym_attribute_token2] = ACTIONS(1),
    [aux_sym_attribute_token3] = ACTIONS(1),
    [anon_sym_RBRACK] = ACTIONS(1),
  },
  [1] = {
    [sym_source_file] = STATE(29),
    [sym__definition] = STATE(2),
    [sym_function_definition] = STATE(2),
    [sym_visibility_modifier] = STATE(32),
    [sym_function_modifiers] = STATE(15),
    [sym_attribute] = STATE(2),
    [aux_sym_source_file_repeat1] = STATE(2),
    [aux_sym_function_modifiers_repeat1] = STATE(13),
    [ts_builtin_sym_end] = ACTIONS(3),
    [anon_sym_fn] = ACTIONS(5),
    [anon_sym_pub] = ACTIONS(7),
    [anon_sym_unconstrained] = ACTIONS(9),
    [anon_sym_POUND] = ACTIONS(11),
  },
};

static const uint16_t ts_small_parse_table[] = {
  [0] = 9,
    ACTIONS(5), 1,
      anon_sym_fn,
    ACTIONS(7), 1,
      anon_sym_pub,
    ACTIONS(9), 1,
      anon_sym_unconstrained,
    ACTIONS(11), 1,
      anon_sym_POUND,
    ACTIONS(13), 1,
      ts_builtin_sym_end,
    STATE(13), 1,
      aux_sym_function_modifiers_repeat1,
    STATE(15), 1,
      sym_function_modifiers,
    STATE(32), 1,
      sym_visibility_modifier,
    STATE(3), 4,
      sym__definition,
      sym_function_definition,
      sym_attribute,
      aux_sym_source_file_repeat1,
  [31] = 9,
    ACTIONS(15), 1,
      ts_builtin_sym_end,
    ACTIONS(17), 1,
      anon_sym_fn,
    ACTIONS(20), 1,
      anon_sym_pub,
    ACTIONS(23), 1,
      anon_sym_unconstrained,
    ACTIONS(26), 1,
      anon_sym_POUND,
    STATE(13), 1,
      aux_sym_function_modifiers_repeat1,
    STATE(15), 1,
      sym_function_modifiers,
    STATE(32), 1,
      sym_visibility_modifier,
    STATE(3), 4,
      sym__definition,
      sym_function_definition,
      sym_attribute,
      aux_sym_source_file_repeat1,
  [62] = 4,
    ACTIONS(29), 1,
      anon_sym_SPACE,
    ACTIONS(35), 1,
      anon_sym_RBRACK,
    STATE(4), 1,
      aux_sym_attribute_repeat1,
    ACTIONS(32), 3,
      aux_sym_attribute_token1,
      aux_sym_attribute_token2,
      aux_sym_attribute_token3,
  [77] = 4,
    ACTIONS(37), 1,
      anon_sym_SPACE,
    ACTIONS(41), 1,
      anon_sym_RBRACK,
    STATE(4), 1,
      aux_sym_attribute_repeat1,
    ACTIONS(39), 3,
      aux_sym_attribute_token1,
      aux_sym_attribute_token2,
      aux_sym_attribute_token3,
  [92] = 1,
    ACTIONS(43), 5,
      ts_builtin_sym_end,
      anon_sym_fn,
      anon_sym_pub,
      anon_sym_unconstrained,
      anon_sym_POUND,
  [100] = 1,
    ACTIONS(45), 5,
      ts_builtin_sym_end,
      anon_sym_fn,
      anon_sym_pub,
      anon_sym_unconstrained,
      anon_sym_POUND,
  [108] = 3,
    ACTIONS(37), 1,
      anon_sym_SPACE,
    STATE(5), 1,
      aux_sym_attribute_repeat1,
    ACTIONS(39), 3,
      aux_sym_attribute_token1,
      aux_sym_attribute_token2,
      aux_sym_attribute_token3,
  [120] = 1,
    ACTIONS(47), 5,
      ts_builtin_sym_end,
      anon_sym_fn,
      anon_sym_pub,
      anon_sym_unconstrained,
      anon_sym_POUND,
  [128] = 1,
    ACTIONS(49), 5,
      ts_builtin_sym_end,
      anon_sym_fn,
      anon_sym_pub,
      anon_sym_unconstrained,
      anon_sym_POUND,
  [136] = 1,
    ACTIONS(51), 5,
      ts_builtin_sym_end,
      anon_sym_fn,
      anon_sym_pub,
      anon_sym_unconstrained,
      anon_sym_POUND,
  [144] = 2,
    ACTIONS(53), 1,
      anon_sym_SPACE,
    ACTIONS(55), 4,
      aux_sym_attribute_token1,
      aux_sym_attribute_token2,
      aux_sym_attribute_token3,
      anon_sym_RBRACK,
  [154] = 3,
    ACTIONS(59), 1,
      anon_sym_unconstrained,
    STATE(14), 1,
      aux_sym_function_modifiers_repeat1,
    ACTIONS(57), 2,
      anon_sym_fn,
      anon_sym_pub,
  [165] = 3,
    ACTIONS(63), 1,
      anon_sym_unconstrained,
    STATE(14), 1,
      aux_sym_function_modifiers_repeat1,
    ACTIONS(61), 2,
      anon_sym_fn,
      anon_sym_pub,
  [176] = 3,
    ACTIONS(7), 1,
      anon_sym_pub,
    ACTIONS(66), 1,
      anon_sym_fn,
    STATE(22), 1,
      sym_visibility_modifier,
  [186] = 2,
    ACTIONS(68), 1,
      anon_sym_LPAREN,
    STATE(18), 1,
      sym_parameter_list,
  [193] = 2,
    ACTIONS(70), 1,
      anon_sym_LBRACE,
    STATE(9), 1,
      sym_block,
  [200] = 2,
    ACTIONS(70), 1,
      anon_sym_LBRACE,
    STATE(6), 1,
      sym_block,
  [207] = 2,
    ACTIONS(68), 1,
      anon_sym_LPAREN,
    STATE(17), 1,
      sym_parameter_list,
  [214] = 2,
    ACTIONS(68), 1,
      anon_sym_LPAREN,
    STATE(21), 1,
      sym_parameter_list,
  [221] = 2,
    ACTIONS(70), 1,
      anon_sym_LBRACE,
    STATE(10), 1,
      sym_block,
  [228] = 1,
    ACTIONS(72), 1,
      anon_sym_fn,
  [232] = 1,
    ACTIONS(74), 1,
      anon_sym_RBRACE,
  [236] = 1,
    ACTIONS(76), 1,
      anon_sym_LBRACK,
  [240] = 1,
    ACTIONS(78), 1,
      anon_sym_LBRACE,
  [244] = 1,
    ACTIONS(80), 1,
      anon_sym_fn,
  [248] = 1,
    ACTIONS(82), 1,
      sym_identifier,
  [252] = 1,
    ACTIONS(84), 1,
      sym_identifier,
  [256] = 1,
    ACTIONS(86), 1,
      ts_builtin_sym_end,
  [260] = 1,
    ACTIONS(88), 1,
      anon_sym_RPAREN,
  [264] = 1,
    ACTIONS(90), 1,
      sym_identifier,
  [268] = 1,
    ACTIONS(66), 1,
      anon_sym_fn,
};

static const uint32_t ts_small_parse_table_map[] = {
  [SMALL_STATE(2)] = 0,
  [SMALL_STATE(3)] = 31,
  [SMALL_STATE(4)] = 62,
  [SMALL_STATE(5)] = 77,
  [SMALL_STATE(6)] = 92,
  [SMALL_STATE(7)] = 100,
  [SMALL_STATE(8)] = 108,
  [SMALL_STATE(9)] = 120,
  [SMALL_STATE(10)] = 128,
  [SMALL_STATE(11)] = 136,
  [SMALL_STATE(12)] = 144,
  [SMALL_STATE(13)] = 154,
  [SMALL_STATE(14)] = 165,
  [SMALL_STATE(15)] = 176,
  [SMALL_STATE(16)] = 186,
  [SMALL_STATE(17)] = 193,
  [SMALL_STATE(18)] = 200,
  [SMALL_STATE(19)] = 207,
  [SMALL_STATE(20)] = 214,
  [SMALL_STATE(21)] = 221,
  [SMALL_STATE(22)] = 228,
  [SMALL_STATE(23)] = 232,
  [SMALL_STATE(24)] = 236,
  [SMALL_STATE(25)] = 240,
  [SMALL_STATE(26)] = 244,
  [SMALL_STATE(27)] = 248,
  [SMALL_STATE(28)] = 252,
  [SMALL_STATE(29)] = 256,
  [SMALL_STATE(30)] = 260,
  [SMALL_STATE(31)] = 264,
  [SMALL_STATE(32)] = 268,
};

static const TSParseActionEntry ts_parse_actions[] = {
  [0] = {.entry = {.count = 0, .reusable = false}},
  [1] = {.entry = {.count = 1, .reusable = false}}, RECOVER(),
  [3] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_source_file, 0, 0, 0),
  [5] = {.entry = {.count = 1, .reusable = true}}, SHIFT(31),
  [7] = {.entry = {.count = 1, .reusable = true}}, SHIFT(26),
  [9] = {.entry = {.count = 1, .reusable = true}}, SHIFT(13),
  [11] = {.entry = {.count = 1, .reusable = true}}, SHIFT(24),
  [13] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_source_file, 1, 0, 0),
  [15] = {.entry = {.count = 1, .reusable = true}}, REDUCE(aux_sym_source_file_repeat1, 2, 0, 0),
  [17] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym_source_file_repeat1, 2, 0, 0), SHIFT_REPEAT(31),
  [20] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym_source_file_repeat1, 2, 0, 0), SHIFT_REPEAT(26),
  [23] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym_source_file_repeat1, 2, 0, 0), SHIFT_REPEAT(13),
  [26] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym_source_file_repeat1, 2, 0, 0), SHIFT_REPEAT(24),
  [29] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym_attribute_repeat1, 2, 0, 0), SHIFT_REPEAT(12),
  [32] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_attribute_repeat1, 2, 0, 0), SHIFT_REPEAT(12),
  [35] = {.entry = {.count = 1, .reusable = false}}, REDUCE(aux_sym_attribute_repeat1, 2, 0, 0),
  [37] = {.entry = {.count = 1, .reusable = true}}, SHIFT(12),
  [39] = {.entry = {.count = 1, .reusable = false}}, SHIFT(12),
  [41] = {.entry = {.count = 1, .reusable = false}}, SHIFT(7),
  [43] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_function_definition, 4, 0, 1),
  [45] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_attribute, 4, 0, 2),
  [47] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_function_definition, 6, 0, 4),
  [49] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_function_definition, 5, 0, 3),
  [51] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_block, 2, 0, 0),
  [53] = {.entry = {.count = 1, .reusable = true}}, REDUCE(aux_sym_attribute_repeat1, 1, 0, 0),
  [55] = {.entry = {.count = 1, .reusable = false}}, REDUCE(aux_sym_attribute_repeat1, 1, 0, 0),
  [57] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_function_modifiers, 1, 0, 0),
  [59] = {.entry = {.count = 1, .reusable = true}}, SHIFT(14),
  [61] = {.entry = {.count = 1, .reusable = true}}, REDUCE(aux_sym_function_modifiers_repeat1, 2, 0, 0),
  [63] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym_function_modifiers_repeat1, 2, 0, 0), SHIFT_REPEAT(14),
  [66] = {.entry = {.count = 1, .reusable = true}}, SHIFT(27),
  [68] = {.entry = {.count = 1, .reusable = true}}, SHIFT(30),
  [70] = {.entry = {.count = 1, .reusable = true}}, SHIFT(23),
  [72] = {.entry = {.count = 1, .reusable = true}}, SHIFT(28),
  [74] = {.entry = {.count = 1, .reusable = true}}, SHIFT(11),
  [76] = {.entry = {.count = 1, .reusable = true}}, SHIFT(8),
  [78] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_parameter_list, 2, 0, 0),
  [80] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_visibility_modifier, 1, 0, 0),
  [82] = {.entry = {.count = 1, .reusable = true}}, SHIFT(20),
  [84] = {.entry = {.count = 1, .reusable = true}}, SHIFT(19),
  [86] = {.entry = {.count = 1, .reusable = true}},  ACCEPT_INPUT(),
  [88] = {.entry = {.count = 1, .reusable = true}}, SHIFT(25),
  [90] = {.entry = {.count = 1, .reusable = true}}, SHIFT(16),
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
    .primary_state_ids = ts_primary_state_ids,
  };
  return &language;
}
#ifdef __cplusplus
}
#endif
