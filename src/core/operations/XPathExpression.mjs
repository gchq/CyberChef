/**
 * @author Mikescher (https://github.com/Mikescher | https://mikescher.com)
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import xmldom from "xmldom";
import xpath from "xpath";

/**
 * XPath expression operation
 */
class XPathExpression extends Operation {
    /**
     * XPathExpression constructor
     */
    constructor() {
        super();

        this.name = "XPath expression";
        this.module = "Code";
        this.description = "Extract information from an XML document with an XPath query";
        this.infoURL = "https://wikipedia.org/wiki/XPath";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "XPath",
                "type": "string",
                "value": ""
            },
            {
                "name": "Result delimiter",
                "type": "binaryShortString",
                "value": "\\n"
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [query, delimiter] = args;

        let doc;
        try {
            doc = new xmldom.DOMParser({
                errorHandler: {
                    warning(w) {
                        throw w;
                    },
                    error(e) {
                        throw e;
                    },
                    fatalError(e) {
                        throw e;
                    }
                }
            }).parseFromString(input, "application/xml");
        } catch (err) {
            throw new OperationError("Invalid input XML.");
        }

        let nodes;
        try {
            nodes = xpath.parse(query).select({ node: doc, allowAnyNamespaceForNoPrefix: true });
        } catch (err) {
            throw new OperationError(`Invalid XPath. Details:\n${err.message}.`);
        }

        const nodeToString = function (node) {
            return node.toString();
        };

        return nodes.map(nodeToString).join(delimiter);
    }
}

export default XPathExpression;
