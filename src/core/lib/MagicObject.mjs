/**
 * A class to make the input/output validation checks easier to define.
 */
class magicObject {
    /**
     * @param inRegexes
     * @param outRegexes
     * @param mimeCheck
     */
    constructor (inRegexes = null, outRegexes = null, mimeCheck = null, entropyTests=null) {
        this.inRegexes = inRegexes;
        this.outRegexes = outRegexes;
        this.mimeCheck = mimeCheck;
        this.entropyTests = entropyTests;
    }

} export default magicObject;
