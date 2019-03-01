/**
 * @author d98762625 [d98762625@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */


import DishTranslationType from "./DishTranslationType";
import Utils from "../Utils";

/**
 * Translation methods for number dishes
 */
class DishNumber extends DishTranslationType {

    /**
     * convert the given value to a ByteArray
     */
    static toByteArray() {
        DishNumber.checkForValue(this.value);
        this.value = typeof this.value === "number" ? Utils.strToByteArray(this.value.toString()) : [];
    }

    /**
     * convert the given value from a ByteArray
     * @param {function} byteArrayToStr
     */
    static fromByteArray(byteArrayToStr) {
        DishNumber.checkForValue(this.value);
        this.value = this.value ? parseFloat(byteArrayToStr(this.value)) : 0;
    }
}

export default DishNumber;
