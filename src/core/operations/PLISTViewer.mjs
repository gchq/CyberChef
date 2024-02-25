/**
 * @author n1073645 [n1073645@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

/**
 * P-list Viewer operation
 */
class PlistViewer extends Operation {
    /**
     * PlistViewer constructor
     */
    constructor() {
        super();

        this.name = "P-list Viewer";
        this.module = "Default";
        this.description =
            "In the macOS, iOS, NeXTSTEP, and GNUstep programming frameworks, property list files are files that store serialized objects. Property list files use the filename extension .plist, and thus are often referred to as p-list files.<br><br>This operation displays plist files in a human readable format.";
        this.infoURL = "https://wikipedia.org/wiki/Property_list";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        // Regexes are designed to transform the xml format into a more readable string format.
        input = input
            .slice(input.indexOf("<plist"))
            .replace(/<plist.+>/g, "plist => ")
            .replace(/<dict>/g, "{")
            .replace(/<\/dict>/g, "}")
            .replace(/<array>/g, "[")
            .replace(/<\/array>/g, "]")
            .replace(
                /<key>.+<\/key>/g,
                (m) => `${m.slice(5, m.indexOf(/<\/key>/g) - 5)}\t=> `,
            )
            .replace(
                /<real>.+<\/real>/g,
                (m) => `${m.slice(6, m.indexOf(/<\/real>/g) - 6)}\n`,
            )
            .replace(
                /<string>.+<\/string>/g,
                (m) => `"${m.slice(8, m.indexOf(/<\/string>/g) - 8)}"\n`,
            )
            .replace(
                /<integer>.+<\/integer>/g,
                (m) => `${m.slice(9, m.indexOf(/<\/integer>/g) - 9)}\n`,
            )
            .replace(/<false\/>/g, (m) => "false")
            .replace(/<true\/>/g, (m) => "true")
            .replace(/<\/plist>/g, "/plist")
            .replace(
                /<date>.+<\/date>/g,
                (m) => `${m.slice(6, m.indexOf(/<\/integer>/g) - 6)}`,
            )
            .replace(
                /<data>[\s\S]+?<\/data>/g,
                (m) => `${m.slice(6, m.indexOf(/<\/data>/g) - 6)}`,
            )
            .replace(/[ \t\r\f\v]/g, "");

        /**
         * Depending on the type of brace, it will increment the depth and amount of arrays accordingly.
         *
         * @param {string} elem
         * @param {array} vals
         * @param {number} offset
         */
        function braces(elem, vals, offset) {
            const temp = vals.indexOf(elem);
            if (temp !== -1) {
                depthCount += offset;
                if (temp === 1) arrCount += offset;
            }
        }

        let result = "";
        let arrCount = 0;
        let depthCount = 0;

        /**
         * Formats the input after the regex has replaced all of the relevant parts.
         *
         * @param {array} input
         * @param {number} index
         */
        function printIt(input, index) {
            if (!input.length) return;

            let temp = "";
            const origArr = arrCount;
            let currElem = input[0];

            // If the current position points at a larger dynamic structure.
            if (currElem.indexOf("=>") !== -1) {
                // If the LHS also points at a larger structure (nested plists in a dictionary).
                if (input[1].indexOf("=>") !== -1)
                    temp =
                        currElem.slice(0, -2) +
                        " => " +
                        input[1].slice(0, -2) +
                        " =>\n";
                else temp = currElem.slice(0, -2) + " => " + input[1] + "\n";

                input = input.slice(1);
            } else {
                // Controls the tab depth for how many closing braces there have been.

                braces(currElem, ["}", "]"], -1);

                // Has to be here since the formatting breaks otherwise.
                temp = currElem + "\n";
            }

            currElem = input[0];

            // Tab out to the correct distance.
            result += "\t".repeat(depthCount);

            // If it is enclosed in an array show index.
            if (arrCount > 0 && currElem !== "]")
                result += index.toString() + " => ";

            result += temp;

            // Controls the tab depth for how many opening braces there have been.
            braces(currElem, ["{", "["], 1);

            // If there has been a new array then reset index.
            if (arrCount > origArr) return printIt(input.slice(1), 0);
            return printIt(input.slice(1), ++index);
        }

        input = input.split("\n").filter((e) => e !== "");
        printIt(input, 0);
        return result;
    }
}

export default PlistViewer;
