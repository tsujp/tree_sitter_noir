// All (reasonable) Noir forms. The tree-sitter parser should be able to parse
// this file without error. Correctness of rendered syntax tree is to be tested
// unit-style elsewhere.
//
// Verbose or obfuscated forms not relevant in this file.

use dep::std::println;
use dep::std::println as print;

fn !okay() {}

#[ bing bong]
fn main() {
   // Ok.
   let _999 = 123;
   let u123_456 = 123;

   let uint1: u1 = 1;
   let uint8: u8 = 7;
   let uint32: u32 = 1337;
   let uint64: u64 = 42069;

   let iint1: i1 = 1;
   let iint8: i8 = 4;
   let iint32: i32 = 1337;
   let iint64: i64 = 42069;

   // Bad.
   // let i123 = 123;
   // let u32: Field = 123;
   // let 876 = 123;
}

fn d123_okay() {
   let bar = "hi";
}

/* I am a block comment */
// I am a single line comment.
/* I am a multi-line
block
                                                          comment
* with
* silly
* contents!!!!!
*/

#[oracle( )]
fn wadda_do() {}

#[!@#!#!]
fn wadda_do_scooby_do() {}

#[   ]
fn wadda_do_2() {}

#[oracle(....)]
fn wadda_do_3() {}

#[oracle(\r!~';/.')]
fn wadda_do_4() {}

#[oracle( () () () )]
fn wadda_do_5() {}
