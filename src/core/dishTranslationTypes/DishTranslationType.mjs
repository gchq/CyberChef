/**
 * @author d98762625 [d98762625@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */


/**
 * Abstract class for dish translation methods
 */
class DishTranslationType {

    /**
     * Warn translations dont work without value from bind
     */
    static checkForValue(value) {
        if (value === undefined) {
            throw new Error("only use translation methods with .bind");
        }
    }

    /**
     * convert the given value to a ArrayBuffer
     * @param {*} value
     */
    static toArrayBuffer() {
        throw new Error("toByteArray has not been implemented");
    }

    /**
     * convert the given value from a ArrayBuffer
     * @param {boolean} notUTF8
     */
    static fromArrayBuffer(notUTF8=undefined) {
        throw new Error("toType has not been implemented");
    }
}

export default DishTranslationType;
