/**
 * Mime tests.
 *
 * @author bwhitn [brian.m.whitney@outlook.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */
import TestRegister from "../../TestRegister";

TestRegister.addTests([
    {
        name: "Decode Mime Encoded Words",
        input: "This is a GBK base64 encoded word: =?GBK?B?572R57uc5Y6o5biI?=\nThis is a Cyrillic quoted word: =?utf-8?Q?=D0=A2=D0=B5=D1=81=D1=82_=D0=A2=D0=B5=D1=81=D1=82_=D0=A2=D0=B5=D1=81=D1=82?=.",
        expectedOutput: "This is a GBK base64 encoded word: 网络厨师.\nThis is a Cyrillic quoted word: Кибер Шеф.",
        recipeConfig: [
            {
                "op": "Decode Mime Encoded Words",
                "args": []
            }
        ]
    },
]);
