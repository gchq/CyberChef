/**
 * @author d98762625 [d98762625@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import DishTranslationType from "./DishTranslationType";
import Utils from "../Utils";

/**
 * Translation methods for file Dishes
 */
class DishFile extends DishTranslationType {

    /**
     * convert the given value to a ByteArray
     * @param {File} value
     */
    static toByteArray() {
        DishFile.checkForValue(this.value);
        if (Utils.isNode()) {
            console.log("valie: ");
            console.log(this.value);
            this.value = Array.prototype.slice.call(Utils.readFileSync(this.value));
        } else {
            return new Promise((resolve, reject) => {
                Utils.readFile(this.value)
                    .then(v => this.value = Array.prototype.slice.call(v))
                    .then(resolve)
                    .catch(reject);
            });
        }
    }

    /**
     * convert the given value from a ByteArray
     * @param {ByteArray} value
     * @param {function} byteArrayToStr
     */
    static fromByteArray() {
        DishFile.checkForValue(this.value);
        this.value = new File(this.value, "unknown");
    }
}

export default DishFile;
