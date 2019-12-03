/**
 * A class to make the input/output validation checks easier to define.
 */
class magicObject {
    /**
     * @param inRegexes
     * @param outRegexes
     */
    constructor (inRegexes = null, outRegexes = null) {
        this.inRegexes = inRegexes;
        this.outRegexes = outRegexes;
    }

} export default magicObject;
