/**
 * Base64 tests.
 *
 * @author devcydo [devcydo@gmail.com]
 *
 * @copyright Crown Copyright 2022
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "XXTEA",
        input: "Hello World! 你好，中国！",
        expectedOutput: "QncB1C0rHQoZ1eRiPM4dsZtRi9pNrp7sqvX76cFXvrrIHXL6",
        reecipeConfig: [
            {
                args: "1234567890"
            },
        ],
    },
    {
        name: "XXTEA",
        input: "ნუ პანიკას",
        expectedOutput: "PbWjnbFmP8Apu2MKOGNbjeW/72IZLlLMS/g82ozLxwE=",
        reecipeConfig: [
            {
                args: "1234567890"
            },
        ],
    },
    {
        name: "XXTEA",
        input: "ნუ პანიკას",
        expectedOutput: "dHrOJ4ClIx6gH33NPSafYR2GG7UqsazY6Xfb0iekBY4=",
        reecipeConfig: [
            {
                args: "ll3kj209d2"
            },
        ],
    },
    {
        name: "XXTEA",
        input: "",
        expectedOutput: "Invalid input length (0)",
        reecipeConfig: [
            {
                args: "1234567890"
            },
        ],
    },
    {
        name: "XXTEA",
        input: "",
        expectedOutput: "Invalid input length (0)",
        reecipeConfig: [
            {
                args: ""
            },
        ],
    },
]);
