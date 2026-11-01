/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2022
 * @license Apache-2.0
 */

import {WidgetType, Decoration, ViewPlugin} from "@codemirror/view";
import {getSearchQuery} from "@codemirror/search";
import {escapeControlChars} from "./editorUtils.mjs";
import {htmlCopyOverride} from "./copyOverride.mjs";
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
                    if (node.nodeName !== "SCRIPT" &&
                        node.nodeName !== "STYLE")
                        this.walkTextNodes(node);
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
function decorateHTML(view, htmlOutput) {
    const widgets = [];
    if (htmlOutput.html.length) {
        const widget = new HTMLWidget(htmlOutput.html, view);
        if (htmlOutput.searchable && view.state.doc.length) {
            widgets.push(Decoration.replace({widget}).range(0, view.state.doc.length));
        } else {
            widgets.push(Decoration.widget({widget, side: 1}).range(0));
        }
    }
    return Decoration.set(widgets);
}

/**
 * Gets all text nodes in the HTML output and their offsets in the searchable text.
 * @param {Element} root
 * @returns {Object[]}
 */
function getTextNodes(root) {
    const nodes = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    let offset = 0;
    while ((node = walker.nextNode())) {
        if (node.parentElement?.closest("script, style")) continue;
        nodes.push({node, start: offset, end: offset + node.nodeValue.length});
        offset += node.nodeValue.length;
    }
    return nodes;
}

/**
 * Removes search match wrappers without changing the HTML output structure.
 * @param {Element} root
 */
function clearSearchMatches(root) {
    root.querySelectorAll(".cm-html-search-match").forEach(match => {
        match.replaceWith(...match.childNodes);
    });
}

/**
 * Wraps the portions of one text node covered by search matches.
 * @param {Object} textNode
 * @param {Object[]} matches
 */
function wrapTextNodeMatches(textNode, matches) {
    const nodeMatches = matches
        .filter(match => match.to > textNode.start && match.from < textNode.end)
        .sort((a, b) => b.from - a.from);

    for (const match of nodeMatches) {
        const start = Math.max(match.from, textNode.start) - textNode.start;
        const end = Math.min(match.to, textNode.end) - textNode.start;
        const matchNode = start === 0 ? textNode.node : textNode.node.splitText(start);
        if (end - start < matchNode.nodeValue.length) matchNode.splitText(end - start);

        const wrapper = document.createElement("span");
        wrapper.className = "cm-html-search-match" +
            (match.current ? " cm-html-search-match-current" : "");
        matchNode.parentNode.insertBefore(wrapper, matchNode);
        wrapper.appendChild(matchNode);
    }
}

/**
 * Opens closed details elements containing a match, excluding a match in a summary.
 * @param {Node} node
 * @param {Element} root
 * @param {Set<Element>} autoOpenedDetails
 */
function openDetailsForMatch(node, root, autoOpenedDetails) {
    let element = node.parentElement;
    while (element && element !== root) {
        if (element.nodeName === "DETAILS") {
            const summary = element.firstElementChild;
            if (summary?.nodeName !== "SUMMARY" || !summary.contains(node)) {
                if (!element.open) {
                    element.open = true;
                    autoOpenedDetails.add(element);
                }
            }
        }
        element = element.parentElement;
    }
}

/**
 * Restores details elements opened automatically for the previous query.
 * @param {Set<Element>} autoOpenedDetails
 */
function restoreAutoOpenedDetails(autoOpenedDetails) {
    for (const details of autoOpenedDetails) {
        if (details.isConnected) details.open = false;
    }
    autoOpenedDetails.clear();
}

/**
 * Highlights the current CodeMirror search query in a searchable HTML widget.
 * @param {EditorView} view
 * @param {Set<Element>} autoOpenedDetails
 */
function updateSearchHighlights(view, autoOpenedDetails) {
    const root = document.getElementById("output-html");
    if (!root) {
        autoOpenedDetails.clear();
        return;
    }

    clearSearchMatches(root);
    restoreAutoOpenedDetails(autoOpenedDetails);
    const query = getSearchQuery(view.state);
    if (!query.valid || !query.search) return;

    const selection = view.state.selection.main;
    const matches = [];
    for (const match of query.getCursor(view.state)) {
        if (match.from === match.to) continue;
        matches.push({
            from: match.from,
            to: match.to,
            current: match.from === selection.from && match.to === selection.to
        });
    }

    const textNodes = getTextNodes(root);
    textNodes.forEach(textNode => {
        const nodeMatches = matches.filter(match =>
            match.to > textNode.start && match.from < textNode.end
        );
        if (nodeMatches.length) openDetailsForMatch(textNode.node, root, autoOpenedDetails);
        wrapTextNodeMatches(textNode, matches);
    });

    const current = root.querySelector(".cm-html-search-match-current");
    if (current) current.scrollIntoView({block: "nearest"});
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
                this.decorations = decorateHTML(view, this.htmlOutput);
                this.autoOpenedDetails = new Set;
            }

            /**
             * Editor update listener
             * @param {ViewUpdate} update
             */
            update(update) {
                if (this.htmlOutput.changed || (this.htmlOutput.searchable && update.docChanged)) {
                    this.decorations = decorateHTML(update.view, this.htmlOutput);
                    this.htmlOutput.changed = false;
                }
                if (this.htmlOutput.searchable) {
                    cancelAnimationFrame(this.highlightFrame);
                    this.highlightFrame = requestAnimationFrame(() => {
                        updateSearchHighlights(update.view, this.autoOpenedDetails);
                    });
                }
            }

            /**
             * Cancels pending DOM highlighting when the plugin is destroyed.
             */
            destroy() {
                cancelAnimationFrame(this.highlightFrame);
            }
        }, {
            decorations: v => v.decorations
        }
    );

    return plugin;
}
