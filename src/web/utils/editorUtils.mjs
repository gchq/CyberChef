/**
 * CodeMirror utilities that are relevant to both the input and output
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2022
 * @license Apache-2.0
 */

import Utils from "../../core/Utils.mjs";

// Descriptions for named control characters
const Names = {
    0: "null",
    7: "bell",
    8: "backspace",
    10: "line feed",
    11: "vertical tab",
    13: "carriage return",
    27: "escape",
    8203: "zero width space",
    8204: "zero width non-joiner",
    8205: "zero width joiner",
    8206: "left-to-right mark",
    8207: "right-to-left mark",
    8232: "line separator",
    8237: "left-to-right override",
    8238: "right-to-left override",
    8294: "left-to-right isolate",
    8295: "right-to-left isolate",
    8297: "pop directional isolate",
    8233: "paragraph separator",
    65279: "zero width no-break space",
    65532: "object replacement"
};

// Regex for Special Characters to be replaced
const UnicodeRegexpSupport = /x/.unicode != null ? "gu" : "g";
const Specials = new RegExp(
    "[\u0000-\u0008\u000a-\u001f\u007f-\u009f\u00ad\u061c\u200b\u200e\u200f\u2028\u2029\u202d\u202e\u2066\u2067\u2069\ufeff\ufff9-\ufffc\ue000-\uf8ff]",
    UnicodeRegexpSupport
);

/**
 * Override for rendering special characters.
 * Should mirror the toDOM function in
 * https://github.com/codemirror/view/blob/main/src/special-chars.ts#L153
 * But reverts the replacement of line feeds with newline control pictures.
 *
 * @param {number} code
 * @param {string} desc
 * @param {string} placeholder
 * @returns {element}
 */
export function renderSpecialChar(code, desc, placeholder) {
    const s = document.createElement("span");

    // CodeMirror changes 0x0a to "NL" instead of "LF". We change it back along with its description.
    if (code === 0x0a) {
        placeholder = "\u240a";
        desc = desc.replace("newline", "line feed");
    }

    // Render CyberChef escaped characters correctly - see Utils.escapeWhitespace
    if (code >= 0xe000 && code <= 0xf8ff) {
        code = code - 0xe000;
        placeholder = String.fromCharCode(0x2400 + code);
        desc = "Control character " + (Names[code] || "0x" + code.toString(16));
    }

    s.textContent = placeholder;
    s.title = desc;
    s.setAttribute("aria-label", desc);
    s.className = "cm-specialChar";
    return s;
}

/**
 * Given a string, returns that string with any control characters replaced with HTML
 * renderings of control pictures.
 *
 * @param {string} str
 * @param {boolean} [preserveWs=false]
 * @param {string} [lineBreak="\n"]
 * @returns {html}
 */
export function escapeControlChars(str, preserveWs = false, lineBreak = "\n") {
    if (!preserveWs) str = Utils.escapeWhitespace(str);

    return str.replace(Specials, function (c) {
        if (lineBreak.includes(c)) return c;
        const code = c.charCodeAt(0);
        const desc = "Control character " + (Names[code] || "0x" + code.toString(16));
        const placeholder = code > 32 ? "\u2022" : String.fromCharCode(9216 + code);
        const n = renderSpecialChar(code, desc, placeholder);
        return n.outerHTML;
    });
}
