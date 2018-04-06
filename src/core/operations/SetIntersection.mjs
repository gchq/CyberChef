import Utils from "../Utils";
import Operation from "../Operation";

/**
 * Set Intersection operation
 */
class SetIntersection extends Operation {

    /**
     * Set Intersection constructor
     */
    constructor() {
        super();

        this.name = "Set Intersection";
        this.module = "Default";
        this.description = "Get the intersection of two sets";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Sample delimiter",
                type: "binaryString",
                value: Utils.escapeHtml("\\n\\n")
            },
            {
                name: "Item delimiter",
                type: "binaryString",
                value: ","
            },
        ];
    }

    /**
     * Validate input length
     * @param {Object[]} sets
     * @throws {Error} if not two sets
     */
    validateSampleNumbers(sets) {
        if (!sets || (sets.length !== 2)) {
            throw "Incorrect number of sets, perhaps you need to modify the sample delimiter or add more samples?";
        }
    }

    /**
     * Run the intersection operation
     * @param input
     * @param args
     */
    run(input, args) {
        [this.sampleDelim, this.itemDelimiter] = args;
        const sets = input.split(this.sampleDelim);

        try {
            this.validateSampleNumbers(sets);
        } catch (e) {
            return e;
        }

        return Utils.escapeHtml(this.runIntersect(...sets.map(s => s.split(this.itemDelimiter))));
    }

    /**
     * Get the intersection of the two sets.
     *
     * @param {Object[]} a
     * @param {Object[]} b
     * @returns {Object[]}
     */
    runIntersect(a, b) {
        return a
            .filter((item) => {
                return b.indexOf(item) > -1;
            })
            .join(this.itemDelimiter);
    }

}

export default SetIntersection;
