/**
 * @author d98762625 [d98762625@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */


import DishType from "./DishType.mjs";
import Utils from "../Utils.mjs";

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
     */
    static fromArrayBuffer() {
        DishNumber.checkForValue(this.value);
        this.value = this.value ? parseFloat(Utils.arrayBufferToStr(this.value)) : 0;
    }
}

export default DishNumber;
