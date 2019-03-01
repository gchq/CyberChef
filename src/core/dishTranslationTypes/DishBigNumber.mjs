/**
 * @author d98762625 [d98762625@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import DishTranslationType from "./DishTranslationType";
import Utils from "../Utils";
import BigNumber from "bignumber.js";

/**
 * translation methods for BigNumber Dishes
 */
class DishBigNumber extends DishTranslationType {

    /**
     * convert the given value to a ByteArray
     * @param {BigNumber} value
     */
    static toByteArray() {
        DishBigNumber.checkForValue(this.value);
        this.value = BigNumber.isBigNumber(this.value) ? Utils.strToByteArray(this.value.toFixed()) : [];
    }

    /**
     * convert the given value from a ByteArray
     * @param {ByteArray} value
     * @param {function} byteArrayToStr
     */
    static fromByteArray(byteArrayToStr) {
        DishBigNumber.checkForValue(this.value);
        try {
            this.value = new BigNumber(byteArrayToStr(this.value));
        } catch (err) {
            this.value = new BigNumber(NaN);
        }
    }
}

export default DishBigNumber;
