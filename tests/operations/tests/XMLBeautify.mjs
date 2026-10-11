/**
 * XMLBeautify tests.
 *
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "XML Beautify: self-closing element with xmlns (issue #2501)",
        input: "<a>\n<b\nxmlns=\"foo\" />\n</a>",
        expectedOutput: "<a>\n\t<b\n\t\txmlns=\"foo\" />\n</a>",
        recipeConfig: [
            {
                op: "XML Beautify",
                args: ["\\t"],
            },
        ],
    },
    {
        name: "XML Beautify: self-closing element with xmlns, single line",
        input: "<a><b xmlns=\"foo\" /></a>",
        expectedOutput: "<a>\n\t<b\n\t\txmlns=\"foo\" />\n</a>",
        recipeConfig: [
            {
                op: "XML Beautify",
                args: ["\\t"],
            },
        ],
    },
    {
        name: "XML Beautify: self-closing element with xmlns followed by sibling",
        input: "<a><b/><c xmlns=\"u\"/><e>t</e></a>",
        expectedOutput: "<a>\n\t<b/>\n\t<c\n\t\txmlns=\"u\"/>\n\t<e>t</e>\n</a>",
        recipeConfig: [
            {
                op: "XML Beautify",
                args: ["\\t"],
            },
        ],
    },
    {
        name: "XML Beautify: non-self-closing element with xmlns",
        input: "<a><b xmlns=\"foo\">text</b></a>",
        expectedOutput: "<a>\n\t<b\n\t\txmlns=\"foo\">text\n\t</b>\n</a>",
        recipeConfig: [
            {
                op: "XML Beautify",
                args: ["\\t"],
            },
        ],
    },
    {
        name: "XML Beautify: self-closing element without xmlns",
        input: "<a><b/><c>t</c></a>",
        expectedOutput: "<a>\n\t<b/>\n\t<c>t</c>\n</a>",
        recipeConfig: [
            {
                op: "XML Beautify",
                args: ["\\t"],
            },
        ],
    },
    {
        name: "XML Beautify: XML declaration, attributes and comments",
        input: "<?xml version=\"1.0\"?><root a=\"1\"><child>t</child><!-- comment --></root>",
        expectedOutput: "<?xml version=\"1.0\"?>\n<root a=\"1\">\n\t<child>t</child>\n\t<!-- comment -->\n</root>",
        recipeConfig: [
            {
                op: "XML Beautify",
                args: ["\\t"],
            },
        ],
    },
    {
        name: "XML Beautify: empty input",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "XML Beautify",
                args: ["\\t"],
            },
        ],
    },
    {
        name: "XML Beautify: spaces indent",
        input: "<a><b xmlns=\"foo\" /></a>",
        expectedOutput: "<a>\n    <b\n        xmlns=\"foo\" />\n</a>",
        recipeConfig: [
            {
                op: "XML Beautify",
                args: ["    "],
            },
        ],
    },
]);
