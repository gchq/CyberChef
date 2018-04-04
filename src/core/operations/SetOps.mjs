import Operation from "../Operation";
import Utils from "../Utils";

/**
 * 
 */
class SetOp extends Operation {

    /**
     * 
     * @param {*} runOp
     */
    constructor(runOp) {
        super();

        this.module = "Default";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Sample delimiter",
                type: "binaryString",
                value: "\n\n"
            },
            {
                name: "Item delimiter",
                type: "binaryString",
                value: ","
            },
        ];

        this.runOp = runOp;
    }

    /**
     * 
     * @param sets 
     */
    validateSampleNumbers(sets) {
        if (!sets || (sets.length !== 2)) {
            throw "Incorrect number of sets, perhaps you need to modify the sample delimiter or add more samples?";
        }
    }

    /**
     *
     * @param {*} input
     * @param {*} args
     */
    run(input, args) {

        [this.sampleDelim, this.itemDelimiter] = args;
        const sets = input.split(this.sampleDelim);

        try {
            this.validateSampleNumbers(sets);
        } catch (e) {
            return e;
        }

        const result = this.setOp.apply(this, sets.map(s => s.split(this.itemDelimiter)));

        // let result = {
        //     "Union": this.runUnion,
        //     "Intersection": this.runIntersect,
        //     "Set Difference": this.runSetDifference,
        //     "Symmetric Difference": this.runSymmetricDifference,
        //     "Cartesian Product": this.runCartesianProduct,
        //     "Power Set": this.runPowerSet.bind(undefined, itemDelimiter),
        // }[operation]
        //     .apply(this, sets.map(s => s.split(itemDelimiter)));

        // Formatting issues due to the nested characteristics of power set.
        // if (operation === "Power Set") {
            // result = result.map(i => `${i}\n`).join("");
        // } else {
            // result = result.join(itemDelimiter);
        // }

        return Utils.escapeHtml(result);
    }
}

export default SetOp;
