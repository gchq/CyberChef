/**
 * @author tlwr [toby@toby.codes]
 * @author Matt C [me@mitt.dev]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

/**
 * HTML To Text operation
 */
class HTMLToText extends Operation {

    /**
     * HTMLToText constructor
     */
    constructor() {
        super();

        this.name = "HTML To Text";
        this.module = "Default";
        this.description = "Converts an HTML output from an operation to a readable string instead of being rendered in the DOM.";
        this.infoURL = "";
        this.inputType = "html";
        this.outputType = "string";
        this.args = [];
    }

    /**
     * @param {html} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        // TODO: Add blacklisted tags via args.
        // TODO: Extract from HTML comments.
        let output = "";
        const blacklistedTags = ["script", "style"];
        const tagRegex = /<\w+>[\s?!\-_().,/#{}*"£$%^&;:a-z]*/gis;
        const tagMatches = input.match(tagRegex);
        tagMatches.forEach((iterativeMatch) => {
            const closingTagOffset = iterativeMatch.indexOf(">");
            const tag = iterativeMatch.substring(1, closingTagOffset);
            for (let i = 0; i < blacklistedTags.length; i++) {
                if (tag === blacklistedTags[i]) {
                    return; // This is why a forEach(...) loop couldn't be used for this nested one.
                }
            }
            // The tag has been validated, extract all text.
            output += iterativeMatch.substring(closingTagOffset + 1);
        });
        return output;
    }

}

export default HTMLToText;
