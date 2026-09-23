/**
 * @author OpenAI
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Picker from "vanilla-picker/csp";
import {debounce} from "../../core/Utils.mjs";


const ROOT_SELECTOR = "#output-html [data-parse-colour-code-picker]";
const MOUNT_SELECTOR = "[data-parse-colour-code-picker-mount]";
const PREVIEW_SELECTOR = "[data-parse-colour-code-preview]";

let activePickers = [];


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
    activePickers.forEach((picker) => picker.destroy());
    activePickers = [];
}


/**
 * Destroys any existing Parse colour code picker and mounts the current one.
 */
export function initialiseParseColourCodePicker() {
    destroyParseColourCodePicker();

    const roots = document.querySelectorAll(ROOT_SELECTOR);
    roots.forEach((root) => {
        const mount = root.querySelector(MOUNT_SELECTOR);
        const initialColor = root.dataset.initialColor;

        if (!mount || !initialColor) return;

        updatePreview(root, initialColor);

        const picker = new Picker({
            parent: mount,
            popup: false,
            alpha: true,
            editor: true,
            editorFormat: "rgb",
            color: initialColor,
        });

        picker.onChange = function(color) {
            const rgba = color.rgbaString;
            if (root.dataset.currentColor === rgba) return;

            updatePreview(root, rgba);
            debounce(() => {
                window.app.manager.input.setInput(rgba);
                window.app.manager.input.inputChange(new Event("keyup"));
            }, 75, "parseColourCodePickerInputChange")();
        };

        activePickers.push(picker);
    });
}
