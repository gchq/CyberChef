/**
 * @author d98762625 [d98762625@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import DishTranslationType from "./DishTranslationType";

/**
 * Translation methods for ArrayBuffer Dishes
 */
class DishArrayBuffer extends DishTranslationType {

    /**
     * convert the given value to a ByteArray
     */
    static toByteArray() {
        DishArrayBuffer.checkForValue(this.value);
        this.value = Array.prototype.slice.call(new Uint8Array(this.value));
    }

    /**
     * convert the given value from a ByteArray
     * @param {function} byteArrayToStr
     */
    static fromByteArray() {
        DishArrayBuffer.checkForValue(this.value);
        this.value = new Uint8Array(this.value).buffer;
    }
}

export default DishArrayBuffer;
