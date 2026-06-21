"use strict";

// Load theme before the preloader is shown
try {
    document.querySelector(":root").className = (JSON.parse(localStorage.getItem("options")) || {}).theme;
} catch (err) {
    // LocalStorage access is denied by security settings
}

// Define loading messages
const loadingMsgs = [
    "Proving P = NP...",
    "Computing 6 x 9...",
    "Mining bitcoin...",
    "Dividing by 0...",
    "Initialising Skynet...",
    "[REDACTED]",
    "Downloading more RAM...",
    "Ordering 1s and 0s...",
    "Navigating neural network...",
    "Importing machine learning...",
    "Issuing Alice and Bob one-time pads...",
    "Mining bitcoin cash...",
    "Generating key material by trying to escape vim...",
    "for i in range(additional): Pylon()",
    "(creating unresolved tension...",
    "Symlinking emacs and vim to ed...",
    "Training branch predictor...",
    "Timing cache hits...",
    "Speculatively executing recipes...",
    "Adding LLM hallucinations...",
    "Decompressing malware..."
];

// Shuffle array using Durstenfeld algorithm
for (let i = loadingMsgs.length - 1; i > 0; --i) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = loadingMsgs[i];
    loadingMsgs[i] = loadingMsgs[j];
    loadingMsgs[j] = temp;
}

/**
* Show next loading message and move it to the end of the array
**/
function changeLoadingMsg() {
    const msg = loadingMsgs.shift();
    loadingMsgs.push(msg);
    try {
        const el = document.getElementById("preloader-msg");
        if (!el.classList.contains("loading"))
            el.classList.add("loading"); // Causes CSS transition on first message
        el.innerHTML = msg;
    } catch (err) {
        // This error was likely caused by the DOM not being ready yet,
        // so we wait another second and then try again.
        setTimeout(changeLoadingMsg, 1000);
    }
}

changeLoadingMsg();
window.loadingMsgsInt = setInterval(changeLoadingMsg, (Math.random() * 2000) + 1500);

/**
* If any errors are thrown during loading, handle them here
*/
function loadingErrorHandler(e) {

    /**
    * Escape HTMLs
    */
    function escapeHtml(str) {
        const HTML_CHARS = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#x27;", // &apos; not recommended because it's not in the HTML spec
            "/": "&#x2F;", // forward slash is included as it helps end an HTML entity
            "`": "&#x60;"
        };

        return str.replace(/[&<>"'/`]/g, function (match) {
            return HTML_CHARS[match];
        });
    }

    const msg = e.message +
        (e.filename ? "\nFilename: " + e.filename : "") +
        (e.lineno ? "\nLine: " + e.lineno : "") +
        (e.colno ? "\nColumn: " + e.colno : "") +
        (e.error ? "\nError: " + e.error : "") +
        "\nUser-Agent: " + navigator.userAgent +
        "\nCyberChef version: <%= htmlWebpackPlugin.options.version %>";

    clearInterval(window.loadingMsgsInt);
    document.getElementById("preloader").remove();
    document.getElementById("preloader-msg").remove();
    document.getElementById("preloader-error").innerHTML =
        "CyberChef encountered an error while loading.<br><br>" +
        "The following browser versions are supported:" +
        "<ul><li>Google Chrome 50+</li><li>Mozilla Firefox 38+</li></ul>" +
        "Your user agent is:<br>" + escapeHtml(navigator.userAgent) + "<br><br>" +
        "If your browser is supported, please <a href='https://github.com/gchq/CyberChef/issues/new/choose'>" +
        "raise an issue</a> including the following details:<br><br>" +
        "<pre>" + escapeHtml(msg) + "</pre>";
};
window.addEventListener("error", loadingErrorHandler);
