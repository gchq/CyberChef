/**
 * YARA-X Scan tests.
 *
 * @author Zain Nadeem [zainnadeemzainnadeem80@gmail.com]
 *
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

const SIMPLE_RULE = "rule ExampleRule { strings: $a = \"hello\" condition: $a }";
const METADATA_RULE = `rule MetadataRule : test_tag
{
    meta:
        author = "test"
        score = 7
    strings:
        $a = "hello"
    condition:
        $a
}`;
const WITH_RULE = `rule WithRule
{
    condition:
        with size = filesize : (
            size == 3
        )
}`;

TestRegister.addTests([
    {
        name: "YARA-X Scan: simple match",
        input: "hello world",
        expectedOutput: "Rule: ExampleRule\n" +
            "Namespace: default\n" +
            "Patterns:\n" +
            "  $a at 0x0: \"hello\"",
        recipeConfig: [
            {
                op: "YARA-X Scan",
                args: [SIMPLE_RULE, true, true, true, 0],
            }
        ],
    },
    {
        name: "YARA-X Scan: no match",
        input: "goodbye world",
        expectedOutput: "No matches",
        recipeConfig: [
            {
                op: "YARA-X Scan",
                args: [SIMPLE_RULE, true, true, true, 0],
            }
        ],
    },
    {
        name: "YARA-X Scan: empty rules",
        input: "hello world",
        expectedOutput: "Rules cannot be empty.",
        recipeConfig: [
            {
                op: "YARA-X Scan",
                args: ["   ", true, true, true, 0],
            }
        ],
    },
    {
        name: "YARA-X Scan: invalid rule syntax",
        input: "hello world",
        expectedOutput: "Error compiling YARA-X rules. (error[E001]: syntax error\n" +
            " --> line:1:23\n" +
            "  |\n" +
            "1 | rule bad { condition: }\n" +
            "  |                       ^ expecting expression or identifier, found `}`)",
        recipeConfig: [
            {
                op: "YARA-X Scan",
                args: ["rule bad { condition: }", true, true, true, 0],
            }
        ],
    },
    {
        name: "YARA-X Scan: with statement match",
        input: "abc",
        expectedOutput: "Rule: WithRule\n" +
            "Namespace: default",
        recipeConfig: [
            {
                op: "YARA-X Scan",
                args: [WITH_RULE, true, true, true, 0],
            }
        ],
    },
    {
        name: "YARA-X Scan: binary input match",
        input: "\x00A\xff",
        expectedOutput: "Rule: BinaryRule\n" +
            "Namespace: default\n" +
            "Patterns:\n" +
            "  $a at 0x0: \"\\x00A\\xff\"",
        recipeConfig: [
            {
                op: "YARA-X Scan",
                args: ["rule BinaryRule { strings: $a = { 00 41 FF } condition: $a }", true, true, true, 0],
            }
        ],
    },
    {
        name: "YARA-X Scan: metadata output",
        input: "hello world",
        expectedOutput: "Rule: MetadataRule\n" +
            "Namespace: default\n" +
            "Tags: test_tag\n" +
            "Metadata:\n" +
            "  author: test\n" +
            "  score: 7\n" +
            "Patterns:\n" +
            "  $a at 0x0: \"hello\"",
        recipeConfig: [
            {
                op: "YARA-X Scan",
                args: [METADATA_RULE, true, true, true, 0],
            }
        ],
    },
]);
