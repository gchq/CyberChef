/**
 * @author OpenAI
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Picker from "vanilla-picker/csp";


const ROOT_SELECTOR = "#output-html [data-parse-colour-code-picker]";
const MOUNT_SELECTOR = "[data-parse-colour-code-picker-mount]";
const PREVIEW_SELECTOR = "[data-parse-colour-code-preview]";

let activePicker = null;


/**
 * Updates the rendered colour preview state.
 *
 * @param {HTMLElement} root
 * @param {string} rgba
 */
function updatePreview(root, rgba) {
    const preview = root.querySelector(PREVIEW_SELECTOR);

    root.dataset.currentColor = rgba;

    if (preview) {
        preview.style.backgroundColor = rgba;
        preview.setAttribute("aria-label", rgba);
    }
}


/**
 * Destroys the mounted Parse colour code picker, if present.
 */
export function destroyParseColourCodePicker() {
    if (!activePicker) return;

    activePicker.destroy();
    activePicker = null;
}


/**
 * Destroys any existing Parse colour code picker and mounts the current one.
 */
export function initialiseParseColourCodePicker() {
    destroyParseColourCodePicker();

    const root = document.querySelector(ROOT_SELECTOR);
    if (!root) return;

    const mount = root.querySelector(MOUNT_SELECTOR);
    const initialColor = root.dataset.initialColor;

    if (!mount || !initialColor) return;

    updatePreview(root, initialColor);

    activePicker = new Picker({
        parent: mount,
        popup: false,
        alpha: true,
        editor: true,
        editorFormat: "rgb",
        color: initialColor,
    });

    activePicker.onChange = function(color) {
        const rgba = color.rgbaString;
        if (root.dataset.currentColor === rgba) return;

        updatePreview(root, rgba);
        window.app.manager.input.setInput(rgba);
        window.app.manager.input.inputChange(new Event("keyup"));
    };
}
