/**
 * Operations to exlude from the Node API
 *
 * @author d98762656 [d98762625@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */
export default  [
    "Fork",
    "Merge",
    "Jump",
    "ConditionalJump",
    "Label",
    "Comment",

    // Exclude file ops until HTML5 File Object can be mimicked
    // "Tar",
    // "Untar",
    "Unzip",
    "Zip",

    // esprima doesn't work in .mjs
    "JavaScriptBeautify",
    "JavaScriptMinify",
    "JavaScriptParser",

    // Relies on state of recipe.
    // "Magic",

    "RenderImage",
    "SyntaxHighlighter",

    "DetectFileType",
];
