/**
 * @author Matt C [matt@artemisbot.uk]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Operation from "../Operation";
import OperationError from "../errors/OperationError";
import Yara from "libyara-wasm";

/**
 * Yara Rules operation
 */
class YaraRules extends Operation {

    /**
     * YaraRules constructor
     */
    constructor() {
        super();

        this.name = "Yara Rules";
        this.module = "Yara";
        this.description = "Yara support";
        this.infoURL = "https://en.wikipedia.org/wiki/YARA";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [{
            name: "Rules",
            type: "code",
            value: ""
        }];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        return new Promise((resolve, reject) => {
            Yara().then(yara => {
                const resp = yara.run(input, args[0]);
                if (resp.compileErrors.size() > 0) {
                    for (let i = 0; i < resp.compileErrors.size(); i++) {
                        const compileError = resp.compileErrors.get(i);
                        reject(new OperationError(`Error on line ${compileError.lineNumber}: ${compileError.message}`));
                    }
                }
                const matchedRules = resp.matchedRules;
                let matchString = "";
                for (let i = 0; i < matchedRules.keys().size(); i++) {
                    const ruleMatches = matchedRules.get(matchedRules.keys().get(i));
                    matchString += `Rule "${matchedRules.keys().get(i)}" matches:\n`;

                    for (let j = 0; j < ruleMatches.size(); j++) {
                        const match = ruleMatches.get(j);
                        matchString += `Position ${match.location}, length ${match.matchLength}, data: ${match.data}\n`;
                    }
                }
                resolve(matchString);
            });
        });
    }

}

export default YaraRules;
