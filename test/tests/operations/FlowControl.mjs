/**
 * Flow Control tests.
 *
 * @author tlwr [toby@toby.codes]
 *
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */
import TestRegister from "../../TestRegister";

const ALL_BYTES = [
    "\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f",
    "\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1a\x1b\x1c\x1d\x1e\x1f",
    "\x20\x21\x22\x23\x24\x25\x26\x27\x28\x29\x2a\x2b\x2c\x2d\x2e\x2f",
    "\x30\x31\x32\x33\x34\x35\x36\x37\x38\x39\x3a\x3b\x3c\x3d\x3e\x3f",
    "\x40\x41\x42\x43\x44\x45\x46\x47\x48\x49\x4a\x4b\x4c\x4d\x4e\x4f",
    "\x50\x51\x52\x53\x54\x55\x56\x57\x58\x59\x5a\x5b\x5c\x5d\x5e\x5f",
    "\x60\x61\x62\x63\x64\x65\x66\x67\x68\x69\x6a\x6b\x6c\x6d\x6e\x6f",
    "\x70\x71\x72\x73\x74\x75\x76\x77\x78\x79\x7a\x7b\x7c\x7d\x7e\x7f",
    "\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8a\x8b\x8c\x8d\x8e\x8f",
    "\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9a\x9b\x9c\x9d\x9e\x9f",
    "\xa0\xa1\xa2\xa3\xa4\xa5\xa6\xa7\xa8\xa9\xaa\xab\xac\xad\xae\xaf",
    "\xb0\xb1\xb2\xb3\xb4\xb5\xb6\xb7\xb8\xb9\xba\xbb\xbc\xbd\xbe\xbf",
    "\xc0\xc1\xc2\xc3\xc4\xc5\xc6\xc7\xc8\xc9\xca\xcb\xcc\xcd\xce\xcf",
    "\xd0\xd1\xd2\xd3\xd4\xd5\xd6\xd7\xd8\xd9\xda\xdb\xdc\xdd\xde\xdf",
    "\xe0\xe1\xe2\xe3\xe4\xe5\xe6\xe7\xe8\xe9\xea\xeb\xec\xed\xee\xef",
    "\xf0\xf1\xf2\xf3\xf4\xf5\xf6\xf7\xf8\xf9\xfa\xfb\xfc\xfd\xfe\xff",
].join("");

TestRegister.addTests([
    {
        name: "Fork: nothing",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "Fork",
                args: ["\n", "\n", false],
            },
        ],
    },
    {
        name: "Fork, Merge: nothing",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "Fork",
                args: ["\n", "\n", false],
            },
            {
                op: "Merge",
                args: [],
            },
        ],
    },
    {
        name: "Fork, (expect) Error, Merge",
        input: "1.1\n2.5\na\n3.4",
        expectedError: true,
        recipeConfig: [
            {
                op: "Fork",
                args: ["\n", "\n", false],
            },
            {
                op: "Object Identifier to Hex",
                args: [],
            },
            {
                op: "Merge",
                args: [],
            },
        ],
    },
    {
        name: "Fork, Conditional Jump, Encodings",
        input: "Some data with a 1 in it\nSome data with a 2 in it",
        expectedOutput: "U29tZSBkYXRhIHdpdGggYSAxIGluIGl0\n53 6f 6d 65 20 64 61 74 61 20 77 69 74 68 20 61 20 32 20 69 6e 20 69 74\n",
        recipeConfig: [
            {"op": "Fork", "args": ["\\n", "\\n", false]},
            {"op": "Conditional Jump", "args": ["1", false, "skipReturn", "10"]},
            {"op": "To Hex", "args": ["Space"]},
            {"op": "Return", "args": []},
            {"op": "Label", "args": ["skipReturn"]},
            {"op": "To Base64", "args": ["A-Za-z0-9+/="]}
        ]
    },
    {
        name: "Jump: Empty Label",
        input: [
            "should be changed",
        ].join("\n"),
        expectedOutput: [
            "should be changed was changed",
        ].join("\n"),
        recipeConfig: [
            {
                op: "Jump",
                args: ["", 10],
            },
            {
                op: "Find / Replace",
                args: [
                    {
                        "option": "Regex",
                        "string": "should be changed"
                    },
                    "should be changed was changed",
                    true,
                    true,
                    true,
                ],
            },
        ],
    },
    {
        name: "Jump: skips 1",
        input: [
            "shouldnt be changed",
        ].join("\n"),
        expectedOutput: [
            "shouldnt be changed",
        ].join("\n"),
        recipeConfig: [
            {
                op: "Jump",
                args: ["skipReplace", 10],
            },
            {
                op: "Find / Replace",
                args: [
                    {
                        "option": "Regex",
                        "string": "shouldnt be changed"
                    },
                    "shouldnt be changed was changed",
                    true,
                    true,
                    true,
                ],
            },
            {
                op: "Label",
                args: ["skipReplace"]
            },
        ],
    },
    {
        name: "Conditional Jump: Skips 0",
        input: [
            "match",
            "should be changed 1",
            "should be changed 2",
        ].join("\n"),
        expectedOutput: [
            "match",
            "should be changed 1 was changed",
            "should be changed 2 was changed"
        ].join("\n"),
        recipeConfig: [
            {
                op: "Conditional Jump",
                args: ["match", false, "", 0],
            },
            {
                op: "Find / Replace",
                args: [
                    {
                        "option": "Regex",
                        "string": "should be changed 1"
                    },
                    "should be changed 1 was changed",
                    true,
                    true,
                    true,
                ],
            },
            {
                op: "Find / Replace",
                args: [
                    {
                        "option": "Regex",
                        "string": "should be changed 2"
                    },
                    "should be changed 2 was changed",
                    true,
                    true,
                    true,
                ],
            },
        ],
    },
    {
        name: "Comment: nothing",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                "op": "Comment",
                "args": [""]
            }
        ]
    },
    {
        name: "Fork, Comment, Base64",
        input: "cat\nsat\nmat",
        expectedOutput: "Y2F0\nc2F0\nbWF0\n",
        recipeConfig: [
            {
                "op": "Fork",
                "args": ["\\n", "\\n", false]
            },
            {
                "op": "Comment",
                "args": ["Testing 123"]
            },
            {
                "op": "To Base64",
                "args": ["A-Za-z0-9+/="]
            }
        ]
    },
    {
        name: "Conditional Jump: Skips 1",
        input: [
            "match",
            "should not be changed",
            "should be changed",
        ].join("\n"),
        expectedOutput: [
            "match",
            "should not be changed",
            "should be changed was changed"
        ].join("\n"),
        recipeConfig: [
            {
                op: "Conditional Jump",
                args: ["match", false, "skip match", 10],
            },
            {
                op: "Find / Replace",
                args: [
                    {
                        "option": "Regex",
                        "string": "should not be changed"
                    },
                    "should not be changed was changed",
                    true,
                    true,
                    true,
                ],
            },
            {
                op: "Label", args: ["skip match"],
            },
            {
                op: "Find / Replace",
                args: [
                    {
                        "option": "Regex",
                        "string": "should be changed"
                    },
                    "should be changed was changed",
                    true,
                    true,
                    true,
                ],
            },
        ],
    },
    {
        name: "Conditional Jump: Skips backwards",
        input: [
            "match",
        ].join("\n"),
        expectedOutput: [
            "replaced",
        ].join("\n"),
        recipeConfig: [
            {
                op: "Label",
                args: ["back to the beginning"],
            },
            {
                op: "Jump",
                args: ["skip replace"],
            },
            {
                op: "Find / Replace",
                args: [
                    {
                        "option": "Regex",
                        "string": "match"
                    },
                    "replaced",
                    true,
                    true,
                    true,
                ],
            },
            {
                op: "Label",
                args: ["skip replace"],
            },
            {
                op: "Conditional Jump",
                args: ["match", false, "back to the beginning", 10],
            },
        ],
    },
    {
        name: "Register: RC4 key",
        input: "http://malwarez.biz/beacon.php?key=0e932a5c&data=8db7d5ebe38663a54ecbb334e3db11",
        expectedOutput: "All the secrets",
        recipeConfig: [
            {
                op: "Register",
                args: ["key=([\\da-f]*)", true, false]
            },
            {
                op: "Find / Replace",
                args: [
                    {
                        "option": "Regex",
                        "string": ".*data=(.*)"
                    }, "$1", true, false, true
                ]
            },
            {
                op: "RC4",
                args: [
                    {
                        "option": "Hex",
                        "string": "$R0"
                    }, "Hex", "Latin1"
                ]
            }
        ]
    },
    {
        name: "Register: AES key",
        input: "51e201d463698ef5f717f71f5b4712af20be674b3bff53d38546396ee61daac4908e319ca3fcf7089bfb6b38ea99e781d26e577ba9dd6f311a39420b8978e93014b042d44726caedf5436eaf652429c0df94b521676c7c2ce812097c277273c7c72cd89aec8d9fb4a27586ccf6aa0aee224c34ba3bfdf7aeb1ddd477622b91e72c9e709ab60f8daf731ec0cc85ce0f746ff1554a5a3ec291ca40f9e629a872592d988fdd834534aba79c1ad1676769a7c010bf04739ecdb65d95302371d629d9e37e7b4a361da468f1ed5358922d2ea752dd11c366f3017b14aa011d2af03c44f95579098a15e3cf9b4486f8ffe9c239f34de7151f6ca6500fe4b850c3f1c02e801caf3a24464614e42801615b8ffaa07ac8251493ffda7de5ddf3368880c2b95b030f41f8f15066add071a66cf60e5f46f3a230d397b652963a21a53f",
        expectedOutput: `"You know," said Arthur, "it's at times like this, when I'm trapped in a Vogon airlock with a man from Betelgeuse, and about to die of asphyxiation in deep space that I really wish I'd listened to what my mother told me when I was young."
"Why, what did she tell you?"
"I don't know, I didn't listen."`,
        recipeConfig: [
            {
                op: "Register",
                args: ["(.{32})", true, false]
            },
            {
                op: "Drop bytes",
                args: [0, 32, false]
            },
            {
                op: "AES Decrypt",
                args: [
                    {
                        "option": "Hex",
                        "string": "1748e7179bd56570d51fa4ba287cc3e5"
                    },
                    {
                        "option": "Hex",
                        "string": "$R0"
                    },
                    "CTR", "Hex", "Raw",
                    {
                        "option": "Hex",
                        "string": ""
                    }
                ]
            }
        ]
    },
    {
        name: "Label, Comment: Complex content",
        input: ALL_BYTES,
        expectedOutput: ALL_BYTES,
        recipeConfig: [
            {
                op: "Label",
                args: [""]
            },
            {
                op: "Comment",
                args: [""]
            }
        ]
    },
]);
