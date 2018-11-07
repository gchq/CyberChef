/**
 * SeqUtils tests.
 *
 * @author Chris van Marle
 * @copyright Copyright 2017
 * @license Apache-2.0
 */
import TestRegister from "../../TestRegister";

TestRegister.addTests([
    {
        name: "SeqUtils - Numeric sort photos",
        input: "Photo-1.jpg\nPhoto-4.jpg\nPhoto-2.jpg\nPhoto-3.jpg",
        expectedOutput: "Photo-1.jpg\nPhoto-2.jpg\nPhoto-3.jpg\nPhoto-4.jpg",
        recipeConfig: [
            {
                "op": "Sort",
                "args": ["Line feed", false, "Numeric"]
            }
        ],
    },
    {
        name: "SeqUtils - Numeric sort CVE IDs",
        input: "CVE-2017-1234,CVE-2017-9999,CVE-2017-10000,CVE-2017-10001,CVE-2017-12345,CVE-2016-1234,CVE-2016-4321,CVE-2016-10000,CVE-2016-9999,CVE-2016-10001",
        expectedOutput: "CVE-2017-12345,CVE-2017-10001,CVE-2017-10000,CVE-2017-9999,CVE-2017-1234,CVE-2016-10001,CVE-2016-10000,CVE-2016-9999,CVE-2016-4321,CVE-2016-1234",
        recipeConfig: [
            {
                "op": "Sort",
                "args": ["Comma", true, "Numeric"]
            }
        ],
    },
    {
        name: "SeqUtils - Hexadecimal sort",
        input: "06,08,0a,0d,0f,1,10,11,12,13,14,15,16,17,18,19,1a,1b,1c,1d,1e,1f,2,3,4,5,7,9,b,c,e",
        expectedOutput: "1,2,3,4,5,06,7,08,9,0a,b,c,0d,e,0f,10,11,12,13,14,15,16,17,18,19,1a,1b,1c,1d,1e,1f",
        recipeConfig: [
            {
                "op": "Sort",
                "args": ["Comma", false, "Numeric (hexadecimal)"]
            }
        ],
    },
]);
