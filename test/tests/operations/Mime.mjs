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
        input: "This is a GBK base64 encoded word: =?GBK?B?x/izx7ncvta52NPazfjC59Pfx+nQxc+i16g=?=.\nThis is a Cyrillic quoted word: =?utf-8?Q?=D0=A2=D0=B5=D1=81=D1=82_=D0=A2=D0=B5=D1=81=D1=82_=D0=A2=D0=B5=D1=81=D1=82?=.",
        expectedOutput: ["This is a GBK base64 encoded word: 区城管局关于网络舆情信息专.",
        "This is a Cyrillic quoted word: Тест Тест Тест."].join("\n"),
        recipeConfig: [
            {
                "op": "Decode Mime Encoded Words",
                "args": []
            }
        ]
    },
]);
