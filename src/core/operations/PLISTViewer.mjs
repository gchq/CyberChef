/**
 * @author n1073645 [n1073645@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

/**
 * PLIST Viewer operation
 */
class PLISTViewer extends Operation {

    /**
     * PLISTViewer constructor
     */
    constructor() {
        super();

        this.name = "PLIST Viewer";
        this.module = "Other";
        this.description = "Converts PLISTXML file into a human readable format.";
        this.infoURL = "";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            /* Example arguments. See the project wiki for full details.
            {
                name: "First arg",
                type: "string",
                value: "Don't Panic"
            },
            {
                name: "Second arg",
                type: "number",
                value: 42
            }
            */
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {

        // Regexes are designed to transform the xml format into a reasonably more readable string format.
        input = input.slice(input.indexOf("<plist"))
            .replace(/<plist.+>/g, "plist => ")
            .replace(/<dict>/g, "{")
            .replace(/<\/dict>/g, "}")
            .replace(/<array>/g, "[")
            .replace(/<\/array>/g, "]")
            .replace(/<key>.+<\/key>/g, m => `${m.slice(5, m.indexOf(/<\/key>/g)-5)}\t=> `)
            .replace(/<real>.+<\/real>/g, m => `${m.slice(6, m.indexOf(/<\/real>/g)-6)}\n`)
            .replace(/<string>.+<\/string>/g, m => `${m.slice(8, m.indexOf(/<\/string>/g)-8)}\n`)
            .replace(/<integer>.+<\/integer>/g, m => `${m.slice(9, m.indexOf(/<\/integer>/g)-9)}\n`)
            .replace(/<false\/>/g, m => "false")
            .replace(/<true\/>/g, m => "true")
            .replace(/<\/plist>/g, "/plist")
            .replace(/<date>.+<\/date>/g, m => `${m.slice(6, m.indexOf(/<\/integer>/g)-6)}`)
            .replace(/<data>(\s|.)+?<\/data>/g, m => `${m.slice(6, m.indexOf(/<\/data>/g)-6)}`)
            .replace(/[ \t\r\f\v]/g, "");

        let result = "";

        /**
         * Formats the input after the regex has replaced all of the relevant parts.
         *
         * @param {array} input
         * @param {number} depthCount
         */
        function printIt(input, depthCount) {
            if (!(input.length))
                return;

            // If the current position points at a larger dynamic structure.
            if (input[0].indexOf("=>") !== -1) {

                // If the LHS also points at a larger structure (nested plists in a dictionary).
                if (input[1].indexOf("=>") !== -1) {
                    result += ("\t".repeat(depthCount)) + input[0].slice(0, -2) + " => " + input[1].slice(0, -2) + " =>\n";
                } else {
                    result += ("\t".repeat(depthCount)) + input[0].slice(0, -2) + " => " + input[1] + "\n";
                }

                // Controls the tab depth for how many opening braces there have been.
                if (input[1] === "{" || input[1] === "[") {
                    depthCount += 1;
                }
                input = input.slice(1);
            } else {
                // Controls the tab depth for how many closing braces there have been.
                if (input[0] === "}" || input[0] === "]")
                    depthCount--;

                // Has to be here since the formatting breaks otherwise.
                result += ("\t".repeat(depthCount)) + input[0] + "\n";
                if (input[0] === "{" || input[0] === "[")
                    depthCount++;
            }
            printIt(input.slice(1), depthCount);
        }

        input = input.split("\n").filter(e => e !== "");
        printIt(input, 0);
        return result;
    }
}

export default PLISTViewer;
