/**
 * Bombe machine tests.
 * @author s2224834
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */
import TestRegister from "../TestRegister";

TestRegister.addTests([
    {
        name: "Multi-Bombe: 3 rotor",
        input: "BBYFLTHHYIJQAYBBYS",
        expectedMatch: /LGA \(plugboard: SS\): VFISUSGTKSTMPSUNAK/,
        recipeConfig: [
            {
                "op": "Multiple Bombe",
                "args": [
                    // I, II and III
                    "User defined", "EKMFLGDQVZNTOWYHXUSPAIBRCJ<R\nAJDKSIRUXBLHWTMCQGZNPYFVOE<F\nBDFHJLCPRTXVZNYEIWGAKMUSQO<W",
                    "User defined", "",
                    "User defined", "AY BR CU DH EQ FS GL IP JX KN MO TZ VW", // B
                    "THISISATESTMESSAGE", 0, false
                ]
            }
        ]
    },
    /*
     * This is too slow to run regularly
    {
        name: "Multi-Bombe: 4 rotor",
        input: "LUOXGJSHGEDSRDOQQX",
        expectedMatch: /LHSC \(plugboard: SS\): HHHSSSGQUUQPKSEKWK/,
        recipeConfig: [
            {
                "op": "Multiple Bombe",
                "args": [
                    // I, II and III
                    "User defined", "EKMFLGDQVZNTOWYHXUSPAIBRCJ<R\nAJDKSIRUXBLHWTMCQGZNPYFVOE<F\nBDFHJLCPRTXVZNYEIWGAKMUSQO<W",
                    "User defined", "LEYJVCNIXWPBQMDRTAKZGFUHOS", // Beta
                    "User defined", "AE BN CK DQ FU GY HW IJ LO MP RX SZ TV", // B thin
                    "THISISATESTMESSAGE", 0, false
                ]
            }
        ]
    },
    */
]);
