/**
 * Python marshal operation tests.
 *
 * @author GCHQ
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

/*
 * The decode fixtures below were generated with CPython 3.14.4. Reproduce them
 * with the following script (the explicit version keeps the fixtures stable as
 * CPython's default marshal format evolves):
 *
 * import marshal
 *
 * for value in [
 *     {"hello": "world", "data": b"\x00\xff"},
 *     [1, "two"],
 * ]:
 *     print(repr(marshal.dumps(value, 4)))
 *
 * all_types = {
 *     "none": None, "false": False, "true": True, "int32": -42,
 *     "integer": 9007199254740992, "float": 3.5, "bytes": b"\x00\xff",
 *     "text": "Γειά", "list": [1, "two"], "tuple": (1, "two"),
 *     "set": {1, 2}, "dictionary": {"nested": "value"},
 * }
 * print(marshal.dumps(all_types, 4).hex())
 *
 * The encoder fixture is validated by CPython with:
 *
 * assert marshal.loads(bytes.fromhex(
 *     "7b750500000068656c6c6f7505000000776f726c64750400000064617461730200000000ff30"
 * )) == {"hello": "world", "data": b"\x00\xff"}
 *
 * The test suite deliberately embeds these CPython-generated fixtures instead
 * of invoking Python, so `npm test` remains a Node.js-only command.
 */
const hexToString = (hex) => hex.match(/../g).map((byte) =>
    String.fromCharCode(parseInt(byte, 16))).join("");

TestRegister.addTests([
    {
        name: "From Python Marshal: CPython format 4 dictionary",
        input: "\xfb\xda\x05hello\xda\x05world\xda\x04data\xf3\x02\x00\x00\x00\x00\xff\x30",
        expectedOutput: "{\n    \"hello\": \"world\",\n    \"data\": {\n        \"_pythonMarshalType\": \"bytes\",\n        \"hex\": \"00ff\"\n    }\n}",
        recipeConfig: [
            {
                op: "From Python Marshal",
                args: [],
            },
        ],
    },
    {
        name: "From Python Marshal: CPython format 4 references",
        input: "\xdb\x02\x00\x00\x00\xe9\x01\x00\x00\x00\xda\x03two",
        expectedOutput: "[\n    1,\n    \"two\"\n]",
        recipeConfig: [
            {
                op: "From Python Marshal",
                args: [],
            },
        ],
    },
    {
        name: "From Python Marshal: reject null marker in collection",
        input: hexToString("5b0100000030"),
        expectedError: true,
        recipeConfig: [
            {
                op: "From Python Marshal",
                args: [],
            },
        ],
    },
    {
        name: "From Python Marshal: null marker terminates dictionary value",
        input: hexToString("7b75010000007830750100000079e90100000030"),
        expectedOutput: "{}",
        recipeConfig: [
            {
                op: "From Python Marshal",
                args: [],
            },
        ],
    },
    {
        name: "From Python Marshal: reject out-of-range long digit",
        input: hexToString("6c010000000080"),
        expectedError: true,
        recipeConfig: [
            {
                op: "From Python Marshal",
                args: [],
            },
        ],
    },
    {
        name: "From Python Marshal: reject unnormalised long",
        input: hexToString("6c0200000001000000"),
        expectedError: true,
        recipeConfig: [
            {
                op: "From Python Marshal",
                args: [],
            },
        ],
    },
    {
        name: "From Python Marshal: documented value types",
        input: hexToString("fbda046e6f6e654eda0566616c736546da047472756554da05696e743332e9d6ffffffda07696e7465676572ec040000000000000000000001da05666c6f6174e70000000000000c40da056279746573f30200000000ffda0474657874f508000000ce93ceb5ceb9ceacda046c6973745b02000000e901000000da0374776fda057475706c65a902720f0000007210000000da037365743c02000000720f000000e902000000da0a64696374696f6e6172797bda066e6573746564da0576616c75653030"),
        expectedOutput: "{\n    \"none\": null,\n    \"false\": false,\n    \"true\": true,\n    \"int32\": -42,\n    \"integer\": {\n        \"_pythonMarshalType\": \"int\",\n        \"value\": \"9007199254740992\"\n    },\n    \"float\": 3.5,\n    \"bytes\": {\n        \"_pythonMarshalType\": \"bytes\",\n        \"hex\": \"00ff\"\n    },\n    \"text\": \"Γειά\",\n    \"list\": [\n        1,\n        \"two\"\n    ],\n    \"tuple\": [\n        1,\n        \"two\"\n    ],\n    \"set\": [\n        1,\n        2\n    ],\n    \"dictionary\": {\n        \"nested\": \"value\"\n    }\n}",
        recipeConfig: [
            {
                op: "From Python Marshal",
                args: [],
            },
        ],
    },
    {
        name: "To Python Marshal: CPython format 4 dictionary",
        input: "{\"hello\":\"world\",\"data\":{\"_pythonMarshalType\":\"bytes\",\"hex\":\"00ff\"}}",
        expectedOutput: "{u\x05\x00\x00\x00hellou\x05\x00\x00\x00worldu\x04\x00\x00\x00datas\x02\x00\x00\x00\x00\xff0",
        recipeConfig: [
            {
                op: "To Python Marshal",
                args: [],
            },
        ],
    },
    {
        name: "Python Marshal: arbitrary-size integer round trip",
        input: "{\"_pythonMarshalType\":\"int\",\"value\":\"9007199254740992\"}",
        expectedOutput: "{\n    \"_pythonMarshalType\": \"int\",\n    \"value\": \"9007199254740992\"\n}",
        recipeConfig: [
            {
                op: "To Python Marshal",
                args: [],
            },
            {
                op: "From Python Marshal",
                args: [],
            },
        ],
    },
]);
