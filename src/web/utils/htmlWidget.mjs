/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2022
 * @license Apache-2.0
 */

import {WidgetType, Decoration, ViewPlugin} from "@codemirror/view";

/**
 * Adds an HTML widget to the Code Mirror editor
 */
class HTMLWidget extends WidgetType {

    /**
     * HTMLWidget consructor
     */
    constructor(html) {
        super();
        this.html = html;
    }

    /**
     * Builds the DOM node
     * @returns {DOMNode}
     */
    toDOM() {
        const wrap = document.createElement("span");
        wrap.setAttribute("id", "output-html");
        wrap.innerHTML = this.html;
        return wrap;
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
            widget: new HTMLWidget(html),
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
        }, {
            decorations: v => v.decorations
        }
    );

    return plugin;
}
