/**
 * DateTime tests.
 *
 * @author bwhitn [brian.m.whitney@outlook.com]
 *
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Filetime to Unix",
        input: "129207366395297693",
        expectedOutput: "1276263039529769300",
        recipeConfig: [
            {
                op: "Windows Filetime to UNIX Timestamp",
                args: ["Nanoseconds (ns)", "Decimal"]
            }
        ]
    },
    {
        name: "Unix to Filetime",
        input: "1276263039529769300",
        expectedOutput: "129207366395297693",
        recipeConfig: [
            {
                op: "UNIX Timestamp to Windows Filetime",
                args: ["Nanoseconds (ns)", "Decimal"]
            }
        ]
    }
]);
