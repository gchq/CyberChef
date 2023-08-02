/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

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
    }


    /**
     * Highlights searched strings in the name and description of the operation.
     *
     * @param {[[number]]} nameIdxs - Indexes of the search strings in the operation name [[start, length]]
     * @param {[[number]]} descIdxs - Indexes of the search strings in the operation description [[start, length]]
     */
    highlightSearchStrings(nameIdxs, descIdxs) {
        if (nameIdxs.length && typeof nameIdxs[0][0] === "number") {
            let opName = "",
                pos = 0;

            nameIdxs.forEach(idxs => {
                const [start, length] = idxs;
                if (typeof start !== "number") return;
                opName += this.name.slice(pos, start) + "<b>" +
                    this.name.slice(start, start + length) + "</b>";
                pos = start + length;
            });
            opName += this.name.slice(pos, this.name.length);
            this.name = opName;
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

export default HTMLOperation;
