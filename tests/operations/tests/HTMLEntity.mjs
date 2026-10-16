/**
 * To/From HTML Entity tests.
 *
 * @author roberson-io [michaelroberson@gmail.com]
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "To HTML Entity: named",
        input: "<a href='#'>\"&\"</a>",
        expectedOutput: "&lt;a href&equals;&apos;&num;&apos;&gt;&quot;&amp;&quot;&lt;&sol;a&gt;",
        recipeConfig: [
            { op: "To HTML Entity", args: [false, "Named entities"] },
        ],
    },
    {
        // Regression: this value was "&rlhar;;" (stray trailing semicolon) in the
        // original byteToEntity table. See issue #2645.
        name: "To HTML Entity: malformed value fixed (U+21CC)",
        input: "⇌",
        expectedOutput: "&rlhar;",
        recipeConfig: [
            { op: "To HTML Entity", args: [false, "Named entities"] },
        ],
    },
    {
        // Regression: U+03F5 emitted "&epsi;," before; the spec name is &epsiv;
        // (&epsi; is U+03B5). See issue #2645.
        name: "To HTML Entity: spec-conformant name (U+03F5)",
        input: "ϵ",
        expectedOutput: "&epsiv;",
        recipeConfig: [
            { op: "To HTML Entity", args: [false, "Named entities"] },
        ],
    },
    {
        // Regression: the OHM SIGN previously emitted the non-conformant &ohm;
        // (spec &ohm; is U+03A9). It now encodes numerically.
        name: "To HTML Entity: non-conformant name dropped (U+2126 ohm sign)",
        input: "Ω",
        expectedOutput: "&#8486;",
        recipeConfig: [
            { op: "To HTML Entity", args: [false, "Named entities"] },
        ],
    },
    {
        // The FULL BLOCK previously decoded to &block; but never encoded to it.
        // Generating both tables from the spec fixes this asymmetry.
        name: "To HTML Entity: encode/decode symmetry (U+2588 block)",
        input: "█",
        expectedOutput: "&block;",
        recipeConfig: [
            { op: "To HTML Entity", args: [false, "Named entities"] },
        ],
    },
    {
        name: "To HTML Entity: numeric, convert all",
        input: "A<",
        expectedOutput: "&#65;&#60;",
        recipeConfig: [
            { op: "To HTML Entity", args: [true, "Numeric entities"] },
        ],
    },
    {
        name: "To HTML Entity: hex, convert all",
        input: "A<",
        expectedOutput: "&#x41;&#x3c;",
        recipeConfig: [
            { op: "To HTML Entity", args: [true, "Hex entities"] },
        ],
    },
    {
        name: "From HTML Entity: named",
        input: "&lt;a href=&apos;#&apos;&gt;&quot;&amp;&quot;&lt;/a&gt;",
        expectedOutput: "<a href='#'>\"&\"</a>",
        recipeConfig: [
            { op: "From HTML Entity", args: [] },
        ],
    },
    {
        // Legacy/alias names still decode, now to the spec code point.
        name: "From HTML Entity: alias to spec code point (&ohm;)",
        input: "&ohm;",
        expectedOutput: "Ω",
        recipeConfig: [
            { op: "From HTML Entity", args: [] },
        ],
    },
    {
        name: "From HTML Entity: decimal numeric entity",
        input: "&#65;",
        expectedOutput: "A",
        recipeConfig: [
            { op: "From HTML Entity", args: [] },
        ],
    },
    {
        name: "From HTML Entity: hex numeric entity",
        input: "&#x41;",
        expectedOutput: "A",
        recipeConfig: [
            { op: "From HTML Entity", args: [] },
        ],
    },
    {
        // Unknown entities are passed through unchanged.
        name: "From HTML Entity: invalid entity passed through",
        input: "a &notreal; b",
        expectedOutput: "a &notreal; b",
        recipeConfig: [
            { op: "From HTML Entity", args: [] },
        ],
    },
    {
        name: "HTML Entity: round-trips through both operations",
        input: "Hello <World> & \"friends\" — ⇌ █",
        expectedOutput: "Hello <World> & \"friends\" — ⇌ █",
        recipeConfig: [
            { op: "To HTML Entity", args: [true, "Named entities"] },
            { op: "From HTML Entity", args: [] },
        ],
    },
]);
