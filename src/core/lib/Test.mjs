import OperationConfig from "../config/OperationConfig.json";

/**
 *
 */
class potentialOps {

    /**
     *
     * @param prevOp
     */
    constructor (prevOp) {
        if (typeof prevOp === "undefined") {
            this.inputRegexes = this.generateInputOpPatterns();
            this.hasInputRegexes = true;
            this.outputRegexes = this.generateOutputOpPatterns();
            this.hasOutputRegexes = true;
        } else {
            this.inputRegexes = prevOp.getInputRegexes();
            this.hasInputRegexes = true;
            this.outputRegexes = prevOp.getOutputRegexes();
            this.hasOutputRegexes = true;
        }
    }

    /**
     *
     * @param outputRegexes
     */
    setOutputRegexes (outputRegexes) {
        this.outputRegexes = [...outputRegexes];
        this.hasOutputRegexes = true;
    }

    /**
     *
     * @param inputRegexes
     */
    setInputRegexes (inputRegexes) {
        this.inputRegexes = [...inputRegexes];
        this.hasInputRegexes = true;
    }

    /**
     *
     */
    getInputRegexes () {
        return this.inputRegexes;
    }

    /**
     *
     */
    getOutputRegexes () {
        return this.outputRegexes;
    }

    /**
     * Finds operations that claim to be able to decode the input based on regular
     * expression matches.
     *
     * @returns {Object[]}
     */
    findMatchingInputRegexes (inputStr) {
        const matches = [];

        for (const pattern of this.inputRegexes) {
            const regex = new RegExp(pattern.match, pattern.flags);

            if (regex.test(inputStr)) {
                matches.push(pattern);
            }
        }

        return matches;
    }


    /**
     * Generates a list of all patterns that operations claim to be able to decode.
     *
     * @private
     * @returns {Object[]}
     */
    generateInputOpPatterns() {
        const opPatterns = [];
        for (const op in OperationConfig) {
            if (("inputRegexes" in OperationConfig[op]) && !!(OperationConfig[op].inputRegexes))
                OperationConfig[op].inputRegexes.forEach(pattern => {
                    opPatterns.push({
                        op: op,
                        match: pattern.match,
                        flags: pattern.flags,
                        args: pattern.args,
                        useful: pattern.useful || false
                    });
                });
        }

        return opPatterns;
    }

    /**
     * Generates the list of all the operations that have a valid output.
     *
     * @returns {Object[]}
     */
    generateOutputOpPatterns() {
        const opPatterns = [];
        for (const op in OperationConfig) {
            if ((OperationConfig[op].outputRegexes) && !(OperationConfig[op].inputRegexes))
                OperationConfig[op].outputRegexes.forEach(pattern => {
                    opPatterns.push({
                        op: op,
                        match: pattern.match,
                        flags: pattern.flags,
                        shouldMatch: pattern.shouldMatch,
                        args: pattern.args,
                        useful: pattern.useful || false
                    });
                });
        }

        return opPatterns;
    }

} export default potentialOps;
