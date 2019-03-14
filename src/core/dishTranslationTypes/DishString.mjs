/**
 * @author d98762625 [d98762625@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */


import DishTranslationType from "./DishTranslationType";
import Utils from "../Utils";

/**
 * Translation methods for string dishes
 */
class DishString extends DishTranslationType {

    /**
     * convert the given value to a ByteArray
     */
    static toByteArray() {
        console.log('string to byte array');
        DishString.checkForValue(this.value);
        this.value = this.value ? Utils.strToByteArray(this.value) : [];
        console.log(this.value);
    }

    /**
     * convert the given value from a ByteArray
     * @param {function} byteArrayToStr
     */
    static fromByteArray(byteArrayToStr) {
        DishString.checkForValue(this.value);
        this.value = this.value ? byteArrayToStr(this.value) : "";
    }
}

export default DishString;
