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
     * convert the given value to a ArrayBuffer
     */
    static toArrayBuffer() {
        DishJSON.checkForValue(this.value);
        this.value = this.value ? Utils.strToArrayBuffer(JSON.stringify(this.value, null, 4)) : new ArrayBuffer;
    }

    /**
     * convert the given value from a ArrayBuffer
     * @param {boolean} notUTF8
     */
    static fromArrayBuffer(notUTF8) {
        DishJSON.checkForValue(this.value);
        this.value = JSON.parse(Utils.arrayBufferToStr(this.value, !notUTF8));
    }
}

export default DishJSON;
