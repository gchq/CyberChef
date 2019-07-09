/**
 * @author d98762625 [d98762625@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */


import DishType from "./DishType.mjs";
import Utils from "../Utils.mjs";

/**
 * Translation methods for string dishes
 */
class DishString extends DishType {

    /**
     * convert the given value to a ArrayBuffer
     */
    static toArrayBuffer() {
        DishString.checkForValue(this.value);
        this.value = this.value ? Utils.strToArrayBuffer(this.value) : new ArrayBuffer;
    }

    /**
     * convert the given value from a ArrayBuffer
     * @param {boolean} notUTF8
     */
    static fromArrayBuffer(notUTF8) {
        DishString.checkForValue(this.value);
        this.value = this.value ? Utils.arrayBufferToStr(this.value, !notUTF8) : "";
    }
}

export default DishString;
