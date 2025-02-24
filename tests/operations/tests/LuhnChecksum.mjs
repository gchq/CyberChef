/**
 * From Decimal tests
 *
 * @author n1073645 [n1073645@gmail.com]
 * @author k3ach [k3ach@proton.me]
 * @copyright Crown Copyright 2020
 * @licence Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

const testCases = [
    {
        radix: 2,
        input: "01",
        checksum: "1",
        checkdigit: "1",
    }, {
        radix: 2,
        input: "001111",
        checksum: "0",
        checkdigit: "0",
    }, {
        radix: 2,
        input: "00011101",
        checksum: "0",
        checkdigit: "0",
    }, {
        radix: 2,
        input: "0100101101",
        checksum: "1",
        checkdigit: "1",
    }, {
        radix: 4,
        input: "0123",
        checksum: "1",
        checkdigit: "1",
    }, {
        radix: 4,
        input: "130100",
        checksum: "2",
        checkdigit: "2",
    }, {
        radix: 4,
        input: "32020313",
        checksum: "3",
        checkdigit: "0",
    }, {
        radix: 4,
        input: "302233210112",
        checksum: "3",
        checkdigit: "0",
    }, {
        radix: 6,
        input: "012345",
        checksum: "4",
        checkdigit: "4",
    }, {
        radix: 6,
        input: "134255",
        checksum: "2",
        checkdigit: "4",
    }, {
        radix: 6,
        input: "15021453",
        checksum: "5",
        checkdigit: "4",
    }, {
        radix: 6,
        input: "211450230513",
        checksum: "3",
        checkdigit: "1",
    }, {
        radix: 8,
        input: "01234567",
        checksum: "2",
        checkdigit: "2",
    }, {
        radix: 8,
        input: "340624",
        checksum: "0",
        checkdigit: "4",
    }, {
        radix: 8,
        input: "07260247",
        checksum: "3",
        checkdigit: "3",
    }, {
        radix: 8,
        input: "026742114675",
        checksum: "7",
        checkdigit: "1",
    }, {
        radix: 10,
        input: "0123456789",
        checksum: "7",
        checkdigit: "7",
    }, {
        radix: 10,
        input: "468543",
        checksum: "7",
        checkdigit: "4",
    }, {
        radix: 10,
        input: "59377601",
        checksum: "5",
        checkdigit: "6",
    }, {
        radix: 10,
        input: "013909981254",
        checksum: "1",
        checkdigit: "3",
    }, {
        radix: 12,
        input: "0123456789ab",
        checksum: "3",
        checkdigit: "3",
    }, {
        radix: 12,
        input: "284685",
        checksum: "0",
        checkdigit: "6",
    }, {
        radix: 12,
        input: "951a2661",
        checksum: "0",
        checkdigit: "8",
    }, {
        radix: 12,
        input: "898202676387",
        checksum: "b",
        checkdigit: "9",
    }, {
        radix: 14,
        input: "0123456789abcd",
        checksum: "a",
        checkdigit: "a",
    }, {
        radix: 14,
        input: "33db25",
        checksum: "0",
        checkdigit: "d",
    }, {
        radix: 14,
        input: "0b4ac128",
        checksum: "b",
        checkdigit: "3",
    }, {
        radix: 14,
        input: "3d1c6d16160d",
        checksum: "3",
        checkdigit: "c",
    }, {
        radix: 16,
        input: "0123456789abcdef",
        checksum: "4",
        checkdigit: "4",
    }, {
        radix: 16,
        input: "e1fe64",
        checksum: "b",
        checkdigit: "6",
    }, {
        radix: 16,
        input: "241a5dcd",
        checksum: "1",
        checkdigit: "9",
    }, {
        radix: 16,
        input: "1fea740e0e1f",
        checksum: "7",
        checkdigit: "4",
    }, {
        radix: 18,
        input: "0123456789abcdefgh",
        checksum: "d",
        checkdigit: "d",
    }, {
        radix: 18,
        input: "995dgf",
        checksum: "9",
        checkdigit: "1",
    }, {
        radix: 18,
        input: "9f80h32h",
        checksum: "1",
        checkdigit: "0",
    }, {
        radix: 18,
        input: "5f9428e493g4",
        checksum: "8",
        checkdigit: "c",
    }, {
        radix: 20,
        input: "0123456789abcdefghij",
        checksum: "5",
        checkdigit: "5",
    }, {
        radix: 20,
        input: "918jci",
        checksum: "h",
        checkdigit: "d",
    }, {
        radix: 20,
        input: "jab7j50d",
        checksum: "g",
        checkdigit: "j",
    }, {
        radix: 20,
        input: "c56fe85eb6gg",
        checksum: "g",
        checkdigit: "5",
    }, {
        radix: 22,
        input: "0123456789abcdefghijkl",
        checksum: "g",
        checkdigit: "g",
    }, {
        radix: 22,
        input: "de57le",
        checksum: "5",
        checkdigit: "l",
    }, {
        radix: 22,
        input: "e3fg6dfc",
        checksum: "f",
        checkdigit: "d",
    }, {
        radix: 22,
        input: "1f8l80ai4kbg",
        checksum: "l",
        checkdigit: "f",
    }, {
        radix: 24,
        input: "0123456789abcdefghijklmn",
        checksum: "6",
        checkdigit: "6",
    }, {
        radix: 24,
        input: "agne7d",
        checksum: "4",
        checkdigit: "f",
    }, {
        radix: 24,
        input: "1l4d9cf4",
        checksum: "d",
        checkdigit: "c",
    }, {
        radix: 24,
        input: "blc1j09i3296",
        checksum: "8",
        checkdigit: "7",
    }, {
        radix: 26,
        input: "0123456789abcdefghijklmnop",
        checksum: "j",
        checkdigit: "j",
    }, {
        radix: 26,
        input: "82n9op",
        checksum: "i",
        checkdigit: "2",
    }, {
        radix: 26,
        input: "e9cddn70",
        checksum: "9",
        checkdigit: "i",
    }, {
        radix: 26,
        input: "ck0ep419knom",
        checksum: "p",
        checkdigit: "g",
    }, {
        radix: 28,
        input: "0123456789abcdefghijklmnopqr",
        checksum: "7",
        checkdigit: "7",
    }, {
        radix: 28,
        input: "a6hnoo",
        checksum: "h",
        checkdigit: "9",
    }, {
        radix: 28,
        input: "lblc7kh0",
        checksum: "a",
        checkdigit: "f",
    }, {
        radix: 28,
        input: "64k5piod3lmf",
        checksum: "0",
        checkdigit: "p",
    }, {
        radix: 30,
        input: "0123456789abcdefghijklmnopqrst",
        checksum: "m",
        checkdigit: "m",
    }, {
        radix: 30,
        input: "t69j7d",
        checksum: "9",
        checkdigit: "s",
    }, {
        radix: 30,
        input: "p54o9ig3",
        checksum: "a",
        checkdigit: "o",
    }, {
        radix: 30,
        input: "gc1njrt55030",
        checksum: "6",
        checkdigit: "1",
    }, {
        radix: 32,
        input: "0123456789abcdefghijklmnopqrstuv",
        checksum: "8",
        checkdigit: "8",
    }, {
        radix: 32,
        input: "rdou19",
        checksum: "u",
        checkdigit: "3",
    }, {
        radix: 32,
        input: "ighj0pc7",
        checksum: "3",
        checkdigit: "8",
    }, {
        radix: 32,
        input: "op4nn5fvjsrs",
        checksum: "g",
        checkdigit: "j",
    }, {
        radix: 34,
        input: "0123456789abcdefghijklmnopqrstuvwx",
        checksum: "p",
        checkdigit: "p",
    }, {
        radix: 34,
        input: "nvftj5",
        checksum: "b",
        checkdigit: "f",
    }, {
        radix: 34,
        input: "u9v9g162",
        checksum: "j",
        checkdigit: "b",
    }, {
        radix: 34,
        input: "o5gqg5d7gjh9",
        checksum: "5",
        checkdigit: "q",
    }, {
        radix: 36,
        input: "0123456789abcdefghijklmnopqrstuvwxyz",
        checksum: "9",
        checkdigit: "9",
    }, {
        radix: 36,
        input: "29zehu",
        checksum: "i",
        checkdigit: "j",
    }, {
        radix: 36,
        input: "1snmikbu",
        checksum: "s",
        checkdigit: "v",
    }, {
        radix: 36,
        input: "jpkar545q7gb",
        checksum: "3",
        checkdigit: "d",
    },
];

testCases.forEach(element => {
    TestRegister.addTests([
        {
            name: "Luhn Checksum Mod " + element.radix + " on " + element.input,
            input: element.input,
            expectedOutput: "Checksum: " + element.checksum + "\nCheckdigit: " + element.checkdigit + "\nLuhn Validated String: " + element.input + element.checkdigit,
            recipeConfig: [
                {
                    op: "Luhn Checksum",
                    args: [element.radix]
                },
            ],
        },
    ]);
});

TestRegister.addTests([
    {
        name: "Luhn Checksum on standard data",
        input: "35641709012469",
        expectedOutput: "Checksum: 7\nCheckdigit: 0\nLuhn Validated String: 356417090124690",
        recipeConfig: [
            {
                op: "Luhn Checksum",
                args: [10]
            },
        ],
    },
    {
        name: "Luhn Checksum on standard data 2",
        input: "896101950123440000",
        expectedOutput: "Checksum: 5\nCheckdigit: 1\nLuhn Validated String: 8961019501234400001",
        recipeConfig: [
            {
                op: "Luhn Checksum",
                args: [10]
            },
        ],
    },
    {
        name: "Luhn Checksum on standard data 3",
        input: "35726908971331",
        expectedOutput: "Checksum: 6\nCheckdigit: 7\nLuhn Validated String: 357269089713317",
        recipeConfig: [
            {
                op: "Luhn Checksum",
                args: [10]
            },
        ],
    },
    {
        name: "Luhn Checksum on empty data",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "Luhn Checksum",
                args: [10]
            },
        ],
    },
]);
