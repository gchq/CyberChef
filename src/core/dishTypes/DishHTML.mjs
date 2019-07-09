/**
 * @author d98762625 [d98762625@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import DishString from "./DishString.mjs";
import Utils from "../Utils.mjs";

/**
 * Translation methods for HTML Dishes
 */
class DishHTML extends DishString {

    /**
     * convert the given value to a ArrayBuffer
     * @param {String} value
     */
    static toArrayBuffer() {
        DishHTML.checkForValue(this.value);
        this.value = this.value ? Utils.strToArrayBuffer(Utils.unescapeHtml(Utils.stripHtmlTags(this.value, true))) : new ArrayBuffer;
    }

}

export default DishHTML;
