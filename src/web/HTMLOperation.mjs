/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import HTMLIngredient from "./HTMLIngredient.mjs";
import Utils from "../core/Utils.mjs";
import url from "url";


/**
 * Object to handle the creation of operations.
 */
class HTMLOperation {

    /**
     * HTMLOperation constructor.
     *
     * @param {string} name - The name of the operation.
     * @param {Object} config - The configuration object for this operation.
     * @param {App} app - The main view object for CyberChef.
     * @param {Manager} manager - The CyberChef event manager.
     */
    constructor(name, config, app, manager) {
        this.app         = app;
        this.manager     = manager;

        this.name        = name;
        this.title       = name;
        this.description = config.description;
        this.infoURL     = config.infoURL;
        this.manualBake  = config.manualBake || false;
        this.config      = config;
        this.ingList     = [];

        for (let i = 0; i < config.args.length; i++) {
            const ing = new HTMLIngredient(config.args[i], this.app, this.manager);
            this.ingList.push(ing);
        }
    }


    /**
     * Renders the operation in HTML as a stub operation with no ingredients.
     *
     * @returns {string}
     */
    toStubHtml(removeIcon) {
        let html = `<li class='operation' data-opname="${this.name}"`;

        if (this.description) {
            const infoLink = this.infoURL ? `<hr>${titleFromWikiLink(this.infoURL)}` : "";

            html += ` data-container='body' data-toggle='popover' data-placement='right'
                data-content="${this.description}${infoLink}" data-html='true' data-trigger='hover'
                data-boundary='viewport'`;
        }

        html += ">" + this.title;

        // Ensure add button only appears in sidebar, not fav edit
        if (removeIcon) {
            // Remove button
            html += "<i class='material-icons remove-icon op-icon'>delete</i>";
        } else {
            // Add buttob
            html += `<span class='float-right'>
                <button type="button" class="btn btn-primary bmd-btn-icon accessibleUX" data-toggle="tooltip" data-original-title="Add to recipe">
                    <i class='material-icons'>add_box</i>
                </button>
            </span>`;
        }

        html += "</li>";

        return html;
    }
    /**
     * Renders the operation in HTML as a full operation with ingredients.
     *
     * @returns {string}
     */
    toFullHtml() {
        let html = `<div class="op-title">${Utils.escapeHtml(this.name)}</div>
        <div class="ingredients">`;

        for (let i = 0; i < this.ingList.length; i++) {
            html += this.ingList[i].toHtml();
        }

        html += `</div>
        <div class="recip-icons">
            <i class="material-icons move-down accessibleUX" title="Move down">arrow_downward</i>
            <i class="material-icons move-up accessibleUX">arrow_upward</i>
            <i class="material-icons remove-icon accessibleUX" title="Delete operation">delete</i>
            <i class="material-icons breakpoint" title="Set breakpoint" break="false">pause</i>
            <i class="material-icons disable-icon" title="Disable operation" disabled="false">not_interested</i>
        </div>
        <div class="clearfix">&nbsp;</div>`;

        return html;
    }


    /**
     * Highlights searched strings in the name and description of the operation.
     *
     * @param {[[number]]} nameIdxs - Indexes of the search strings in the operation name [[start, length]]
     * @param {[[number]]} descIdxs - Indexes of the search strings in the operation description [[start, length]]
     */
    highlightSearchStrings(nameIdxs, descIdxs) {
        if (nameIdxs.length && typeof nameIdxs[0][0] === "number") {
            let title = "",
                pos = 0;

            nameIdxs.forEach(idxs => {
                const [start, length] = idxs;
                if (typeof start !== "number") return;
                title += this.title.slice(pos, start) + "<b>" +
                    this.title.slice(start, start + length) + "</b>";
                pos = start + length;
            });
            title += this.title.slice(pos, this.title.length);
            this.title = title;
        }

        if (this.description && descIdxs.length && descIdxs[0][0] >= 0) {
            // Find HTML tag offsets
            const re = /<[^>]+>/g;
            let match;
            while ((match = re.exec(this.description))) {
                // If the search string occurs within an HTML tag, return without highlighting it.
                const inHTMLTag = descIdxs.reduce((acc, idxs) => {
                    const start = idxs[0];
                    return start >= match.index && start <= (match.index + match[0].length);
                }, false);

                if (inHTMLTag) return;
            }

            let desc = "",
                pos = 0;

            descIdxs.forEach(idxs => {
                const [start, length] = idxs;
                desc += this.description.slice(pos, start) + "<b><u>" +
                    this.description.slice(start, start + length) + "</u></b>";
                pos = start + length;
            });
            desc += this.description.slice(pos, this.description.length);
            this.description = desc;
        }
    }

}


/**
 * Given a URL for a Wikipedia (or other wiki) page, this function returns a link to that page.
 *
 * @param {string} urlStr
 * @returns {string}
 */
function titleFromWikiLink(urlStr) {
    const urlObj = url.parse(urlStr);
    let wikiName = "",
        pageTitle = "";

    switch (urlObj.host) {
        case "forensicswiki.xyz":
            wikiName = "Forensics Wiki";
            pageTitle = urlObj.query.substr(6).replace(/_/g, " "); // Chop off 'title='
            break;
        case "wikipedia.org":
            wikiName = "Wikipedia";
            pageTitle = urlObj.pathname.substr(6).replace(/_/g, " "); // Chop off '/wiki/'
            break;
        default:
            // Not a wiki link, return full URL
            return `<a href='${urlStr}' target='_blank'>More Information<i class='material-icons inline-icon'>open_in_new</i></a>`;
    }

    return `<a href='${urlObj.href}' target='_blank'>${pageTitle}<i class='material-icons inline-icon'>open_in_new</i></a> on ${wikiName}`;
}

export default HTMLOperation;
