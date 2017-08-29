/**
 * MS tests.
 *
 * @author bwhitn [brian.m.whitney@outlook.com]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */
import TestRegister from "../../TestRegister.js";

TestRegister.addTests([
    {
        name: "Microsoft Script Decoder",
        input: "#@~^RQAAAA==-mD~sX|:/TP{~J:+dYbxL~@!F@*@!+@*@!&@*eEI@#@&@#@&\x7fjm.raY 214Wv:zms/obI0xEAAA==^#~@",
        expectedOutput: "var my_msg = \"Testing <1><2><3>!\";\r\n\r\nWScript.Echo(my_msg);",
        recipeConfig: [
            {
                "op": "Microsoft Script Decoder",
                "args": []
            },
        ],
    },
]);
