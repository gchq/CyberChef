/**
 * @author d98762625 [d98762625@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import DishType from "./DishType.mjs";
import { isNodeEnvironment } from "../Utils.mjs";


/**
 * Translation methods for ListFile Dishes
 */
class DishListFile extends DishType {

    /**
     * convert the given value to a ArrayBuffer
     */
    static toArrayBuffer() {
        DishListFile.checkForValue(this.value);

        if (isNodeEnvironment()) {
            this.value = this.value.map(file => Uint8Array.from(file.data));
        }
        this.value = DishListFile.concatenateTypedArrays(...this.value).buffer;
    }

    /**
     * convert the given value from a ArrayBuffer
     */
    static fromArrayBuffer() {
        DishListFile.checkForValue(this.value);
        this.value = [new File(this.value, "unknown")];
    }


    /**
     * Concatenates a list of Uint8Arrays together
     *
     * @param {Uint8Array[]} arrays
     * @returns {Uint8Array}
     */
    static concatenateTypedArrays(...arrays) {
        let totalLength = 0;
        for (const arr of arrays) {
            totalLength += arr.length;
        }
        const result = new Uint8Array(totalLength);
        let offset = 0;
        for (const arr of arrays) {
            result.set(arr, offset);
            offset += arr.length;
        }
        return result;
    }
}

export default DishListFile;
