/**
 * @author grmartin [grmartin@engineer.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import {defaultValue, MODEL_TO_MODULES} from "../lib/GPTTokenizer.mjs";

const pastelColors = [
    "rgba(102,197,204,.4)",
    "rgba(246,207,113,.4)",
    "rgba(248,156,116,.4)",
    "rgba(239,65,70,.4)",
    "rgba(220,176,242,.4)",
    "rgba(135,197,95,.4)",
    "rgba(158,185,243,.4)",
    "rgba(254,136,177,.4)",
    "rgba(201,219,116,.4)",
    "rgba(139,224,164,.4)",
    "rgba(180,151,231,.4)",
];

/**
 * Count AI Tokens operation
 */
class ParseAITokens extends Operation {

    /**
     * Parse AI Tokens constructor
     */
    constructor() {
        super();

        this.name = "Parse AI Tokens";
        this.module = "AI";
        this.infoURL = "https://github.com/niieani/gpt-tokenizer";
        this.description = "Parses the GPT tokens in the input text using niieani/gpt-tokenizer. Select the model to use the correct encoding.";
        this.inputType = "string";
        this.outputType = "html";
        this.args = [
            {
                name: "Model",
                type: "option",
                value: Object.keys(MODEL_TO_MODULES),
            },
            {
                name: "Show Token IDs",
                type: "boolean",
                value: false
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    async run(input, args) {
        if (!input) return "";

        const [model, showIds] = args;
        let fns;
        if (MODEL_TO_MODULES[model]) {
            fns = (await MODEL_TO_MODULES[model]());
        } else {
            // fallback to default (gpt-3.5-turbo encoding)
            fns = (await MODEL_TO_MODULES[defaultValue]());
        }

        const encodedTokens = fns.encode(input); // IDs

        let displayTokens = [];
        if (showIds) {
            displayTokens = encodedTokens.map((x)=> x.toString());
        } else {
            const tokens = [];
            for (const token of fns.decodeGenerator(encodedTokens)) {
                tokens.push(token);
            }
            displayTokens = tokens;
        }

        return this.format(input, displayTokens);

    };

    /**
     * Format HTML
     * @param {string} input
     * @param {string[]} tokens
     */
    format(input, tokens) {

        const tokenHtml = tokens.map((t, i) => {
            const tok =
                t.replaceAll(" ", "\u00A0")
                    .replaceAll("\n", "<newline>");

            const css = [
                `background-color:${pastelColors[i % pastelColors.length]}`,
                "padding: 0 0",
                "border-radius: 3px",
                "margin-right: 0",
                "margin-bottom: 4px",
                "display: 'inline-block'",
                "height: 1.5em"
            ];

            return `<span style="${css.join(";")}">${tok}</span>`;
        });

        return this.replaceSpacesOutsideTags(`
            <div style="padding: 0; margin: 0">
                <h1>Tokens</h1>
                <p style="font-family: monospace">
                    ${tokenHtml.join("")}
                </p>
                <hr />
                <ul style="list-style: none; padding-left: 0">
                    <li><strong>Characters:</strong>&nbsp;${input.length}</li>
                    <li><strong>Tokens:</strong>&nbsp;${tokens.length}</li>
                </ul>
            </div>`
        );
    };

    /**
     * Replace all space not starting within the HTML tag.
     * @param {string} htmlString
     * @returns {string}
     */
    replaceSpacesOutsideTags(htmlString) {
        return htmlString.replace(/(<[^>]*?>)|(\s+)/g, function(match, tag, spaces) {
            if (tag) {
                return tag;
            } else if (spaces) {
                return "";
            }
        }).replace(/[\r\n]/g, "");
    };

}

export default ParseAITokens;

