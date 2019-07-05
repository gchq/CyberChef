/**
 * @author d98762625 [d98762625@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */


import DishType from "./DishType";
import Utils from "../Utils";

/**
 * Translation methods for number dishes
 */
class DishNumber extends DishType {

    /**
     * convert the given value to a ArrayBuffer
     */
    static toArrayBuffer() {
        DishNumber.checkForValue(this.value);
        this.value = typeof this.value === "number" ? Utils.strToArrayBuffer(this.value.toString()) : new ArrayBuffer;
    }

    /**
     * convert the given value from a ArrayBuffer
     * @param {boolean} notUTF8
     */
    static fromArrayBuffer(notUTF8) {
        DishNumber.checkForValue(this.value);
        this.value = this.value ? parseFloat(Utils.arrayBufferToStr(this.value, !notUTF8)) : 0;
    }
}

export default DishNumber;
