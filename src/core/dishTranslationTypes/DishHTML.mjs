/**
 * @author d98762625 [d98762625@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import DishTranslationType from "./DishTranslationType";
import Utils from "../Utils";
import DishString from "./DishString";

/**
 * Translation methods for HTML Dishes
 */
class DishHTML extends DishTranslationType {

    /**
     * convert the given value to a ArrayBuffer
     * @param {String} value
     */
    static toArrayBuffer() {
        DishHTML.checkForValue(this.value);
        this.value = this.value ? Utils.strToArrayBuffer(Utils.unescapeHtml(Utils.stripHtmlTags(this.value, true))) : new ArrayBuffer;
    }

    /**
     * convert the given value from a ArrayBuffer
     * @param {boolean} notUTF8
     */
    static fromArrayBuffer(notUTF8) {
        DishString.fromByteArray(this.value, notUTF8);
    }
}

export default DishHTML;
