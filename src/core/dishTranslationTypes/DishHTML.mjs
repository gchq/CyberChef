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
     * convert the given value to a ByteArray
     * @param {String} value
     */
    static toByteArray() {
        DishHTML.checkForValue(this.value);
        this.value = this.value ? Utils.strToByteArray(Utils.unescapeHtml(Utils.stripHtmlTags(this.value, true))) : [];
    }

    /**
     * convert the given value from a ByteArray
     * @param {function} byteArrayToStr
     */
    static fromByteArray(byteArrayToStr) {
        DishHTML.checkForValue(this.value);
        DishString.fromByteArray(this.value, byteArrayToStr);
    }
}

export default DishHTML;
