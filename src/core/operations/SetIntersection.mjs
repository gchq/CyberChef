import SetOp from "./SetOps";

/**
 * 
 */
class SetIntersection extends SetOp {

    /**
     * 
     */
    constructor() {
        super();
        this.setOp = this.runIntersection;

        this.name = "Set Intersection";
        this.description = "Get the intersection of two sets";
    }

    /**
     * Get the intersection of the two sets.
     *
     * @param {Object[]} a
     * @param {Object[]} b
     * @returns {Object[]}
     */
    runIntersection(a, b) {
        return a.filter((item) => {
            return b.indexOf(item) > -1;
        }).join(this.itemDelimiter);
    }
}

export default SetIntersection;
