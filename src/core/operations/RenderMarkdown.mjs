/**
 * @author j433866 [j433866@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import MarkdownIt from "markdown-it";
import hljs from "highlight.js";

/**
 * Render Markdown operation
 */
class RenderMarkdown extends Operation {

    /**
     * RenderMarkdown constructor
     */
    constructor() {
        super();

        this.name = "Render Markdown";
        this.module = "Code";
        this.description = "Renders input Markdown as HTML. HTML rendering is disabled to avoid XSS.";
        this.infoURL = "https://wikipedia.org/wiki/Markdown";
        this.inputType = "string";
        this.outputType = "html";
        this.args = [
            {
                name: "Autoconvert URLs to links",
                type: "boolean",
                value: false
            },
            {
                name: "Enable syntax highlighting",
                type: "boolean",
                value: true
            },
            {
                name: "Open links in new tab.",
                type: "boolean",
                value: false
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {html}
     */
    run(input, args) {
        const [convertLinks, enableHighlighting, openLinksBlank] = args,
            md = new MarkdownIt({
                linkify: convertLinks,
                html: false, // Explicitly disable HTML rendering
                highlight: function(str, lang) {
                    if (lang && hljs.getLanguage(lang) && enableHighlighting) {
                        try {
                            return hljs.highlight(lang, str).value;
                        } catch (__) {}
                    }

                    return "";
                }
            });
        if (openLinksBlank) {
            this.makeLinksOpenInNewTab(md);
        }
        const rendered = md.render(input);
        return `<div style="font-family: var(--primary-font-family)">${rendered}</div>`;
    }

    /**
     * Adds target="_blank" to links.
     * @param {MarkdownIt} md
     */
    makeLinksOpenInNewTab(md) {
        // Adapted from: https://github.com/markdown-it/markdown-it/blob/master/docs/architecture.md#renderer
        // Remember old renderer, if overridden, or proxy to default renderer
        const defaultRender = md.renderer.rules.link_open || function(tokens, idx, options, env, self) {
            return self.renderToken(tokens, idx, options);
        };

        // eslint-disable-next-line camelcase
        md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
            const token = tokens[idx];
            if (token.attrIndex("target") >= 0) {
                // Target attribute already set, do not replace.
                return;
            }
            token.attrPush(["target", "_blank"]); // add new attribute

            // pass token to default renderer.
            return defaultRender(tokens, idx, options, env, self);
        };
    }
}

export default RenderMarkdown;
