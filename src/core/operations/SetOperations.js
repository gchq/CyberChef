import Utils from "../Utils.js";

/**
 * Set operations.
 * 
 * @author d98762625 [d98762625@gmail.com]
 * @copyright Crown Copyright 2018
 * @license APache-2.0
 * 
 * @namespace
 */
class SetOps {

    /**
     * Set default options for operation
     */
    constructor() {
        this._sampleDelimiter = "\\n\\n";
        this._operation = ["Union", "Intersection", "Set Difference", "Symmetric Difference", "Cartesian Product", "Power Set"];
        this._itemDelimiter = ",";
    }

    /**
     * Get operations array
     * @returns {String[]}
     */
    get OPERATION() {
        return this._operation;
    }

    /**
     * Get sample delimiter
     * @returns {String}
     */
    get SAMPLE_DELIMITER() {
        return this._sampleDelimiter;
    }

    /**
     * Get item delimiter
     * @returns {String}
     */
    get ITEM_DELIMITER() {
        return this._itemDelimiter;
    }


    /**
     * Run the configured set operation.
     * 
     * @param {String} input 
     * @param {String[]} args 
     * @returns {html}
     */
    runSetOperation(input, args) {
        const [sampleDelim, itemDelimiter, operation] = args;
        const sets = input.split(sampleDelim);

        if (!sets || (sets.length !== 2 && operation !== "Power Set") || (sets.length !== 1 && operation === "Power Set")) {
            return "Incorrect number of sets, perhaps you need to modify the sample delimiter or add more samples?";
        }
        
        if (this._operation.indexOf(operation) === -1) {
            return "Invalid 'Operation' option.";
        }

        let result = {
            "Union": this.runUnion,
            "Intersection": this.runIntersect,
            "Set Difference": this.runSetDifference,
            "Symmetric Difference": this.runSymmetricDifference,
            "Cartesian Product": this.runCartesianProduct,
            "Power Set": this.runPowerSet(itemDelimiter),
        }[operation]
            .apply(this, sets.map(s => s.split(itemDelimiter)));

            // Formatting issues due to the nested characteristics of power set.
        if (operation === "Power Set") {
            result = result.map(i => `${i}\n`).join("");
        } else {
            result = result.join(itemDelimiter);
        }

        return Utils.escapeHtml(result);
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

        return Object.keys(result);
    }

    /**
     * Get the intersection of the two sets.
     * @param {Object[]} a 
     * @param {Object[]} b
     * @returns {Object[]} 
     */
    runIntersect(a, b) {
        return a.filter((item) => {
            return b.indexOf(item) > -1;
        });
    }

    /**
     * Get elements in set a that are not in set b
     * @param {Object[]} a 
     * @param {Object[]} b 
     * @returns {Object[]}
     */
    runSetDifference(a, b) {
        return a.filter((item) => {
            return b.indexOf(item) === -1;
        });
    }

    /**
     * Get elements of each set that aren't in the other set.
     * @param {Object[]} a 
     * @param {Object[]} b 
     * @return {Object[]}
     */
    runSymmetricDifference(a, b) {
        return this.runSetDifference(a,b)
            .concat(this.runSetDifference(b, a));
    }

    /**
     * 
     * @param {Object[]} a 
     * @param {Object[]} b 
     * @returns {String[]}
     */
    runCartesianProduct(a, b) {
        return Array(Math.max(a.length, b.length))
            .fill(null)
            .map((item, index) => `(${a[index] || undefined},${b[index] || undefined})`);
    }

    /**
     * 
     * @param {Object[]} a
     * @returns {Object[]} 
     */
    runPowerSet(delimiter) {
        return function(a) {

            // empty array items getting picked up
            a = a.filter(i => i.length);
            if (!a.length) {
                return [];
            }

            /**
             * 
             * @param {*} dec 
             */
            const toBinary = (dec) => (dec >>> 0).toString(2);
            const result = new Set();
            const maxBinaryValue = parseInt(Number(a.map(i => "1").reduce((p, c) => p + c)), 2);
            const binaries = [...Array(maxBinaryValue + 1).keys()]
                .map(toBinary)
                .map(i => i.padStart(toBinary(maxBinaryValue).length, "0"));

            binaries.forEach((binary) => {
                const split = binary.split("");
                result.add(a.filter((item, index) => split[index] === "1"));
            });

            // map for formatting & put in length order.
            return [...result].map(r => r.join(delimiter)).sort((a, b) => a.length - b.length);
        };
    }
}

export default new SetOps();