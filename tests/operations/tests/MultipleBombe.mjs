/**
 * Bombe machine tests.
 * @author s2224834
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister";

TestRegister.addTests([
    {
        name: "Multi-Bombe: 3 rotor",
        input: "BBYFLTHHYIJQAYBBYS",
        expectedMatch: /<td>LGA<\/td> {2}<td>SS<\/td> {2}<td>VFISUSGTKSTMPSUNAK<\/td>/,
        recipeConfig: [
            {
                "op": "Multiple Bombe",
                "args": [
                    // I, II and III
                    "User defined",
                    "EKMFLGDQVZNTOWYHXUSPAIBRCJ<R\nAJDKSIRUXBLHWTMCQGZNPYFVOE<F\nBDFHJLCPRTXVZNYEIWGAKMUSQO<W",
                    "",
                    "AY BR CU DH EQ FS GL IP JX KN MO TZ VW", // B
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
        expectedMatch: /<td>LHSC<\/td><td>SS<\/td><td>HHHSSSGQUUQPKSEKWK<\/td>/,
        recipeConfig: [
            {
                "op": "Multiple Bombe",
                "args": [
                    // I, II and III
                    "User defined",
                    "EKMFLGDQVZNTOWYHXUSPAIBRCJ<R\nAJDKSIRUXBLHWTMCQGZNPYFVOE<F\nBDFHJLCPRTXVZNYEIWGAKMUSQO<W",
                    "LEYJVCNIXWPBQMDRTAKZGFUHOS", // Beta
                    "AE BN CK DQ FU GY HW IJ LO MP RX SZ TV", // B thin
                    "THISISATESTMESSAGE", 0, false
                ]
            }
        ]
    },
    */
]);
