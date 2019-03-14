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
            console.log('toByteArray original value:');
            console.log(this.value);
            // this.value = Utils.readFileSync(this.value);
            this.value = Array.prototype.slice.call(Utils.readFileSync(this.value));
            console.log('toByteArray value:');
            console.log(this.value);
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
        console.log('from Byte array');
        console.log(this.value);
    }
}

export default DishFile;
