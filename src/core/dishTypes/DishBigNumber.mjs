/**
 * @author d98762625 [d98762625@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import DishType from "./DishType.mjs";
import Utils from "../Utils.mjs";
import BigNumber from "bignumber.js";

/**
 * translation methods for BigNumber Dishes
 */
class DishBigNumber extends DishType {
    /**
     * convert the given value to a ArrayBuffer
     * @param {BigNumber} value
     */
    static toArrayBuffer() {
        DishBigNumber.checkForValue(this.value);
        this.value = BigNumber.isBigNumber(this.value)
            ? Utils.strToArrayBuffer(this.value.toFixed())
            : new ArrayBuffer();
    }

    /**
     * convert the given value from a ArrayBuffer
     */
    static fromArrayBuffer() {
        DishBigNumber.checkForValue(this.value);
        try {
            this.value = new BigNumber(Utils.arrayBufferToStr(this.value));
        } catch (err) {
            this.value = new BigNumber(NaN);
        }
    }
}

export default DishBigNumber;
