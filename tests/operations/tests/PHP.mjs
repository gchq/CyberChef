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
        name: "PHP Deserialize array with object and reference (JSON)",
        input: 'a:1:{s:6:"navbar";O:18:"APP\\View\\Menu\\Item":3:{s:4:"name";s:16:"Secondary Navbar";s:8:"children";a:1:{s:9:"View Cart";O:18:"APP\\View\\Menu\\Item":2:{s:4:"name";s:9:"View Cart";s:6:"parent";r:2;}}s:6:"parent";N;}}',
        expectedOutput: `{"navbar":{"__className":"APP\\\\View\\\\Menu\\\\Item","name":"Secondary Navbar","children":{"View Cart":{"__className":"APP\\\\View\\\\Menu\\\\Item","name":"View Cart","parent":"[Reference: 2]"}},"parent":null}}`,
        recipeConfig: [
            {
                op: "PHP Deserialize",
                args: [true],
            },
        ],
    },
    {
        name: "PHP Deserialize object with private property",
        input: 'O:4:"Test":1:{s:12:"\u0000Test\u0000secret";s:5:"value";}',
        expectedOutput: '{"__className":"Test","private:secret":"value"}',
        recipeConfig: [
            {
                op: "PHP Deserialize",
                args: [true],
            },
        ],
    },
    {
        name: "PHP Deserialize object with protected property",
        input: 'O:4:"Test":1:{s:9:"\u0000*\u0000secret";s:5:"value";}',
        expectedOutput: '{"__className":"Test","protected:secret":"value"}',
        recipeConfig: [
            {
                op: "PHP Deserialize",
                args: [true],
            },
        ],
    },
    {
        name: "PHP Deserialize public, private and protected properties (non-JSON)",
        input: 'O:4:"Test":3:{s:6:"secret";s:6:"public";s:12:"\u0000Test\u0000secret";s:7:"private";s:9:"\u0000*\u0000secret";s:9:"protected";}',
        expectedOutput: '{"__className":"Test","secret":"public","private:secret":"private","protected:secret":"protected"}',
        recipeConfig: [
            {
                op: "PHP Deserialize",
                args: [false],
            },
        ],
    },
    {
        name: "PHP Deserialize rejects mismatched declared length",
        input: 's:1:"value";',
        expectedOutput: "Invalid string boundary for declared byte length: 1",
        recipeConfig: [
            {
                op: "PHP Deserialize",
                args: [true],
            },
        ],
    }
]);

// Exercise both output modes so legacy formatting cannot hide parsing regressions.
const deserializeCases = [
    {
        name: "false boolean",
        input: "b:0;",
        expectedOutput: "false",
    },
    {
        name: "true boolean",
        input: "b:1;",
        expectedOutput: "true",
    },
    {
        name: "primitive integer root",
        input: "i:10;",
        expectedOutput: "10",
    },
    {
        name: "primitive null root",
        input: "N;",
        expectedOutput: "null",
    },
    {
        name: "primitive string root",
        input: 's:4:"text";',
        expectedOutput: '"text"',
    },
    {
        name: "embedded string terminator",
        input: 'a:2:{i:0;s:4:"a";b";i:1;i:7;}',
        expectedOutput: '{"0":"a\\";b","1":7}',
        legacyOutput: '{0:"a\\";b",1:7}',
    },
    {
        name: "UTF-8 string byte length",
        input: 's:7:"é😀x";',
        expectedOutput: '"é😀x"',
    },
    {
        name: "UTF-8 class name byte length",
        input: 'O:5:"Café":0:{}',
        expectedOutput: '{"__className":"Café"}',
    },
    {
        name: "nested integer keys",
        input: "a:1:{i:0;a:1:{i:-1;b:0;}}",
        expectedOutput: '{"0":{"-1":false}}',
        legacyOutput: "{0:{-1:false}}",
    },
    {
        name: "numeric-looking string keys",
        input: 'a:2:{s:2:"01";i:1;s:0:"";i:2;}',
        expectedOutput: '{"01":1,"":2}',
    },
    {
        name: "prototype keys in array",
        input: 'a:3:{s:9:"__proto__";a:1:{s:8:"polluted";b:1;}s:11:"constructor";i:1;s:9:"prototype";i:2;}',
        expectedOutput: '{"__proto__":{"polluted":true},"constructor":1,"prototype":2}',
    },
    {
        name: "prototype key in object",
        input: 'O:4:"Test":1:{s:9:"__proto__";a:1:{s:8:"polluted";b:1;}}',
        expectedOutput: '{"__className":"Test","__proto__":{"polluted":true}}',
    },
    {
        name: "scalar reference excludes array keys",
        input: 'a:2:{i:0;s:1:"x";i:1;R:2;}',
        expectedOutput: '{"0":"x","1":"x"}',
        legacyOutput: '{0:"x",1:"x"}',
    },
    {
        name: "hard references do not consume slots",
        input: 'a:4:{i:0;s:1:"x";i:1;R:2;i:2;s:1:"y";i:3;R:3;}',
        expectedOutput: '{"0":"x","1":"x","2":"y","3":"y"}',
        legacyOutput: '{0:"x",1:"x",2:"y",3:"y"}',
    },
    {
        name: "object references consume slots",
        input: 'a:4:{i:0;O:8:"stdClass":0:{}i:1;r:2;i:2;s:5:"after";i:3;R:4;}',
        expectedOutput: '{"0":{"__className":"stdClass"},"1":"[Reference: 2]","2":"after","3":"after"}',
        legacyOutput: '{0:{"__className":"stdClass"},1:"[Reference: 2]",2:"after",3:"after"}',
    },
    {
        name: "self-referencing array",
        input: "a:1:{i:0;R:1;}",
        expectedOutput: '{"0":"[Reference: 1]"}',
        legacyOutput: '{0:"[Reference: 1]"}',
    },
    {
        name: "self-referencing object",
        input: 'O:8:"stdClass":1:{s:4:"self";r:1;}',
        expectedOutput: '{"__className":"stdClass","self":"[Reference: 1]"}',
    },
    {
        name: "reference to null",
        input: "a:2:{i:0;N;i:1;R:2;}",
        expectedOutput: '{"0":null,"1":null}',
        legacyOutput: "{0:null,1:null}",
    },
    {
        name: "quoted property name",
        input: 'O:4:"Test":1:{s:3:""x"";i:1;}',
        expectedOutput: '{"__className":"Test","\\"x\\"":1}',
    },
];

for (const validJSON of [true, false]) {
    TestRegister.addTests(deserializeCases.map(test => ({
        name: `PHP Deserialize ${test.name} (${validJSON ? "JSON" : "non-JSON"})`,
        input: test.input,
        expectedOutput: !validJSON && test.legacyOutput !== undefined ? test.legacyOutput : test.expectedOutput,
        recipeConfig: [{ op: "PHP Deserialize", args: [validJSON] }],
    })));
}

const invalidCases = [
    ["zero reference", "R:0;", "Invalid reference index: 0"],
    ["negative reference", "R:-1;", "Invalid reference index: -1"],
    ["forward reference", "a:1:{i:0;R:2;}", "Invalid reference index: 2"],
    ["malformed reference", "R:NaN;", "Invalid reference index: NaN"],
    ["partial reference number", "a:2:{i:0;i:7;i:1;R:2x;}", "Invalid reference index: 2x"],
    ["object reference to scalar", "a:2:{i:0;i:7;i:1;r:2;}", "Invalid object reference: 2"],
    ["negative string length", 's:-1:"x";', "Invalid string length: -1"],
    ["malformed string length", 's:1x:"x";', "Invalid string length: 1x"],
    ["unsafe string length", 's:9007199254740992:"x";', "Invalid string length: 9007199254740992"],
    ["truncated string", 's:5:"x";', "End of input reached before end of script"],
    ["split UTF-8 character", 's:1:"é";', "Invalid UTF-8 string boundary"],
    ["negative array count", "a:-1:{}", "Invalid item count: -1"],
    ["malformed object count", 'O:4:"Test":x:{}', "Invalid item count: x"],
    ["excessive nesting", "a:1:{i:0;".repeat(257) + "N;" + "}".repeat(257), "Maximum nesting depth exceeded"],
];

TestRegister.addTests(invalidCases.map(([name, input, message]) => ({
    name: `PHP Deserialize rejects ${name}`,
    input,
    expectedOutput: message,
    recipeConfig: [{ op: "PHP Deserialize", args: [true] }],
})));
