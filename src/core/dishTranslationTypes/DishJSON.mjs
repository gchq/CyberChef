/**
 * @author d98762625 [d98762625@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import DishTranslationType from "./DishTranslationType";
import Utils from "../Utils";

/**
 * Translation methods for JSON dishes
 */
class DishJSON extends DishTranslationType {

    /**
     * convert the given value to a ByteArray
     */
    static toByteArray() {
        DishJSON.checkForValue(this.value);
        this.value = this.value ? Utils.strToByteArray(JSON.stringify(this.value, null, 4)) : [];
    }

    /**
     * convert the given value from a ByteArray
     * @param {ByteArray} value
     * @param {function} byteArrayToStr
     */
    static fromByteArray(byteArrayToStr) {
        DishJSON.checkForValue(this.value);
        this.value = JSON.parse(byteArrayToStr(this.value));
    }
}

export default DishJSON;
