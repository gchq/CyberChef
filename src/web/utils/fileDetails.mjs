/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2022
 * @license Apache-2.0
 */

import { showSidePanel } from "./sidePanel.mjs";
import Utils from "../../core/Utils.mjs";
import { isImage, detectFileType } from "../../core/lib/FileType.mjs";

/**
 * A File Details extension for CodeMirror
 */
class FileDetailsPanel {
    /**
     * FileDetailsPanel constructor
     * @param {Object} opts
     */
    constructor(opts) {
        this.fileDetails = opts?.fileDetails;
        this.progress = opts?.progress ?? 0;
        this.status = opts?.status;
        this.buffer = opts?.buffer;
        this.renderPreview = opts?.renderPreview;
        this.toggleHandler = opts?.toggleHandler;
        this.hidden = opts?.hidden;
        this.dom = this.buildDOM();
        this.renderFileThumb();
    }

    /**
     * Builds the file details DOM tree
     * @returns {DOMNode}
     */
    buildDOM() {
        const dom = document.createElement("div");

        dom.className = "cm-file-details";
        const fileThumb = require("../static/images/file-128x128.png");
        dom.innerHTML = `
            <div class="${
                this.hidden
                    ? "file-details-toggle-hidden"
                    : "file-details-toggle-shown"
            }"
                data-toggle="tooltip"
                title="${this.hidden ? "Show" : "Hide"} file details">
                ${this.hidden ? "&#10096;" : "&#10097;"}
            </div>
            <p class="file-details-heading">File details</p>
            <img aria-hidden="true" src="${fileThumb}" alt="File icon" class="file-details-thumbnail"/>
            <table class="file-details-data">
                <tr>
                    <td>Name:</td>
                    <td class="file-details-name" title="${Utils.escapeHtml(
                        this.fileDetails?.name,
                    )}">
                        ${Utils.escapeHtml(this.fileDetails?.name)}
                    </td>
                </tr>
                <tr>
                    <td>Size:</td>
                    <td class="file-details-size" title="${Utils.escapeHtml(
                        this.fileDetails?.size,
                    )} bytes">
                        ${Utils.escapeHtml(this.fileDetails?.size)} bytes
                    </td>
                </tr>
                <tr>
                    <td>Type:</td>
                    <td class="file-details-type" title="${Utils.escapeHtml(
                        this.fileDetails?.type,
                    )}">
                        ${Utils.escapeHtml(this.fileDetails?.type)}
                    </td>
                </tr>
                <tr>
                    <td>Loaded:</td>
                    <td class="file-details-${
                        this.status === "error" ? "error" : "loaded"
                    }">
                        ${
                            this.status === "error"
                                ? "Error"
                                : this.progress + "%"
                        }
                    </td>
                </tr>
            </table>
        `;

        dom.querySelector(
            ".file-details-toggle-shown,.file-details-toggle-hidden",
        ).addEventListener("click", this.toggleHandler, false);

        return dom;
    }

    /**
     * Render the file thumbnail
     */
    renderFileThumb() {
        if (!this.renderPreview) {
            this.resetFileThumb();
            return;
        }
        const fileThumb = this.dom.querySelector(".file-details-thumbnail");
        const fileType = this.dom.querySelector(".file-details-type");
        const fileBuffer = new Uint8Array(this.buffer);
        const type = isImage(fileBuffer);

        if (type && type !== "image/tiff" && fileBuffer.byteLength <= 512000) {
            // Most browsers don't support displaying TIFFs, so ignore them
            // Don't render images over 512,000 bytes
            const blob = new Blob([fileBuffer], { type: type }),
                url = URL.createObjectURL(blob);
            fileThumb.src = url;
        } else {
            this.resetFileThumb();
        }
        fileType.textContent = type
            ? type
            : detectFileType(fileBuffer)[0]?.mime ?? "unknown";
    }

    /**
     * Reset the file thumbnail to the default icon
     */
    resetFileThumb() {
        const fileThumb = this.dom.querySelector(".file-details-thumbnail");
        fileThumb.src = require("../static/images/file-128x128.png");
    }
}

/**
 * A panel constructor factory building a panel that displays file details
 * @param {Object} opts
 * @returns {Function<PanelConstructor>}
 */
function makePanel(opts) {
    const fdPanel = new FileDetailsPanel(opts);

    return (view) => {
        return {
            dom: fdPanel.dom,
            width: opts?.hidden ? 1 : 200,
            update(update) {},
            mount() {
                $("[data-toggle='tooltip']").tooltip();
            },
        };
    };
}

/**
 * A function that build the extension that enables the panel in an editor.
 * @param {Object} opts
 * @returns {Extension}
 */
export function fileDetailsPanel(opts) {
    const panelMaker = makePanel(opts);
    return showSidePanel.of(panelMaker);
}
