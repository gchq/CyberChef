/**
 * @author n1073645 [n1073645@gmail.com]
 * @copyright Crown Copyright 2022
 * @license Apache-2.0
 */
 import TestRegister from "../../lib/TestRegister.mjs";

 TestRegister.addTests([
     {
         name: "ELF Info invalid ELF.",
         input: "\x7f\x00\x00\x00",
         expectedOutput: "Invalid ELF",
         recipeConfig: [
             {
                 op: "ELF Info",
                 args: [],
             },
         ],
     },
 ]);
