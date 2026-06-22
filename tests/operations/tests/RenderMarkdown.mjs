/**
 * RenderMarkdown tests.
 *
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Render Markdown: Nothing",
        input: "",
        expectedOutput: '<div style="font-family: var(--primary-font-family)"></div>',
        recipeConfig: [
            {
                "op": "Render Markdown",
                "args": []
            }
        ]
    },
    {
        name: "Render Markdown: Basic Text",
        input: "Hello World!",
        expectedOutput: '<div style="font-family: var(--primary-font-family)"><p>Hello World!</p>\n</div>',
        recipeConfig: [
            {
                "op": "Render Markdown",
                "args": []
            }
        ]
    },
    {
        name: "Render Markdown: Simple Markdown",
        input: "# Hello World!",
        expectedOutput: '<div style="font-family: var(--primary-font-family)"><h1>Hello World!</h1>\n</div>',
        recipeConfig: [
            {
                "op": "Render Markdown",
                "args": []
            }
        ]
    },
    {
        name: "Render Markdown: URL (not expanded)",
        input: "https://gchq.github.io/CyberChef/",
        expectedOutput: '<div style="font-family: var(--primary-font-family)"><p>https://gchq.github.io/CyberChef/</p>\n</div>',
        recipeConfig: [
            {
                "op": "Render Markdown",
                "args": [false, false, false]
            }
        ]
    },
    {
        name: "Render Markdown: URL (expanded)",
        input: "https://gchq.github.io/CyberChef/",
        expectedOutput: '<div style="font-family: var(--primary-font-family)"><p><a href="https://gchq.github.io/CyberChef/">https://gchq.github.io/CyberChef/</a></p>\n</div>',
        recipeConfig: [
            {
                "op": "Render Markdown",
                "args": [true, false, false]
            }
        ]
    },
    {
        name: "Render Markdown: Link (not expanded)",
        input: "[CyberChef](https://gchq.github.io/CyberChef/)",
        expectedOutput: '<div style="font-family: var(--primary-font-family)"><p><a href="https://gchq.github.io/CyberChef/">CyberChef</a></p>\n</div>',
        recipeConfig: [
            {
                "op": "Render Markdown",
                "args": [false, false, false]
            }
        ]
    },
    {
        name: "Render Markdown: Link (expanded)",
        input: "[CyberChef](https://gchq.github.io/CyberChef/)",
        expectedOutput: '<div style="font-family: var(--primary-font-family)"><p><a href="https://gchq.github.io/CyberChef/">CyberChef</a></p>\n</div>',
        recipeConfig: [
            {
                "op": "Render Markdown",
                "args": [true, false, false]
            }
        ]
    },
    {
        name: "Render Markdown: Link (open in new window)",
        input: "[CyberChef](https://gchq.github.io/CyberChef/)",
        expectedOutput: '<div style="font-family: var(--primary-font-family)"><p><a href="https://gchq.github.io/CyberChef/" target="_blank">CyberChef</a></p>\n</div>',
        recipeConfig: [
            {
                "op": "Render Markdown",
                "args": [true, false, true]
            }
        ]
    },
    {
        name: "Render Markdown: URL (open in new window)",
        input: "https://gchq.github.io/CyberChef/",
        expectedOutput: '<div style="font-family: var(--primary-font-family)"><p><a href="https://gchq.github.io/CyberChef/" target="_blank">https://gchq.github.io/CyberChef/</a></p>\n</div>',
        recipeConfig: [
            {
                "op": "Render Markdown",
                "args": [true, false, true]
            }
        ]
    },
]);
