/**
 * Register tests
 *
 * @author tlwr [toby@toby.codes]
 *
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Register: RC4 key",
        input: "http://malwarez.biz/beacon.php?key=0e932a5c&data=8db7d5ebe38663a54ecbb334e3db11",
        expectedOutput:
            "zNu5y53uBoU2rm7qhq9ijjnVHSlJ9PJ/zpp+xL/to8qIBzkDwKzUNQ==",
        recipeConfig: [
            {
                op: "Register",
                args: ["key=([\\da-f]*)", true, false],
            },
            {
                op: "RC4",
                args: [
                    {
                        option: "Hex",
                        string: "$R0",
                    },
                    "Hex",
                    "Latin1",
                ],
            },
            {
                op: "To Base64",
                args: ["A-Za-z0-9+/="],
            },
        ],
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
                args: ["(.{32})", true, false],
            },
            {
                op: "Drop bytes",
                args: [0, 32, false],
            },
            {
                op: "AES Decrypt",
                args: [
                    {
                        option: "Hex",
                        string: "1748e7179bd56570d51fa4ba287cc3e5",
                    },
                    {
                        option: "Hex",
                        string: "$R0",
                    },
                    "CTR",
                    "Hex",
                    "Raw",
                    {
                        option: "Hex",
                        string: "",
                    },
                    {
                        option: "Hex",
                        string: "",
                    },
                ],
            },
        ],
    },
]);
