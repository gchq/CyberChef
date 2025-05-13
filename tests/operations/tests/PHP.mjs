/**
 * PHP tests.
 *
 * @author Jarmo van Lenthe
 *
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "PHP Deserialize empty array",
        input: "a:0:{}",
        expectedOutput: "{}",
        recipeConfig: [
            {
                op: "PHP Deserialize",
                args: [true],
            },
        ],
    },
    {
        name: "PHP Deserialize integer",
        input: "i:10;",
        expectedOutput: "10",
        recipeConfig: [
            {
                op: "PHP Deserialize",
                args: [true],
            },
        ],
    },
    {
        name: "PHP Deserialize string",
        input: "s:17:\"PHP Serialization\";",
        expectedOutput: "\"PHP Serialization\"",
        recipeConfig: [
            {
                op: "PHP Deserialize",
                args: [true],
            },
        ],
    },
    {
        name: "PHP Deserialize array (JSON)",
        input: "a:2:{s:1:\"a\";i:10;i:0;a:1:{s:2:\"ab\";b:1;}}",
        expectedOutput: '{"0":{"ab":true},"a":10}',
        recipeConfig: [
            {
                op: "PHP Deserialize",
                args: [true],
            },
        ],
    },
    {
        name: "PHP Deserialize array (non-JSON)",
        input: "a:2:{s:1:\"a\";i:10;i:0;a:1:{s:2:\"ab\";b:1;}}",
        expectedOutput: '{0:{"ab":true},"a":10}',
        recipeConfig: [
            {
                op: "PHP Deserialize",
                args: [false],
            },
        ],
    },
    {
        name: "PHP Deserialize array with object and reference",
        input: 'a:1:{s:6:"navbar";O:18:"APP\View\Menu\Item":3:{s:7:"�*�name";s:16:"Secondary Navbar";s:11:"�*�children";a:1:{s:9:"View Cart";O:18:"APP\View\Menu\Item":2:{s:7:"�*�name";s:9:"View Cart";s:9:"�*�parent";r:2;}}s:9:"�*�parent";N;}}',
        expectedOutput: '{"navbar":{"__className":"APP\\View\\Menu\\Item","�*�name":"Secondary Navbar","�*�children":{"View Cart":{"__className":"APP\\View\\Menu\\Item","�*�name":"View Cart","�*�parent":"Secondary Navbar"}},"�*�parent":null}}',
        recipeConfig: [
            {
                op: "PHP Deserialize",
                args: [false],
            },
        ],
    }
]);
