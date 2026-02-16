set breakpoint pending on
b scan_raw_str_literal_start
display (char)lexer->lookahead
display (uint8_t)pounds
display (uint8_t)state->pound_count

r
