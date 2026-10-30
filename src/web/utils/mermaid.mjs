/**
 * Renders the output of the Render Mermaid operation and adds export buttons.
 * Loaded on demand so the Mermaid library is only downloaded when it is used.
 *
 * @author Daniel Acsinte [daniel.acsinte@fort.ro]
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import mermaid from "mermaid";
import FileSaver from "file-saver";

mermaid.initialize({
    startOnLoad: false,
    // Same theme as mermaid.live
    theme: "redux-color",
    securityLevel: "strict",
    suppressErrorRendering: true,
    // SVG text labels instead of HTML in <foreignObject>, which taints the canvas used for PNG/JPEG export in
    // some browsers. Marked secure so a diagram's own config cannot turn HTML labels back on.
    htmlLabels: false,
    flowchart: {htmlLabels: false},
    secure: [...mermaid.mermaidAPI.getSiteConfig().secure, "htmlLabels"]
});

const EXPORT_SCALE = 2;
let diagramCount = 0;

/**
 * Renders every Mermaid placeholder in the given element.
 *
 * @param {Element} container
 */
export async function renderMermaid(container) {
    for (const el of container.querySelectorAll(".mermaid-diagram")) {
        try {
            const {svg} = await mermaid.render(`mermaid-${diagramCount++}`, el.dataset.source);
            // Safe: securityLevel "strict" sanitises the SVG with DOMPurify, and diagrams cannot override it
            el.innerHTML = svg;
            el.appendChild(exportButtons(el.querySelector("svg")));
        } catch (err) {
            el.style.whiteSpace = "pre-wrap";
            el.textContent = err.message || String(err);
        }
    }
}

/**
 * @param {SVGSVGElement} svgEl
 * @returns {HTMLElement}
 */
function exportButtons(svgEl) {
    const bar = document.createElement("div");
    for (const format of ["SVG", "PNG", "JPEG"]) {
        const btn = document.createElement("button");
        btn.className = "btn btn-sm btn-outline-primary mr-1";
        btn.textContent = format;
        btn.title = `Save diagram as ${format}`;
        btn.addEventListener("click", () => exportDiagram(svgEl, format).catch(err => log.error(err)));
        bar.appendChild(btn);
    }
    return bar;
}

/**
 * Serialises the diagram with a fixed size so it renders standalone and onto a canvas.
 *
 * @param {SVGSVGElement} svgEl
 * @param {number} scale
 * @returns {string}
 */
function serialise(svgEl, scale) {
    const {width, height} = svgEl.viewBox.baseVal;
    const clone = svgEl.cloneNode(true);
    clone.setAttribute("width", width * scale);
    clone.setAttribute("height", height * scale);
    clone.style.maxWidth = "";
    return new XMLSerializer().serializeToString(clone);
}

/**
 * @param {SVGSVGElement} svgEl
 * @param {string} format - SVG, PNG or JPEG
 */
async function exportDiagram(svgEl, format) {
    if (format === "SVG") {
        FileSaver.saveAs(new Blob([serialise(svgEl, 1)], {type: "image/svg+xml"}), "diagram.svg");
        return;
    }

    const img = new Image();
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(serialise(svgEl, EXPORT_SCALE));
    await img.decode();

    const canvas = new OffscreenCanvas(img.width, img.height);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    const blob = await canvas.convertToBlob({type: `image/${format.toLowerCase()}`, quality: 0.95});
    FileSaver.saveAs(blob, `diagram.${format === "PNG" ? "png" : "jpg"}`);
}
