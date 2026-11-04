/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

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

/**
 * Builds the lookup array of indentation strings used by xmlBeautify.
 * Based on vkBeautify by Vadim Kiryukhin (dual licensed under the MIT and
 * GPL licenses): http://www.eslinstructor.net/vkbeautify/
 *
 * @param {string|number} step
 * @returns {string[]}
 */
function createShiftArr(step) {
    let space = "    ";

    if (isNaN(parseInt(step))) { // argument is string
        space = step;
    } else { // argument is integer
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

    const shift = ["\n"]; // array of shifts
    for (let ix = 0; ix < 100; ix++) {
        shift.push(shift[ix] + space);
    }
    return shift;
}

/**
 * Pretty-prints XML.
 *
 * Inlined from vkBeautify (dual licensed under the MIT and GPL licenses):
 * http://www.eslinstructor.net/vkbeautify/
 * The original library splits a tag at its xmlns attribute, so a
 * self-closing element carrying xmlns (e.g. <b xmlns="foo" />) is turned
 * into two fragments, "<b" and "xmlns=\"foo\" />". The first fragment
 * increases the indentation depth but the second never decreases it again,
 * which pushed all following elements one level too deep. The xmlns
 * branch below therefore restores the depth when the fragment closes its
 * element.
 *
 * @param {string} text
 * @param {string|number} step
 * @returns {string}
 */
function xmlBeautify(text, step) {
    const ar = text.replace(/>\s{0,}</g, "><")
        .replace(/</g, "~::~<")
        .replace(/\s*xmlns\:/g, "~::~xmlns:")
        .replace(/\s*xmlns\=/g, "~::~xmlns=")
        .split("~::~"),
        len = ar.length,
        shift = step ? createShiftArr(step) : createShiftArr("    ");
    let inComment = false,
        deep = 0,
        str = "";

    for (let ix = 0; ix < len; ix++) {
        // start comment or <![CDATA[...]]> or <!DOCTYPE
        if (ar[ix].search(/<!/) > -1) {
            str += shift[deep] + ar[ix];
            inComment = true;
            // end comment or <![CDATA[...]]>
            if (ar[ix].search(/-->/) > -1 || ar[ix].search(/\]>/) > -1 || ar[ix].search(/!DOCTYPE/) > -1) {
                inComment = false;
            }
        } else
        // end comment or <![CDATA[...]]>
        if (ar[ix].search(/-->/) > -1 || ar[ix].search(/\]>/) > -1) {
            str += ar[ix];
            inComment = false;
        } else
        // <elm></elm>
        if (/^<\w/.exec(ar[ix - 1]) && /^<\/\w/.exec(ar[ix]) &&
            /^<[\w:\-\.\,]+/.exec(ar[ix - 1])[0] === /^<\/[\w:\-\.\,]+/.exec(ar[ix])[0].replace("/", "")) {
            str += ar[ix];
            if (!inComment) deep--;
        } else
        // <elm>
        if (ar[ix].search(/<\w/) > -1 && ar[ix].search(/<\//) === -1 && ar[ix].search(/\/>/) === -1) {
            str = !inComment ? str += shift[deep++] + ar[ix] : str += ar[ix];
        } else
        // <elm>...</elm>
        if (ar[ix].search(/<\w/) > -1 && ar[ix].search(/<\//) > -1) {
            str = !inComment ? str += shift[deep] + ar[ix] : str += ar[ix];
        } else
        // </elm>
        if (ar[ix].search(/<\//) > -1) {
            str = !inComment ? str += shift[--deep] + ar[ix] : str += ar[ix];
        } else
        // xmlns attribute (split off from its element above). The element
        // was opened by the previous "<elm" fragment; if it self-closed,
        // undo that increment.
        if (ar[ix].search(/xmlns\:/) > -1 || ar[ix].search(/xmlns\=/) > -1) {
            str += shift[deep] + ar[ix];
            if (ar[ix].search(/\/>/) > -1 && !inComment) deep--;
        } else
        // <elm/>
        if (ar[ix].search(/\/>/) > -1) {
            str = !inComment ? str += shift[deep] + ar[ix] : str += ar[ix];
        } else
        // <? xml ... ?>
        if (ar[ix].search(/<\?/) > -1) {
            str += shift[deep] + ar[ix];
        } else {
            str += ar[ix];
        }
    }

    return (str[0] === "\n") ? str.slice(1) : str;
}

export default XMLBeautify;
