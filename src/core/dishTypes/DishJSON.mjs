/**
 * @author d98762625 [d98762625@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import DishType from "./DishType.mjs";
import Utils from "../Utils.mjs";

/**
 * Serialize Maps which are not natively compatible with JSON as an array of
 * key-value-paris.
 */
function jsonStringifyReplacer(k, v) {
    if (v instanceof Map) {
        return [...v];
    }
    return v;
}

/**
 * Translation methods for JSON dishes
 */
class DishJSON extends DishType {

    /**
     * convert the given value to a ArrayBuffer
     */
    static toArrayBuffer() {
        DishJSON.checkForValue(this.value);
        this.value = this.value !== undefined ? Utils.strToArrayBuffer(JSON.stringify(this.value, jsonStringifyReplacer, 4)) : new ArrayBuffer;
    }

    /**
     * convert the given value from a ArrayBuffer
     */
    static fromArrayBuffer() {
        DishJSON.checkForValue(this.value);
        this.value = JSON.parse(Utils.arrayBufferToStr(this.value));
    }
}

export default DishJSON;
