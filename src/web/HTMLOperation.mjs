/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import HTMLIngredient from "./HTMLIngredient";


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
     * Highlights the searched string in the name and description of the operation.
     *
     * @param {string} searchStr
     * @param {number} namePos - The position of the search string in the operation name
     * @param {number} descPos - The position of the search string in the operation description
     */
    highlightSearchString(searchStr, namePos, descPos) {
        if (namePos >= 0) {
            this.name = this.name.slice(0, namePos) + "<b><u>" +
                this.name.slice(namePos, namePos + searchStr.length) + "</u></b>" +
                this.name.slice(namePos + searchStr.length);
        }

        if (this.description && descPos >= 0) {
            // Find HTML tag offsets
            const re = /<[^>]+>/g;
            let match;
            while ((match = re.exec(this.description))) {
                // If the search string occurs within an HTML tag, return without highlighting it.
                if (descPos >= match.index && descPos <= (match.index + match[0].length))
                    return;
            }

            this.description = this.description.slice(0, descPos) + "<b><u>" +
                this.description.slice(descPos, descPos + searchStr.length) + "</u></b>" +
                this.description.slice(descPos + searchStr.length);
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
