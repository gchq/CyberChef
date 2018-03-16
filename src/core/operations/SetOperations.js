import Utils from "../Utils.js";

/**
 * 
 */
class SetOps {
    /**
     * 
     */
    constructor() {
        this._sampleDelimiter = "\\n\\n";
        this._operation = ["Union", "Intersection", "Set Difference", "Symmetric Difference", "Cartesian Product", "Power Set"];
        this._itemDelimiter = ",";
    }

    /**
     * 
     */
    get OPERATION() {
        return this._operation;
    }

    /**
     * 
     */
    get SAMPLE_DELIMITER() {
        return this._sampleDelimiter;
    }

    /**
     * 
     */
    get ITEM_DELIMITER() {
        return this._itemDelimiter;
    }


    /**
     * 
     * @param {*} input 
     * @param {*} args 
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
            Union: this.runUnion,
            Intersection: this.runIntersect,
            "Set Difference": this.runSetDifference,
            "Symmetric Difference": this.runSymmetricDifference,
            "Cartesian Product": this.runCartesianProduct,
            "Power Set": this.runPowerSet(itemDelimiter),
        }[operation]
            .apply(null, sets.map(s => s.split(itemDelimiter)));

        // Formatting issues due to the nested characteristics of power set.
        if (operation === "Power Set") {
            result = result.map(i => `${i}\n`).join("");
        } else {
            result = result.join(itemDelimiter);
        }

        return Utils.escapeHtml(result);
    }

    /**
     * 
     * @param {*} a 
     * @param {*} a 
     */
    runUnion(a, b) {

        const result = {};

        /**
         * 
         * @param {*} r 
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
     * 
     * @param {*} a 
     * @param {*} b 
     */
    runIntersect(a, b) {
        return a.filter((item) => {
            return b.indexOf(item) > -1;
        });
    }

    /**
     * 
     * @param {*} a 
     * @param {*} b 
     */
    runSetDifference(a, b) {
        return a.filter((item) => {
            return b.indexOf(item) === -1;
        });
    }

    /**
     * 
     * @param {*} a 
     * @param {*} b 
     */
    runSymmetricDifference(a, b) {
        /**
         * 
         * @param {*} refArray 
         */
        const getDifference = (refArray) => (item) => {
            return refArray.indexOf(item) === -1;
        };

        return a
            .filter(getDifference(b))
            .concat(b.filter(getDifference(a)));
    }

    /**
     * 
     * @param {*} a 
     * @param {*} b 
     */
    runCartesianProduct(a, b) {
        return Array(Math.max(a.length, b.length))
            .fill(null)
            .map((item, index) => `(${a[index] || undefined},${b[index] || undefined})`);
    }

    /**
     * 
     * @param {*} a 
     */
    runPowerSet(delimiter) {
        return function(a) {
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