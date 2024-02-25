/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2022
 * @license Apache-2.0
 */

import { WidgetType, Decoration, ViewPlugin } from "@codemirror/view";
import { escapeControlChars } from "./editorUtils.mjs";
import { htmlCopyOverride } from "./copyOverride.mjs";
import Utils from "../../core/Utils.mjs";

/**
 * Adds an HTML widget to the Code Mirror editor
 */
class HTMLWidget extends WidgetType {
    /**
     * HTMLWidget consructor
     */
    constructor(html, view) {
        super();
        this.html = html;
        this.view = view;
    }

    /**
     * Builds the DOM node
     * @returns {DOMNode}
     */
    toDOM() {
        const wrap = document.createElement("span");
        wrap.setAttribute("id", "output-html");
        wrap.innerHTML = this.html;

        // Find text nodes and replace unprintable chars with control codes
        this.walkTextNodes(wrap);

        // Add a handler for copy events to ensure the control codes are copied correctly
        wrap.addEventListener("copy", htmlCopyOverride);
        return wrap;
    }

    /**
     * Walks all text nodes in a given element
     * @param {DOMNode} el
     */
    walkTextNodes(el) {
        for (const node of el.childNodes) {
            switch (node.nodeType) {
                case Node.TEXT_NODE:
                    this.replaceControlChars(node);
                    break;
                default:
                    if (node.nodeName !== "SCRIPT" && node.nodeName !== "STYLE") this.walkTextNodes(node);
                    break;
            }
        }
    }

    /**
     * Renders control characters in text nodes
     * @param {DOMNode} textNode
     */
    replaceControlChars(textNode) {
        // .nodeValue unencodes HTML encoding such as &lt; to "<"
        // We must remember to escape any potential HTML in TextNodes as we do not
        // want to render it.
        const textValue = Utils.escapeHtml(textNode.nodeValue);
        const val = escapeControlChars(textValue, true, this.view.state.lineBreak);
        if (val.length !== textNode.nodeValue.length) {
            const node = document.createElement("span");
            node.innerHTML = val;
            textNode.parentNode.replaceChild(node, textNode);
        }
    }
}

/**
 * Decorator function to provide a set of widgets for the editor DOM
 * @param {EditorView} view
 * @param {string} html
 * @returns {DecorationSet}
 */
function decorateHTML(view, html) {
    const widgets = [];
    if (html.length) {
        const deco = Decoration.widget({
            widget: new HTMLWidget(html, view),
            side: 1
        });
        widgets.push(deco.range(0));
    }
    return Decoration.set(widgets);
}

/**
 * An HTML Plugin builder
 * @param {Object} htmlOutput
 * @returns {ViewPlugin}
 */
export function htmlPlugin(htmlOutput) {
    const plugin = ViewPlugin.fromClass(
        class {
            /**
             * Plugin constructor
             * @param {EditorView} view
             */
            constructor(view) {
                this.htmlOutput = htmlOutput;
                this.decorations = decorateHTML(view, this.htmlOutput.html);
            }

            /**
             * Editor update listener
             * @param {ViewUpdate} update
             */
            update(update) {
                if (this.htmlOutput.changed) {
                    this.decorations = decorateHTML(update.view, this.htmlOutput.html);
                    this.htmlOutput.changed = false;
                }
            }
        },
        {
            decorations: (v) => v.decorations
        }
    );

    return plugin;
}
