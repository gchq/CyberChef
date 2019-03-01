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
     * convert the given value to a ByteArray
     */
    static toByteArray() {
        DishListFile.checkForValue(this.value);
        if (Utils.isNode()) {
            this.value = [].concat.apply([], this.value.map(f => Utils.readFileSync(f)).map(b => Array.prototype.slice.call(b)));
        } else {
            return new Promise((resolve, reject) => {
                Promise.all(this.value.map(async f => Utils.readFile(f)))
                    .then(values => this.value = values.map(b => [].concat.apply([], Array.prototype.slice.call(b))))
                    .then(resolve)
                    .catch(reject);
            });
        }
    }

    /**
     * convert the given value from a ByteArray
     * @param {function} byteArrayToStr
     */
    static fromByteArray() {
        DishListFile.checkForValue(this.value);
        this.value = [new File(this.value, "unknown")];
    }
}

export default DishListFile;
