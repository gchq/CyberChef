/**
 * Bombe machine tests.
 * @author s2224834
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */
import TestRegister from "../TestRegister";

TestRegister.addTests([
    {
        name: "Bombe: 3 rotor (self-stecker)",
        input: "BBYFLTHHYIJQAYBBYS",
        expectedMatch: /LGA \(S <-> S\)/,
        recipeConfig: [
            {
                "op": "Bombe",
                "args": [
                    "BDFHJLCPRTXVZNYEIWGAKMUSQO<W", // III
                    "AJDKSIRUXBLHWTMCQGZNPYFVOE<F", // II
                    "EKMFLGDQVZNTOWYHXUSPAIBRCJ<R", // I
                    "",
                    "AY BR CU DH EQ FS GL IP JX KN MO TZ VW", // B
                    "THISISATESTMESSAGE", 0,
                ]
            }
        ]
    },
    {
        name: "Bombe: 3 rotor (other stecker)",
        input: "JBYALIHDYNUAAVKBYM",
        expectedMatch: /LGA \(A <-> G\)/,
        recipeConfig: [
            {
                "op": "Bombe",
                "args": [
                    "BDFHJLCPRTXVZNYEIWGAKMUSQO<W", // III
                    "AJDKSIRUXBLHWTMCQGZNPYFVOE<F", // II
                    "EKMFLGDQVZNTOWYHXUSPAIBRCJ<R", // I
                    "",
                    "AY BR CU DH EQ FS GL IP JX KN MO TZ VW", // B
                    "THISISATESTMESSAGE", 0,
                ]
            }
        ]
    },
    /*
     * Long test is long
    {
        name: "Bombe: 4 rotor",
        input: "LUOXGJSHGEDSRDOQQX",
        expectedMatch: /LHSC \(S <-> S\)/,
        recipeConfig: [
            {
                "op": "Bombe",
                "args": [
                    "BDFHJLCPRTXVZNYEIWGAKMUSQO<W", // III
                    "AJDKSIRUXBLHWTMCQGZNPYFVOE<F", // II
                    "EKMFLGDQVZNTOWYHXUSPAIBRCJ<R", // I
                    "LEYJVCNIXWPBQMDRTAKZGFUHOS", // Beta
                    "AE BN CK DQ FU GY HW IJ LO MP RX SZ TV", // B thin
                    "THISISATESTMESSAGE", 0,
                ]
            }
        ]
    },
    */
]);
