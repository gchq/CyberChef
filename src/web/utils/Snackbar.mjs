/**
 * Lightweight snackbar/toast notification utility.
 * Replaces snackbarjs dependency (which required jQuery).
 *
 * @author CyberChef Modernization
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

let container = null;

/**
 * Get or create the snackbar container.
 * @returns {HTMLElement}
 */
function getContainer() {
    if (!container) {
        container = document.getElementById("snackbar-container");
        if (!container) {
            container = document.createElement("div");
            container.id = "snackbar-container";
            container.style.cssText = "position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:9999;display:flex;flex-direction:column;align-items:center;gap:8px;pointer-events:none;";
            document.body.appendChild(container);
        }
    }
    return container;
}

/**
 * Show a snackbar notification.
 *
 * @param {Object} options
 * @param {string} options.content - The message to display
 * @param {number} [options.timeout=2000] - Duration in ms before auto-dismiss
 * @param {string} [options.style="snackbar"] - CSS class style
 */
export function showSnackbar({ content, timeout = 2000, style = "snackbar" }) {
    const el = document.createElement("div");
    el.className = `cc-snackbar ${style}`;
    el.textContent = content;
    el.style.cssText = "background:#323232;color:#fff;padding:10px 24px;border-radius:4px;font-size:14px;opacity:0;transition:opacity 0.3s;pointer-events:auto;max-width:500px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.3);";

    const cont = getContainer();
    cont.appendChild(el);

    // Trigger fade-in
    requestAnimationFrame(() => {
        el.style.opacity = "1";
    });

    // Auto-dismiss
    if (timeout > 0) {
        setTimeout(() => {
            el.style.opacity = "0";
            setTimeout(() => el.remove(), 300);
        }, timeout);
    }
}

/**
 * jQuery-compatible $.snackbar() replacement.
 * Called as: showSnackbar({ content: "message" })
 */
export default showSnackbar;
