import SetOp from "./SetOps";

/**
 * 
 */
class SetUnion extends SetOp {

    /**
     * 
     */
    constructor() {
        super();
        this.setOp = this.runUnion;

        this.name = "Set Union";
        this.description = "Get the union of two sets";
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
