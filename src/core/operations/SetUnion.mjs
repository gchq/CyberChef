import Utils from "../Utils";
import Operation from "../Operation";

/**
 * Set Union operation
 */
class SetUnion extends Operation {

    /**
     * Set Union constructor
     */
    constructor() {
        super();

        this.name = "Set Union";
        this.module = "Default";
        this.description = "Get the union of two sets";
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
     * Run the union operation
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

        return Utils.escapeHtml(this.runUnion(...sets.map(s => s.split(this.itemDelimiter))));
    }

    /**
     * Get the union of the two sets.
     *
     * @param {Object[]} a
     * @param {Object[]} b
     * @returns {Object[]}
     */
    runUnion(a, b) {
        const result = {};

        /**
         * Only add non-existing items
         * @param {Object} hash
         */
        const addUnique = (hash) => (item) => {
            if (!hash[item]) {
                hash[item] = true;
            }
        };

        a.map(addUnique(result));
        b.map(addUnique(result));

        return Object.keys(result).join(this.itemDelimiter);
    }
}

export default SetUnion;
