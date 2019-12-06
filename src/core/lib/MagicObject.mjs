/**
 * A class to make the input/output validation checks easier to define.
 */
class magicObject {
    /**
     * @param inRegexes
     * @param outRegexes
     * @param mimeCheck
     */
    constructor (inRegexes = null, outRegexes = null, mimeCheck = null) {
        this.inRegexes = inRegexes;
        this.outRegexes = outRegexes;
        this.mimeCheck = mimeCheck;
    }

} export default magicObject;
