/**
 * Mime tests.
 *
 * @author bwhitn [brian.m.whitney@outlook.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */
import TestRegister from "../TestRegister";

TestRegister.addTests([
    {
        name: "Decode Mime Encoded Words",
        input: "This is a GBK base64 encoded word: =?GBK?B?zfjC57P4yqY=?=.\nThis is a Cyrillic UTF-8 quoted word: =?utf-8?Q?=d0=9a=d0=b8=d0=b1=d0=b5=d1=80_=d0=a8=d0=b5=d1=84?=.",
        expectedOutput: "This is a GBK base64 encoded word: 网络厨师.\nThis is a Cyrillic UTF-8 quoted word: Кибер Шеф.",
        recipeConfig: [
            {
                op: "Decode Mime Encoded Words",
                args: []
            }
        ]
    },
]);
