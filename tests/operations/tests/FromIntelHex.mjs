/**
* FromIntelHex tests
*
* @author bueddl [mail@bueddl.de]
* @copyright Crown Copyright 2026
* @license Apache-2.0
*/

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "From Intel Hex: data records",
        input: ":10010000214601360121470136007EFE09D2190140\n" +
            ":100110002146017E17C20001FF5F16002148011928\n" +
            ":10012000194E79234623965778239EDA3F01B2CAA7\n" +
            ":100130003F0156702B5E712B722B732146013421C7\n" +
            ":00000001FF",
        expectedOutput: "214601360121470136007efe09d21901" +
            "2146017e17c20001ff5f160021480119" +
            "194e79234623965778239eda3f01b2ca" +
            "3f0156702b5e712b722b732146013421",
        recipeConfig: [
            { op: "From Intel Hex", args: [] },
            { op: "To Hex", args: ["None", 0] },
        ],
    },
    {
        name: "From Intel Hex: gap filled with 0xFF",
        input: ":020100001122CA\n" +
            ":02010400334482\n" +
            ":00000001FF",
        expectedOutput: "1122ffff3344",
        recipeConfig: [
            { op: "From Intel Hex", args: [] },
            { op: "To Hex", args: ["None", 0] },
        ],
    },
    {
        name: "From Intel Hex: extended linear address",
        input: ":020000040800F2\n" +
            ":04000000DEADBEEFC4\n" +
            ":00000001FF",
        expectedOutput: "deadbeef",
        recipeConfig: [
            { op: "From Intel Hex", args: [] },
            { op: "To Hex", args: ["None", 0] },
        ],
    },
    {
        name: "From Intel Hex: invalid checksum",
        input: ":10010000214601360121470136007EFE09D2190141\n" +
            ":00000001FF",
        expectedOutput: "Invalid checksum on line 1 (got 41, expected 40)",
        recipeConfig: [
            { op: "From Intel Hex", args: [] },
        ],
    },
    {
        name: "From Intel Hex: empty input",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            { op: "From Intel Hex", args: [] },
        ],
    },
]);
