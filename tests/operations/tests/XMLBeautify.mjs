/**
 * XML Beautify tests.
 *
 * @author Allan Leary
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "XML Beautify: basic nested elements",
        input: "<root><parent><child/></parent></root>",
        expectedOutput: "<root>\n\t<parent>\n\t\t<child/>\n\t</parent>\n</root>",
        recipeConfig: [{ op: "XML Beautify", args: ["\t"] }],
    },
    {
        name: "XML Beautify: self-closing element without xmlns",
        input: "<a><b/></a>",
        expectedOutput: "<a>\n\t<b/>\n</a>",
        recipeConfig: [{ op: "XML Beautify", args: ["\t"] }],
    },
    {
        name: "XML Beautify: self-closing element with xmlns (issue #2501)",
        input: "<a><b xmlns=\"foo\" /></a>",
        expectedOutput: "<a>\n\t<b\n\t\txmlns=\"foo\" />\n</a>",
        recipeConfig: [{ op: "XML Beautify", args: ["\t"] }],
    },
    {
        name: "XML Beautify: self-closing element with multiple xmlns attributes (issue #2501)",
        input: "<a><b xmlns:foo=\"a\" xmlns:bar=\"b\" /></a>",
        expectedOutput: "<a>\n\t<b\n\t\txmlns:foo=\"a\"\n\t\txmlns:bar=\"b\" />\n</a>",
        recipeConfig: [{ op: "XML Beautify", args: ["\t"] }],
    },
    {
        name: "XML Beautify: xmlns on opening (non-self-closing) tag",
        input: "<a><b xmlns=\"foo\">text</b></a>",
        expectedOutput: "<a>\n\t<b\n\t\txmlns=\"foo\">text\n\t</b>\n</a>",
        recipeConfig: [{ op: "XML Beautify", args: ["\t"] }],
    },
    {
        name: "XML Beautify: siblings after xmlns self-closing are correctly indented",
        input: "<root><a xmlns=\"foo\" /><b/><c/></root>",
        expectedOutput: "<root>\n\t<a\n\t\txmlns=\"foo\" />\n\t<b/>\n\t<c/>\n</root>",
        recipeConfig: [{ op: "XML Beautify", args: ["\t"] }],
    },
    {
        name: "XML Beautify: xml declaration preserved",
        input: "<?xml version=\"1.0\"?><root><child/></root>",
        expectedOutput: "<?xml version=\"1.0\"?>\n<root>\n\t<child/>\n</root>",
        recipeConfig: [{ op: "XML Beautify", args: ["\t"] }],
    },
    {
        name: "XML Beautify: 4-space indent",
        input: "<root><child/></root>",
        expectedOutput: "<root>\n    <child/>\n</root>",
        recipeConfig: [{ op: "XML Beautify", args: ["    "] }],
    },
]);
