/**
 * CodeMirror utilities that are relevant to both the input and output
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2022
 * @license Apache-2.0
 */


/**
 * Override for rendering special characters.
 * Should mirror the toDOM function in
 * https://github.com/codemirror/view/blob/main/src/special-chars.ts#L150
 * But reverts the replacement of line feeds with newline control pictures.
 * @param {number} code
 * @param {string} desc
 * @param {string} placeholder
 * @returns {element}
 */
export function renderSpecialChar(code, desc, placeholder) {
    const s = document.createElement("span");
    // CodeMirror changes 0x0a to "NL" instead of "LF". We change it back.
    s.textContent = code === 0x0a ? "\u240a" : placeholder;
    s.title = desc;
    s.setAttribute("aria-label", desc);
    s.className = "cm-specialChar";
    return s;
}
