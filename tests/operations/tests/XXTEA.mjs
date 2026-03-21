/**
 * XXTEA tests.
 *
 * @author devcydo [devcydo@gmail.com]
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "XXTEA Encrypt and Decrypt",
        input: "Hello World! 你好，中国！",
        expectedOutput: "Hello World! 你好，中国！",
        recipeConfig: [
            {
                "op": "XXTEA Encrypt",
                "args": [{ "option": "UTF8", "string": "1234567890" }]
            },
            {
                "op": "XXTEA Decrypt",
                "args": [{ "option": "UTF8", "string": "1234567890" }]
            }
        ],
    },
    {
        name: "XXTEA Encrypt",
        input: "ნუ პანიკას",
        expectedOutput: "3db5a39db1663fc029bb630a38635b8de5bfef62192e52cc4bf83cda8ccbc701",
        recipeConfig: [
            {
                "op": "XXTEA Encrypt",
                "args": [{ "option": "UTF8", "string": "1234567890" }]
            },
            {
                "op": "To Hex",
                "args": ["None", 0]
            }
        ],
    }
]);
