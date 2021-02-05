/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import HTMLIngredient from "./HTMLIngredient.mjs";


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
        let html = "<li class='operation'";

        if (this.description) {
            const infoLink = this.infoURL ? `<hr>${titleFromWikiLink(this.infoURL)}` : "";

            html += ` data-container='body' data-toggle='popover' data-placement='right'
                data-content="${this.description}${infoLink}" data-html='true' data-trigger='hover'
                data-boundary='viewport'`;
        }

        html += ">" + this.name;

        if (removeIcon) {
            html += "<i class='material-icons remove-icon op-icon'>delete</i>";
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
        let html = `<div class="op-title">${this.name}</div>
        <div class="ingredients">`;

        for (let i = 0; i < this.ingList.length; i++) {
            html += this.ingList[i].toHtml();
        }

        html += `</div>
        <div class="recip-icons">
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
        if (nameIdxs.length) {
            let opName = "",
                pos = 0;

            nameIdxs.forEach(idxs => {
                const [start, length] = idxs;
                opName += this.name.slice(pos, start) + "<b>" +
                    this.name.slice(start, start + length) + "</b>";
                pos = start + length;
            });
            opName += this.name.slice(pos, this.name.length);
            this.name = opName;
        }

        if (this.description && descIdxs.length) {
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
 * @param {string} url
 * @returns {string}
 */
function titleFromWikiLink(url) {
    const splitURL = url.split("/");
    if (splitURL.indexOf("wikipedia.org") < 0 && splitURL.indexOf("forensicswiki.org") < 0) {
        // Not a wiki link, return full URL
        return `<a href='${url}' target='_blank'>More Information<i class='material-icons inline-icon'>open_in_new</i></a>`;
    }

    const wikiName = splitURL.indexOf("forensicswiki.org") < 0 ? "Wikipedia" : "Forensics Wiki";

    const pageTitle = decodeURIComponent(splitURL[splitURL.length - 1])
        .replace(/_/g, " ");
    return `<a href='${url}' target='_blank'>${pageTitle}<i class='material-icons inline-icon'>open_in_new</i></a> on ${wikiName}`;
}

export default HTMLOperation;
