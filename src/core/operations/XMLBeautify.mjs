/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

/**
 * Adapted from vkBeautify (c) 2012 Vadim Kiryukhin, MIT/GPL dual licence.
 */
function createShiftArr(step) {
    let space = "    ";

    if (isNaN(parseInt(step, 10))) {
        space = step;
    } else {
        switch (step) {
            case 1: space = " "; break;
            case 2: space = "  "; break;
            case 3: space = "   "; break;
            case 4: space = "    "; break;
            case 5: space = "     "; break;
            case 6: space = "      "; break;
            case 7: space = "       "; break;
            case 8: space = "        "; break;
            case 9: space = "         "; break;
            case 10: space = "          "; break;
            case 11: space = "           "; break;
            case 12: space = "            "; break;
        }
    }

    const shift = ["\n"];
    for (let ix = 0; ix < 100; ix++) {
        shift.push(shift[ix] + space);
    }
    return shift;
}

/**
 * Adapted from vkBeautify (c) 2012 Vadim Kiryukhin, MIT/GPL dual licence.
 *
 * Fix for issue #2501: the xmlns check is moved before the generic self-close
 * check so that a fragment like `xmlns="foo" />` is caught here rather than
 * by the `/>` branch. When such a fragment ends with `/>` the element is
 * self-closing, so we decrement deep to undo the increment that fired when
 * the preceding `<tagName` fragment was classified as an opening element.
 */
function xmlBeautify(text, step) {
    const ar = text
        .replace(/>\s{0,}</g, "><")
        .replace(/</g, "~::~<")
        .replace(/\s*xmlns:/g, "~::~xmlns:")
        .replace(/\s*xmlns=/g, "~::~xmlns=")
        .split("~::~");

    const len = ar.length;
    const shift = createShiftArr(step);
    let inComment = false;
    let deep = 0;
    let str = "";

    for (let ix = 0; ix < len; ix++) {
        // start comment or <![CDATA[...]]> or <!DOCTYPE
        if (ar[ix].search(/<!/) > -1) {
            str += shift[deep] + ar[ix];
            inComment = true;
            if (ar[ix].search(/-->/) > -1 || ar[ix].search(/\]>/) > -1 || ar[ix].search(/!DOCTYPE/) > -1) {
                inComment = false;
            }
        // end comment or <![CDATA[...]]>
        } else if (ar[ix].search(/-->/) > -1 || ar[ix].search(/\]>/) > -1) {
            str += ar[ix];
            inComment = false;
        // <elm></elm>
        } else if (
            /^<\w/.exec(ar[ix - 1]) && /^<\/\w/.exec(ar[ix]) &&
            /^<[\w:\-.,]+/.exec(ar[ix - 1])?.[0] === /^<\/[\w:\-.,]+/.exec(ar[ix])?.[0].replace("/", "")
        ) {
            str += ar[ix];
            if (!inComment) deep--;
        // <elm>
        } else if (ar[ix].search(/<\w/) > -1 && ar[ix].search(/<\//) === -1 && ar[ix].search(/\/>/) === -1) {
            str = !inComment ? str + shift[deep++] + ar[ix] : str + ar[ix];
        // <elm>...</elm>
        } else if (ar[ix].search(/<\w/) > -1 && ar[ix].search(/<\//) > -1) {
            str = !inComment ? str + shift[deep] + ar[ix] : str + ar[ix];
        // </elm>
        } else if (ar[ix].search(/<\//) > -1) {
            str = !inComment ? str + shift[--deep] + ar[ix] : str + ar[ix];
        // <? xml ... ?>
        } else if (ar[ix].search(/<\?/) > -1) {
            str += shift[deep] + ar[ix];
        // xmlns: or xmlns= — must be checked before the generic /> branch so that a self-closing
        // element with a namespace attribute (e.g. <b xmlns="foo" />) is handled here.
        } else if (ar[ix].search(/xmlns:/) > -1 || ar[ix].search(/xmlns=/) > -1) {
            str = !inComment ? str + shift[deep] + ar[ix] : str + ar[ix];
            if (ar[ix].search(/\/>/) > -1) deep--;
        // <elm/>
        } else if (ar[ix].search(/\/>/) > -1) {
            str = !inComment ? str + shift[deep] + ar[ix] : str + ar[ix];
        } else {
            str += ar[ix];
        }
    }

    return str[0] === "\n" ? str.slice(1) : str;
}

/**
 * XML Beautify operation
 */
class XMLBeautify extends Operation {

    /**
     * XMLBeautify constructor
     */
    constructor() {
        super();

        this.name = "XML Beautify";
        this.module = "Code";
        this.description = "Indents and prettifies eXtensible Markup Language (XML) code.";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Indent string",
                "type": "binaryShortString",
                "value": "\\t"
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const indentStr = args[0];
        return xmlBeautify(input, indentStr);
    }

}

export default XMLBeautify;
