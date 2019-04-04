/**
 * @author d98762625 [d98762625@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import DishTranslationType from "./DishTranslationType";
import Utils from "../Utils";

/**
 * Translation methods for ListFile Dishes
 */
class DishListFile extends DishTranslationType {

    /**
     * convert the given value to a ArrayBuffer
     */
    static toArrayBuffer() {
        DishListFile.checkForValue(this.value);
        if (Utils.isNode()) {
            // TODO
            this.value = [].concat.apply([], this.value.map(f => Utils.readFileSync(f)).map(b => Array.prototype.slice.call(b)));
        } else {
            return new Promise((resolve, reject) => {
                resolve(DishListFile.concatenateTypedArrays(...this.value).buffer);
            });
        }
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
