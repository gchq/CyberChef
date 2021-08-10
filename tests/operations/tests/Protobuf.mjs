/**
 * Protobuf tests.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Protobuf Decode",
        input: "0d1c0000001203596f751a024d65202b2a0a0a066162633132331200",
        expectedOutput: JSON.stringify({
            "1": 469762048,
            "2": "You",
            "3": "Me",
            "4": 43,
            "5": {
                "1": "abc123",
                "2": {}
            }
        }, null, 4),
        recipeConfig: [
            {
                "op": "From Hex",
                "args": ["Auto"]
            },
            {
                "op": "Protobuf Decode",
                "args": []
            }
        ]
    },
    /**
     * Input generated from:
     * ```
       $ cat test.proto
       syntax = "proto3";

       message Test {
         float a = 1;
       }

       $ protoc --version
       libprotoc 3.11.1

       $ echo a:1 | protoc --encode=Test test.proto | xxd -p
       0d0000803f
       ```
     */
    {
        name: "Protobuf Decode - parse fixed32 as integer",
        input: "0d0000803f",
        expectedOutput: JSON.stringify({
            "1": 32831,
        }, null, 4),
        recipeConfig: [
            {
                "op": "From Hex",
                "args": ["Auto"]
            },
            {
                "op": "Protobuf Decode",
                "args": [false]
            }
        ]
    },
    {
        name: "Protobuf Decode - parse fixed32 as float32",
        input: "0d0000803f",
        expectedOutput: JSON.stringify({
            "1": 1,
        }, null, 4),
        recipeConfig: [
            {
                "op": "From Hex",
                "args": ["Auto"]
            },
            {
                "op": "Protobuf Decode",
                "args": [true]
            }
        ]
    },
    /**
     * Input generated from:
     * ```
       $ cat test.proto
       syntax = "proto3";

       message Test {
         double a = 1;
       }

       $ protoc --version
       libprotoc 3.11.1

       $ echo a:1 | protoc --encode=Test test.proto | xxd -p
       09000000000000f03f
       ```
     */
    {
        name: "Protobuf Decode - parse fixed64 as integer",
        input: "09000000000000f03f",
        expectedOutput: JSON.stringify({
            "1": 61503,
        }, null, 4),
        recipeConfig: [
            {
                "op": "From Hex",
                "args": ["Auto"]
            },
            {
                "op": "Protobuf Decode",
                "args": [false]
            }
        ]
    },
    {
        name: "Protobuf Decode - parse fixed64 as float64",
        input: "09000000000000f03f",
        expectedOutput: JSON.stringify({
            "1": 1,
        }, null, 4),
        recipeConfig: [
            {
                "op": "From Hex",
                "args": ["Auto"]
            },
            {
                "op": "Protobuf Decode",
                "args": [true]
            }
        ]
    }
]);
