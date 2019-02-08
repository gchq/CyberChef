/**
 * Bombe machine tests.
 * @author s2224834
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */
import TestRegister from "../TestRegister";

TestRegister.addTests([
    {
        // Plugboard for this test is BO LC KE GA
        name: "Bombe: 3 rotor (self-stecker)",
        input: "BBYFLTHHYIJQAYBBYS",
        expectedMatch: /<td>LGA<\/td><td>SS<\/td><td>VFISUSGTKSTMPSUNAK<\/td>/,
        recipeConfig: [
            {
                "op": "Bombe",
                "args": [
                    "BDFHJLCPRTXVZNYEIWGAKMUSQO<W", // III
                    "AJDKSIRUXBLHWTMCQGZNPYFVOE<F", // II
                    "EKMFLGDQVZNTOWYHXUSPAIBRCJ<R", // I
                    "",
                    "AY BR CU DH EQ FS GL IP JX KN MO TZ VW", // B
                    "THISISATESTMESSAGE", 0, false
                ]
            }
        ]
    },
    {
        // This test produces a menu that doesn't use the first letter, which is also a good test
        name: "Bombe: 3 rotor (other stecker)",
        input: "JBYALIHDYNUAAVKBYM",
        expectedMatch: /<td>LGA<\/td><td>AG<\/td><td>QFIMUMAFKMQSKMYNGW<\/td>/,
        recipeConfig: [
            {
                "op": "Bombe",
                "args": [
                    "BDFHJLCPRTXVZNYEIWGAKMUSQO<W", // III
                    "AJDKSIRUXBLHWTMCQGZNPYFVOE<F", // II
                    "EKMFLGDQVZNTOWYHXUSPAIBRCJ<R", // I
                    "",
                    "AY BR CU DH EQ FS GL IP JX KN MO TZ VW", // B
                    "THISISATESTMESSAGE", 0, false
                ]
            }
        ]
    },
    {
        name: "Bombe: crib offset",
        input: "AAABBYFLTHHYIJQAYBBYS", // first three chars here are faked
        expectedMatch: /<td>LGA<\/td><td>SS<\/td><td>VFISUSGTKSTMPSUNAK<\/td>/,
        recipeConfig: [
            {
                "op": "Bombe",
                "args": [
                    "BDFHJLCPRTXVZNYEIWGAKMUSQO<W", // III
                    "AJDKSIRUXBLHWTMCQGZNPYFVOE<F", // II
                    "EKMFLGDQVZNTOWYHXUSPAIBRCJ<R", // I
                    "",
                    "AY BR CU DH EQ FS GL IP JX KN MO TZ VW", // B
                    "THISISATESTMESSAGE", 3, false
                ]
            }
        ]
    },
    {
        name: "Bombe: multiple stops",
        input: "BBYFLTHHYIJQAYBBYS",
        expectedMatch: /<td>LGA<\/td><td>TT<\/td><td>VFISUSGTKSTMPSUNAK<\/td>/,
        recipeConfig: [
            {
                "op": "Bombe",
                "args": [
                    "BDFHJLCPRTXVZNYEIWGAKMUSQO<W", // III
                    "AJDKSIRUXBLHWTMCQGZNPYFVOE<F", // II
                    "EKMFLGDQVZNTOWYHXUSPAIBRCJ<R", // I
                    "",
                    "AY BR CU DH EQ FS GL IP JX KN MO TZ VW", // B
                    "THISISATESTM", 0, false
                ]
            }
        ]
    },
    {
        name: "Bombe: checking machine",
        input: "BBYFLTHHYIJQAYBBYS",
        expectedMatch: /<td>LGA<\/td><td>TT AG BO CL EK FF HH II JJ SS YY<\/td><td>THISISATESTMESSAGE<\/td>/,
        recipeConfig: [
            {
                "op": "Bombe",
                "args": [
                    "BDFHJLCPRTXVZNYEIWGAKMUSQO<W", // III
                    "AJDKSIRUXBLHWTMCQGZNPYFVOE<F", // II
                    "EKMFLGDQVZNTOWYHXUSPAIBRCJ<R", // I
                    "",
                    "AY BR CU DH EQ FS GL IP JX KN MO TZ VW", // B
                    "THISISATESTM", 0, true
                ]
            }
        ]
    },
    // This test is a bit slow - it takes about 12s on my test hardware
    {
        name: "Bombe: 4 rotor",
        input: "LUOXGJSHGEDSRDOQQX",
        expectedMatch: /<td>LHSC<\/td><td>SS<\/td><td>HHHSSSGQUUQPKSEKWK<\/td>/,
        recipeConfig: [
            {
                "op": "Bombe",
                "args": [
                    "BDFHJLCPRTXVZNYEIWGAKMUSQO<W", // III
                    "AJDKSIRUXBLHWTMCQGZNPYFVOE<F", // II
                    "EKMFLGDQVZNTOWYHXUSPAIBRCJ<R", // I
                    "LEYJVCNIXWPBQMDRTAKZGFUHOS", // Beta
                    "AE BN CK DQ FU GY HW IJ LO MP RX SZ TV", // B thin
                    "THISISATESTMESSAGE", 0, false
                ]
            }
        ]
    },
    {
        name: "Bombe: no crib",
        input: "JBYALIHDYNUAAVKBYM",
        expectedMatch: /Crib cannot be empty/,
        recipeConfig: [
            {
                "op": "Bombe",
                "args": [
                    "BDFHJLCPRTXVZNYEIWGAKMUSQO<W", // III
                    "AJDKSIRUXBLHWTMCQGZNPYFVOE<F", // II
                    "EKMFLGDQVZNTOWYHXUSPAIBRCJ<R", // I
                    "",
                    "AY BR CU DH EQ FS GL IP JX KN MO TZ VW", // B
                    "", 0, false
                ]
            }
        ]
    },
    {
        name: "Bombe: short crib",
        input: "JBYALIHDYNUAAVKBYM",
        expectedMatch: /Crib is too short/,
        recipeConfig: [
            {
                "op": "Bombe",
                "args": [
                    "BDFHJLCPRTXVZNYEIWGAKMUSQO<W", // III
                    "AJDKSIRUXBLHWTMCQGZNPYFVOE<F", // II
                    "EKMFLGDQVZNTOWYHXUSPAIBRCJ<R", // I
                    "",
                    "AY BR CU DH EQ FS GL IP JX KN MO TZ VW", // B
                    "A", 0, false
                ]
            }
        ]
    },
    {
        name: "Bombe: invalid crib",
        input: "JBYALIHDYNUAAVKBYM",
        expectedMatch: /Invalid crib: .* in both ciphertext and crib/,
        recipeConfig: [
            {
                "op": "Bombe",
                "args": [
                    "BDFHJLCPRTXVZNYEIWGAKMUSQO<W", // III
                    "AJDKSIRUXBLHWTMCQGZNPYFVOE<F", // II
                    "EKMFLGDQVZNTOWYHXUSPAIBRCJ<R", // I
                    "",
                    "AY BR CU DH EQ FS GL IP JX KN MO TZ VW", // B
                    "AAAAAAAA", 0, false
                ]
            }
        ]
    },
    {
        name: "Bombe: long crib",
        input: "JBYALIHDYNUAAVKBYM",
        expectedMatch: /Crib overruns supplied ciphertext/,
        recipeConfig: [
            {
                "op": "Bombe",
                "args": [
                    "BDFHJLCPRTXVZNYEIWGAKMUSQO<W", // III
                    "AJDKSIRUXBLHWTMCQGZNPYFVOE<F", // II
                    "EKMFLGDQVZNTOWYHXUSPAIBRCJ<R", // I
                    "",
                    "AY BR CU DH EQ FS GL IP JX KN MO TZ VW", // B
                    "CCCCCCCCCCCCCCCCCCCCCC", 0, false
                ]
            }
        ]
    },
    {
        name: "Bombe: really long crib",
        input: "BBBBBBBBBBBBBBBBBBBBBBBBBB",
        expectedMatch: /Crib is too long/,
        recipeConfig: [
            {
                "op": "Bombe",
                "args": [
                    "BDFHJLCPRTXVZNYEIWGAKMUSQO<W", // III
                    "AJDKSIRUXBLHWTMCQGZNPYFVOE<F", // II
                    "EKMFLGDQVZNTOWYHXUSPAIBRCJ<R", // I
                    "",
                    "AY BR CU DH EQ FS GL IP JX KN MO TZ VW", // B
                    "AAAAAAAAAAAAAAAAAAAAAAAAAA", 0, false
                ]
            }
        ]
    },
    {
        name: "Bombe: negative offset",
        input: "AAAAA",
        expectedMatch: /Offset cannot be negative/,
        recipeConfig: [
            {
                "op": "Bombe",
                "args": [
                    "BDFHJLCPRTXVZNYEIWGAKMUSQO<W", // III
                    "AJDKSIRUXBLHWTMCQGZNPYFVOE<F", // II
                    "EKMFLGDQVZNTOWYHXUSPAIBRCJ<R", // I
                    "",
                    "AY BR CU DH EQ FS GL IP JX KN MO TZ VW", // B
                    "BBBBB", -1, false
                ]
            }
        ]
    },
    // Enigma tests cover validation of rotors and reflector
]);
