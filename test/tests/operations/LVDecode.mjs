/**
 * LV Decoder tests.
 *
 * @author gchq77703 []
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import TestRegister from "../../TestRegister";

TestRegister.addTests([
    {
        name: "LVDecode: LengthValue",
        input: "\x05\x48\x6f\x75\x73\x65\x04\x72\x6f\x6f\x6d\x04\x64\x6f\x6f\x72",
        expectedOutput: JSON.stringify([{"length": 5, "value": [72, 111, 117, 115, 101]}, {"length": 4, "value": [114, 111, 111, 109]}, {"length": 4, "value": [100, 111, 111, 114]}]),
        recipeConfig: [
            {
                "op": "LV Decode",
                "args": ["0 Bytes (No Key)", "1 Byte", false]
            }
        ]
    },
    {
        name: "LVDecode: LengthValue with BER",
        input: "\x05\x48\x6f\x75\x73\x65\x04\x72\x6f\x6f\x6d\x04\x64\x6f\x6f\x72",
        expectedOutput: JSON.stringify([{"length": 5, "value": [72, 111, 117, 115, 101]}, {"length": 4, "value": [114, 111, 111, 109]}, {"length": 4, "value": [100, 111, 111, 114]}]),
        recipeConfig: [
            {
                "op": "LV Decode",
                "args": ["0 Bytes (No Key)", "4 Bytes", false] // length value is patently wrong, should be ignored by BER.
            }
        ]
    },
    {
        name: "LVDecode: KeyLengthValue",
        input: "\x04\x05\x48\x6f\x75\x73\x65\x05\x04\x72\x6f\x6f\x6d\x42\x04\x64\x6f\x6f\x72",
        expectedOutput: JSON.stringify([{"key":[4],"length":5,"value":[72,111,117,115,101]},{"key":[5],"length":4,"value":[114,111,111,109]},{"key":[66],"length":4,"value":[100,111,111,114]}]),
        recipeConfig: [
            {
                "op": "LV Decode",
                "args": ["1 Byte", "1 Byte", false]
            }
        ]
    },
    {
        name: "LVDecode: KeyLengthValue with BER",
        input: "\x04\x05\x48\x6f\x75\x73\x65\x05\x04\x72\x6f\x6f\x6d\x42\x04\x64\x6f\x6f\x72",
        expectedOutput: JSON.stringify([{"key":[4],"length":5,"value":[72,111,117,115,101]},{"key":[5],"length":4,"value":[114,111,111,109]},{"key":[66],"length":4,"value":[100,111,111,114]}]),
        recipeConfig: [
            {
                "op": "LV Decode",
                "args": ["1 Byte", "4 Byte", true] // length value is patently wrong, should be ignored by BER.
            }
        ]
    }
]);
