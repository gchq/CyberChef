/**
 * Malbolge tests.
 *
 * @author Karsten Silkenbäumer [github.com/kassi]
 * @copyright Karsten Silkenbäumer 2019
 * @license Apache-2.0
 */
import TestRegister from "../TestRegister";

TestRegister.addTests([
    {
        name: "Malbolge: no program",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "Malbolge",
                args: [""],
            },
        ],
    },
    {
        name: "Malbolge: simple program",
        input: "('&%:9]!~}|z2Vxwv-,POqponl$Hjig%eB@@>}=<M:9wv6WsU2T|nm-,jcL(I&%$#\"`CB]V?Tx<uVtT`Rpo3NlF.Jh++FdbCBA@?]!~| 4XzyTT43Qsqq(Lnmkj\"Fhg${z@>",
        expectedOutput: "Hello World!",
        recipeConfig: [
            {
                op: "Malbolge",
                args: [""],
            },
        ],
    },
    {
        name: "Malbolge: simple cat with infinite user input",
        input: "(=BA#9\"=<;:3y7x54-21q/p-,+*)\"!h%B0/.\n~P<\n<:(8&\n66#\"!~}|{zyxwvu\ngJ%",
        expectedOutput: "First line\nSecond Line\nError: Input required",
        recipeConfig: [
            {
                op: "Malbolge",
                args: ["First line\nSecond Line\n"],
            },
        ],
    },
]);
