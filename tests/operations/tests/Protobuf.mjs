/**
 * Protobuf tests.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Protobuf Decode: no schema",
        input: "0d1c0000001203596f751a024d65202b2a0a0a066162633132331200",
        expectedOutput: JSON.stringify({
            "1": 28,
            "2": "You",
            "3": "Me",
            "4": 43,
            "5": {
                "1": "abc123",
                "2": {}
            }
        }, null, 4),
        recipeConfig: [
            {
                "op": "From Hex",
                "args": ["Auto"]
            },
            {
                "op": "Protobuf Decode",
                "args": ["", false, false]
            }
        ]
    },
    {
        name: "Protobuf Decode: partial schema, no unknown fields",
        input: "0d1c0000001203596f751a024d65202b2a0a0a066162633132331200",
        expectedOutput: JSON.stringify({
            "Apple": [
                28
            ],
            "Carrot": [
                "Me"
            ],
            "Banana": "You"
        }, null, 4),
        recipeConfig: [
            {
                "op": "From Hex",
                "args": ["Auto"]
            },
            {
                "op": "Protobuf Decode",
                "args": [
                    `message Test {
                    repeated fixed32 Apple = 1;
                    optional string Banana = 2;
                    repeated string Carrot = 3;
                    }`,
                    false,
                    false
                ]
            }
        ]
    },
    {
        name: "Protobuf Decode: partial schema, show unknown fields",
        input: "0d1c0000001203596f751a024d65202b2a0a0a066162633132331200",
        expectedOutput: JSON.stringify({
            "Test": {
                "Apple": [
                    28
                ],
                "Carrot": [
                    "Me"
                ],
                "Banana": "You"
            },
            "Unknown Fields": {
                "4": 43,
                "5": {
                    "1": "abc123",
                    "2": {}
                }
            }
        }, null, 4),
        recipeConfig: [
            {
                "op": "From Hex",
                "args": ["Auto"]
            },
            {
                "op": "Protobuf Decode",
                "args": [
                    `message Test {
                    repeated fixed32 Apple = 1;
                    optional string Banana = 2;
                    repeated string Carrot = 3;
                    }`,
                    true,
                    false
                ]
            }
        ]
    },
    {
        name: "Protobuf Decode: full schema, no unknown fields",
        input: "0d1c0000001203596f751a024d65202b2a0a0a06616263313233120031ff00000000000000",
        expectedOutput: JSON.stringify({
            "Apple": [
                28
            ],
            "Carrot": [
                "Me"
            ],
            "Banana": "You",
            "Date": 43,
            "Elderberry": {
                "Fig": "abc123",
                "Grape": {}
            },
            "Huckleberry": 255
        }, null, 4),
        recipeConfig: [
            {
                "op": "From Hex",
                "args": ["Auto"]
            },
            {
                "op": "Protobuf Decode",
                "args": [
                    `message Test {
                        repeated fixed32 Apple = 1;
                        optional string Banana = 2;
                        repeated string Carrot = 3;
                        optional int32 Date = 4;
                        optional subTest Elderberry = 5;
                        optional fixed64 Huckleberry = 6;
                    }
                    message subTest {
                        optional string Fig = 1;
                        optional subSubTest Grape = 2;
                    }
                    message subSubTest {}`,
                    false,
                    false
                ]
            }
        ]
    },
    {
        name: "Protobuf Decode: partial schema, show unknown fields, show types",
        input: "0d1c0000001203596f751a024d65202b2a0a0a06616263313233120031ba32a96cc10200003801",
        expectedOutput: JSON.stringify({
            "Test": {
                "Carrot (string)": [
                    "Me"
                ],
                "Banana (string)": "You",
                "Date (int32)": 43,
                "Imbe (Options)": "Option1"
            },
            "Unknown Fields": {
                "field #1: 32-Bit (e.g. fixed32, float)": 28,
                "field #5: L-delim (e.g. string, message)": {
                    "field #1: L-delim (e.g. string, message)": "abc123",
                    "field #2: L-delim (e.g. string, message)": {}
                },
                "field #6: 64-Bit (e.g. fixed64, double)": 3029774971578
            }
        }, null, 4),
        recipeConfig: [
            {
                "op": "From Hex",
                "args": ["Auto"]
            },
            {
                "op": "Protobuf Decode",
                "args": [
                    `message Test {
                        optional string Banana = 2;
                        repeated string Carrot = 3;
                        optional int32 Date = 4;
                        optional Options Imbe = 7;
                    }
                    message subTest {
                        optional string Fig = 1;
                        optional subSubTest Grape = 2;
                    }
                    message subSubTest {}
                    enum Options {
                    Option0 = 0;
                    Option1 = 1;
                    Option2 = 2;
                    }`,
                    true,
                    true
                ]
            }
        ]
    },
    {
        name: "Protobuf Encode",
        input: JSON.stringify({
            "Apple": [
                28
            ],
            "Banana": "You",
            "Carrot": [
                "Me"
            ],
            "Date": 43,
            "Elderberry": {
                "Fig": "abc123",
                "Grape": {}
            },
            "Huckleberry": [3029774971578],
            "Imbe": 1
        }, null, 4),
        expectedOutput: "0d1c0000001203596f751a024d65202b2a0a0a06616263313233120031ba32a96cc10200003801",
        recipeConfig: [
            {
                "op": "Protobuf Encode",
                "args": [
                    `message Test {
                        repeated fixed32 Apple = 1;
                        optional string Banana = 2;
                        repeated string Carrot = 3;
                        optional int32 Date = 4;
                        optional subTest Elderberry = 5;
                        repeated fixed64 Huckleberry = 6;
                        optional Options Imbe = 7;
                    }
                    message subTest {
                        optional string Fig = 1;
                        optional subSubTest Grape = 2;
                    }
                    message subSubTest {}
                    enum Options {
                    Option0 = 0;
                    Option1 = 1;
                    Option2 = 2;
                    }`
                ]
            },
            {
                "op": "To Hex",
                "args": [
                    "None",
                    0
                ]
            }
        ]
    },
    {
        name: "Protobuf Encode: incomplete schema",
        input: JSON.stringify({
            "Apple": [
                28
            ],
            "Banana": "You",
            "Carrot": [
                "Me"
            ],
            "Date": 43,
            "Elderberry": {
                "Fig": "abc123",
                "Grape": {}
            },
            "Huckleberry": [3029774971578],
            "Imbe": 1
        }, null, 4),
        expectedOutput: "1203596f75202b2a0a0a06616263313233120031ba32a96cc1020000",
        recipeConfig: [
            {
                "op": "Protobuf Encode",
                "args": [
                    `message Test {
                        optional string Banana = 2;
                        optional int32 Date = 4;
                        optional subTest Elderberry = 5;
                        repeated fixed64 Huckleberry = 6;
                    }
                    message subTest {
                        optional string Fig = 1;
                        optional subSubTest Grape = 2;
                    }
                    message subSubTest {}
                    enum Options {
                    Option0 = 0;
                    Option1 = 1;
                    Option2 = 2;
                    }`
                ]
            },
            {
                "op": "To Hex",
                "args": [
                    "None",
                    0
                ]
            }
        ]
    },
    {
        name: "Protobuf Stream Decode: no schema",
        input: "0d081c1203596f751a024d65202b0c0a0a0a066162633132331200",
        expectedOutput: JSON.stringify([
            {
                "1": 28,
                "2": "You",
                "3": "Me",
                "4": 43
            },
            {
                "1": {
                    "1": "abc123",
                    "2": {}
                }
            }
        ], null, 4),
        recipeConfig: [
            {
                "op": "From Hex",
                "args": ["Auto"]
            },
            {
                "op": "Protobuf Stream Decode",
                "args": [false]
            }
        ]
    },

]);
