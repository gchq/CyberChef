/**
 * Tests for input and output of various types to ensure the editors work as expected
 * and retain data integrity, especially when it comes to special characters.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2023
 * @license Apache-2.0
 */

// import {
//     clear,
//     utils.setInput,
//     bake,
//     setChrEnc,
//     setEOLSeq,
//     copy,
//     paste,
//     loadRecipe,
//     expectOutput,
//     uploadFile,
//     uploadFolder
// } from "./browserUtils.js";

const utils = require("./browserUtils.js");

const SPECIAL_CHARS = [
    "\u0000\u0001\u0002\u0003\u0004\u0005\u0006\u0007\u0008\u0009\u000a\u000b\u000c\u000d\u000e\u000f",
    "\u0010\u0011\u0012\u0013\u0014\u0015\u0016\u0017\u0018\u0019\u001a\u001b\u001c\u001d\u001e\u001f",
    "\u007f",
    "\u0080\u0081\u0082\u0083\u0084\u0085\u0086\u0087\u0088\u0089\u008a\u008b\u008c\u008d\u008e\u008f",
    "\u0090\u0091\u0092\u0093\u0094\u0095\u0096\u0097\u0098\u0099\u009a\u009b\u009c\u009d\u009e\u009f",
    "\u00ad\u061c\u200b\u200e\u200f\u2028\u2029\u202d\u202e\u2066\u2067\u2069\ufeff\ufff9\ufffa\ufffb\ufffc"
].join("");

const ALL_BYTES = [
    "\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f",
    "\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1a\x1b\x1c\x1d\x1e\x1f",
    "\x20\x21\x22\x23\x24\x25\x26\x27\x28\x29\x2a\x2b\x2c\x2d\x2e\x2f",
    "\x30\x31\x32\x33\x34\x35\x36\x37\x38\x39\x3a\x3b\x3c\x3d\x3e\x3f",
    "\x40\x41\x42\x43\x44\x45\x46\x47\x48\x49\x4a\x4b\x4c\x4d\x4e\x4f",
    "\x50\x51\x52\x53\x54\x55\x56\x57\x58\x59\x5a\x5b\x5c\x5d\x5e\x5f",
    "\x60\x61\x62\x63\x64\x65\x66\x67\x68\x69\x6a\x6b\x6c\x6d\x6e\x6f",
    "\x70\x71\x72\x73\x74\x75\x76\x77\x78\x79\x7a\x7b\x7c\x7d\x7e\x7f",
    "\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8a\x8b\x8c\x8d\x8e\x8f",
    "\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9a\x9b\x9c\x9d\x9e\x9f",
    "\xa0\xa1\xa2\xa3\xa4\xa5\xa6\xa7\xa8\xa9\xaa\xab\xac\xad\xae\xaf",
    "\xb0\xb1\xb2\xb3\xb4\xb5\xb6\xb7\xb8\xb9\xba\xbb\xbc\xbd\xbe\xbf",
    "\xc0\xc1\xc2\xc3\xc4\xc5\xc6\xc7\xc8\xc9\xca\xcb\xcc\xcd\xce\xcf",
    "\xd0\xd1\xd2\xd3\xd4\xd5\xd6\xd7\xd8\xd9\xda\xdb\xdc\xdd\xde\xdf",
    "\xe0\xe1\xe2\xe3\xe4\xe5\xe6\xe7\xe8\xe9\xea\xeb\xec\xed\xee\xef",
    "\xf0\xf1\xf2\xf3\xf4\xf5\xf6\xf7\xf8\xf9\xfa\xfb\xfc\xfd\xfe\xff",
].join("");

const PUA_CHARS = "\ue000\ue001\uf8fe\uf8ff";

const MULTI_LINE_STRING =`"You know," said Arthur, "it's at times like this, when I'm trapped in a Vogon airlock with a man from Betelgeuse, and about to die of asphyxiation in deep space that I really wish I'd listened to what my mother told me when I was young."
"Why, what did she tell you?"
"I don't know, I didn't listen."`;

const SELECTABLE_STRING = `ONE
two
ONE
three
ONE
four
ONE`;

// Descriptions for named control characters
const CONTROL_CHAR_NAMES = {
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

module.exports = {
    before: browser => {
        browser
            .resizeWindow(1280, 800)
            .url(browser.launchUrl)
            .useCss()
            .waitForElementNotPresent("#preloader", 10000)
            .click("#auto-bake-label");
    },

    "CodeMirror has loaded correctly": browser => {
        /* Editor has initialised */
        browser
            .useCss()
            // Input
            .waitForElementVisible("#input-text")
            .waitForElementVisible("#input-text .cm-editor")
            .waitForElementVisible("#input-text .cm-editor .cm-scroller")
            .waitForElementVisible("#input-text .cm-editor .cm-scroller .cm-content")
            .waitForElementVisible("#input-text .cm-editor .cm-scroller .cm-content .cm-line")
            // Output
            .waitForElementVisible("#output-text")
            .waitForElementVisible("#output-text .cm-editor")
            .waitForElementVisible("#output-text .cm-editor .cm-scroller")
            .waitForElementVisible("#output-text .cm-editor .cm-scroller .cm-content")
            .waitForElementVisible("#output-text .cm-editor .cm-scroller .cm-content .cm-line");

        /* Status bar is showing and has correct values */
        browser // Input
            .waitForElementVisible("#input-text .cm-status-bar")
            .waitForElementVisible("#input-text .cm-status-bar .stats-length-value")
            .expect.element("#input-text .cm-status-bar .stats-length-value").text.to.equal("0");
        browser.waitForElementVisible("#input-text .cm-status-bar .stats-lines-value")
            .expect.element("#input-text .cm-status-bar .stats-lines-value").text.to.equal("1");
        browser.waitForElementVisible("#input-text .cm-status-bar .chr-enc-value")
            .expect.element("#input-text .cm-status-bar .chr-enc-value").text.to.equal("Raw Bytes");
        browser.waitForElementVisible("#input-text .cm-status-bar .eol-value")
            .expect.element("#input-text .cm-status-bar .eol-value").text.to.equal("LF");

        browser // Output
            .waitForElementVisible("#output-text .cm-status-bar")
            .waitForElementVisible("#output-text .cm-status-bar .stats-length-value")
            .expect.element("#output-text .cm-status-bar .stats-length-value").text.to.equal("0");
        browser.waitForElementVisible("#output-text .cm-status-bar .stats-lines-value")
            .expect.element("#output-text .cm-status-bar .stats-lines-value").text.to.equal("1");
        browser.waitForElementVisible("#output-text .cm-status-bar .baking-time-info")
            .expect.element("#output-text .cm-status-bar .baking-time-info").text.to.contain("ms");
        browser.waitForElementVisible("#output-text .cm-status-bar .chr-enc-value")
            .expect.element("#output-text .cm-status-bar .chr-enc-value").text.to.equal("Raw Bytes");
        browser.waitForElementVisible("#output-text .cm-status-bar .eol-value")
            .expect.element("#output-text .cm-status-bar .eol-value").text.to.equal("LF");
    },

    "Adding content": browser => {
        /* Status bar updates correctly */
        utils.setInput(browser, MULTI_LINE_STRING);

        browser.expect.element("#input-text .cm-status-bar .stats-length-value").text.to.equal("301");
        browser.expect.element("#input-text .cm-status-bar .stats-lines-value").text.to.equal("3");
        browser.expect.element("#input-text .cm-status-bar .chr-enc-value").text.to.equal("Raw Bytes");
        browser.expect.element("#input-text .cm-status-bar .eol-value").text.to.equal("LF");

        browser.expect.element("#output-text .cm-status-bar .stats-length-value").text.to.equal("0");
        browser.expect.element("#output-text .cm-status-bar .stats-lines-value").text.to.equal("1");
        browser.expect.element("#output-text .cm-status-bar .baking-time-info").text.to.contain("ms");
        browser.expect.element("#output-text .cm-status-bar .chr-enc-value").text.to.equal("Raw Bytes");
        browser.expect.element("#output-text .cm-status-bar .eol-value").text.to.equal("LF");

        /* Output updates correctly */
        utils.bake(browser);
        browser.expect.element("#output-text .cm-status-bar .stats-length-value").text.to.equal("301");
        browser.expect.element("#output-text .cm-status-bar .stats-lines-value").text.to.equal("3");
        browser.expect.element("#output-text .cm-status-bar .baking-time-info").text.to.contain("ms");
        browser.expect.element("#output-text .cm-status-bar .chr-enc-value").text.to.equal("Raw Bytes");
        browser.expect.element("#output-text .cm-status-bar .eol-value").text.to.equal("LF");
    },

    "Autobaking the latest input": browser => {
        // Use the sleep recipe to simulate a long running task
        utils.loadRecipe(browser, "Sleep", "input", [2000]);

        browser.waitForElementVisible("#stale-indicator");

        browser.expect.element("#auto-bake").to.not.be.selected;

        // Enable previously disabled autobake
        browser.click("#auto-bake-label");

        browser.waitUntil(() => {
            return browser.expect.element("#auto-bake").to.be.selected;
        }, 1000);

        browser.sendKeys("#input-text .cm-content", "1");

        browser.waitForElementVisible("#output-loader");

        browser.pause(500);

        // Make another change while the previous input is being baked
        browser.sendKeys("#input-text .cm-content", "2");

        browser
            .waitForElementNotVisible("#stale-indicator")
            .waitForElementNotVisible("#output-loader");

        // Ensure we got the latest input baked
        utils.expectOutput(browser, "input12");

        // Turn autobake off again
        browser.click("#auto-bake-label");
    },

    "Special content": browser => {
        /* Special characters are rendered correctly */
        utils.setInput(browser, SPECIAL_CHARS, false);

        // First line
        for (let i = 0x0; i <= 0x8; i++) {
            browser.expect.element(`#input-text .cm-line:nth-of-type(1) .cm-specialChar:nth-of-type(${i+1})`)
                .to.have.property("title").equals(`Control character ${CONTROL_CHAR_NAMES[i] || "0x" + i.toString(16)}`);
            browser.expect.element(`#input-text .cm-line:nth-of-type(1) .cm-specialChar:nth-of-type(${i+1})`)
                .text.to.equal(String.fromCharCode(0x2400 + i));
        }

        // Tab \u0009
        browser.expect.element(`#input-text .cm-line:nth-of-type(1)`).to.have.property("textContent").match(/\u0009$/);

        // Line feed \u000a
        browser.expect.element(`#input-text .cm-line:nth-of-type(1)`).to.have.property("textContent").match(/^.{10}$/);
        browser.expect.element("#input-text .cm-status-bar .stats-lines-value").text.to.equal("2");

        // Second line
        for (let i = 0x0b; i < SPECIAL_CHARS.length; i++) {
            const index = SPECIAL_CHARS.charCodeAt(i);
            const name = CONTROL_CHAR_NAMES[index] || "0x" + index.toString(16);
            const value = index >= 32 ? "\u2022" : String.fromCharCode(0x2400 + index);

            browser.expect.element(`#input-text .cm-line:nth-of-type(2) .cm-specialChar:nth-of-type(${i-10})`)
                .to.have.property("title").equals(`Control character ${name}`);
            browser.expect.element(`#input-text .cm-line:nth-of-type(2) .cm-specialChar:nth-of-type(${i-10})`)
                .text.to.equal(value);
        }

        /* Output renders correctly */
        utils.setChrEnc(browser, "output", "UTF-8");
        utils.bake(browser);

        // First line
        for (let i = 0x0; i <= 0x8; i++) {
            browser.expect.element(`#output-text .cm-line:nth-of-type(1) .cm-specialChar:nth-of-type(${i+1})`)
                .to.have.property("title").equals(`Control character ${CONTROL_CHAR_NAMES[i] || "0x" + i.toString(16)}`);
            browser.expect.element(`#output-text .cm-line:nth-of-type(1) .cm-specialChar:nth-of-type(${i+1})`)
                .text.to.equal(String.fromCharCode(0x2400 + i));
        }

        // Tab \u0009
        browser.expect.element(`#output-text .cm-line:nth-of-type(1)`).to.have.property("textContent").match(/\u0009$/);

        // Line feed \u000a
        browser.expect.element(`#output-text .cm-line:nth-of-type(1)`).to.have.property("textContent").match(/^.{10}$/);
        browser.expect.element("#output-text .cm-status-bar .stats-lines-value").text.to.equal("2");

        // Second line
        for (let i = 0x0b; i < SPECIAL_CHARS.length; i++) {
            const index = SPECIAL_CHARS.charCodeAt(i);
            const name = CONTROL_CHAR_NAMES[index] || "0x" + index.toString(16);
            const value = index >= 32 ? "\u2022" : String.fromCharCode(0x2400 + index);

            browser.expect.element(`#output-text .cm-content .cm-line:nth-of-type(2) .cm-specialChar:nth-of-type(${i-10})`)
                .to.have.property("title").equals(`Control character ${name}`);
            browser.expect.element(`#output-text .cm-content .cm-line:nth-of-type(2) .cm-specialChar:nth-of-type(${i-10})`)
                .text.to.equal(value);
        }

        /* Bytes are rendered correctly */
        utils.setInput(browser, ALL_BYTES, false);
        // Expect length to be 255, since one character is creating a newline
        browser.expect.element(`#input-text .cm-content`).to.have.property("textContent").match(/^.{255}$/);
        browser.expect.element("#input-text .cm-status-bar .stats-length-value").text.to.equal("256");
        browser.expect.element("#input-text .cm-status-bar .stats-lines-value").text.to.equal("2");


        /* PUA \ue000-\uf8ff */
        utils.setInput(browser, PUA_CHARS, false);
        utils.setChrEnc(browser, "output", "UTF-8");
        utils.bake(browser);

        // Confirm input and output as expected
        /*  In order to render whitespace characters as control character pictures in the output, even
            when they are the designated line separator, CyberChef sometimes chooses to represent them
            internally using the Unicode Private Use Area (https://en.wikipedia.org/wiki/Private_Use_Areas).
            See `Utils.escapeWhitespace()` for an example of this.
            Therefore, PUA characters should be rendered normally in the Input but as control character
            pictures in the output.
        */
        browser.expect.element(`#input-text .cm-content`).to.have.property("textContent").match(/^\ue000\ue001\uf8fe\uf8ff$/);
        browser.expect.element(`#output-text .cm-content`).to.have.property("textContent").match(/^\u2400\u2401\u3cfe\u3cff$/);

        /* Can be copied */
        utils.setInput(browser, SPECIAL_CHARS, false);
        utils.setChrEnc(browser, "output", "UTF-8");
        utils.bake(browser);

        // Manual copy
        browser
            .doubleClick("#output-text .cm-content .cm-line:nth-of-type(1) .cm-specialChar:nth-of-type(1)")
            .waitForElementVisible("#output-text .cm-selectionBackground");
        utils.copy(browser);
        utils.paste(browser, "#search"); // Paste into search box as this won't mess with the values

        // Ensure that the values are as expected
        browser.expect.element("#search").to.have.value.that.equals("\u0000\u0001\u0002\u0003\u0004\u0005\u0006\u0007\u0008");
        browser.clearValue("#search");

        // Raw copy
        browser
            .click("#copy-output")
            .pause(100);
        utils.paste(browser, "#search"); // Paste into search box as this won't mess with the values

        // Ensure that the values are as expected
        browser.expect.element("#search").to.have.value.that.matches(/^\u0000\u0001\u0002\u0003\u0004\u0005\u0006\u0007\u0008\u0009/);
        browser.clearValue("#search");
    },

    "HTML output": browser => {
        /* Displays correctly */
        utils.loadRecipe(browser, "Entropy", ALL_BYTES);
        utils.bake(browser);

        browser
            .waitForElementVisible("#output-html")
            .waitForElementVisible("#output-html #chart-area");

        /* Status bar widgets are disabled */
        browser.expect.element("#output-text .cm-status-bar .disabled .stats-length-value").to.be.visible;
        browser.expect.element("#output-text .cm-status-bar .disabled .stats-lines-value").to.be.visible;
        browser.expect.element("#output-text .cm-status-bar .disabled .chr-enc-value").to.be.visible;
        browser.expect.element("#output-text .cm-status-bar .disabled .eol-value").to.be.visible;

        /* Displays special chars correctly */
        utils.loadRecipe(browser, "To Table", ",\u0000\u0001\u0002\u0003\u0004", [",", "\\r\\n", false, "HTML"]);
        utils.bake(browser);

        for (let i = 0x0; i <= 0x4; i++) {
            browser.expect.element(`#output-html .cm-specialChar:nth-of-type(${i+1})`)
                .to.have.property("title").equals(`Control character ${CONTROL_CHAR_NAMES[i] || "0x" + i.toString(16)}`);
            browser.expect.element(`#output-html .cm-specialChar:nth-of-type(${i+1})`)
                .text.to.equal(String.fromCharCode(0x2400 + i));
        }

        /* Can be copied */
        // Raw copy
        browser
            .click("#copy-output")
            .pause(100);
        utils.paste(browser, "#search"); // Paste into search box as this won't mess with the values

        // Ensure that the values are as expected
        browser.expect.element("#search").to.have.value.that.matches(/\u0000\u0001\u0002\u0003\u0004/);
        browser.clearValue("#search");
    },

    "Highlighting": browser => {
        utils.setInput(browser, SELECTABLE_STRING);
        utils.bake(browser);

        /* Selecting input text also selects other instances in input and output */
        browser // Input
            .click("#auto-bake-label")
            .doubleClick("#input-text .cm-content .cm-line:nth-of-type(1)")
            .waitForElementVisible("#input-text .cm-selectionLayer .cm-selectionBackground")
            .waitForElementNotPresent("#input-text .cm-content .cm-line:nth-of-type(1) .cm-selectionMatch")
            .waitForElementNotPresent("#input-text .cm-content .cm-line:nth-of-type(2) .cm-selectionMatch")
            .waitForElementVisible("#input-text .cm-content .cm-line:nth-of-type(3) .cm-selectionMatch")
            .waitForElementNotPresent("#input-text .cm-content .cm-line:nth-of-type(4) .cm-selectionMatch")
            .waitForElementVisible("#input-text .cm-content .cm-line:nth-of-type(5) .cm-selectionMatch")
            .waitForElementNotPresent("#input-text .cm-content .cm-line:nth-of-type(6) .cm-selectionMatch")
            .waitForElementVisible("#input-text .cm-content .cm-line:nth-of-type(7) .cm-selectionMatch");

        browser // Output
            .waitForElementVisible("#output-text .cm-selectionLayer .cm-selectionBackground")
            .waitForElementNotPresent("#output-text .cm-content .cm-line:nth-of-type(1) .cm-selectionMatch")
            .waitForElementNotPresent("#output-text .cm-content .cm-line:nth-of-type(2) .cm-selectionMatch")
            .waitForElementVisible("#output-text .cm-content .cm-line:nth-of-type(3) .cm-selectionMatch")
            .waitForElementNotPresent("#output-text .cm-content .cm-line:nth-of-type(4) .cm-selectionMatch")
            .waitForElementVisible("#output-text .cm-content .cm-line:nth-of-type(5) .cm-selectionMatch")
            .waitForElementNotPresent("#output-text .cm-content .cm-line:nth-of-type(6) .cm-selectionMatch")
            .waitForElementVisible("#output-text .cm-content .cm-line:nth-of-type(7) .cm-selectionMatch");

        /* Selecting output text highlights in input */
        browser // Output
            .click("#output-text")
            .waitForElementNotPresent("#input-text .cm-selectionLayer .cm-selectionBackground")
            .waitForElementNotPresent("#output-text .cm-selectionLayer .cm-selectionBackground")
            .waitForElementNotPresent("#input-text .cm-content .cm-line .cm-selectionMatch")
            .waitForElementNotPresent("#output-text .cm-content .cm-line .cm-selectionMatch")
            .doubleClick("#output-text .cm-content .cm-line:nth-of-type(7)")
            .waitForElementVisible("#output-text .cm-selectionLayer .cm-selectionBackground")
            .waitForElementVisible("#output-text .cm-content .cm-line:nth-of-type(1) .cm-selectionMatch")
            .waitForElementNotPresent("#output-text .cm-content .cm-line:nth-of-type(2) .cm-selectionMatch")
            .waitForElementVisible("#output-text .cm-content .cm-line:nth-of-type(3) .cm-selectionMatch")
            .waitForElementNotPresent("#output-text .cm-content .cm-line:nth-of-type(4) .cm-selectionMatch")
            .waitForElementVisible("#output-text .cm-content .cm-line:nth-of-type(5) .cm-selectionMatch")
            .waitForElementNotPresent("#output-text .cm-content .cm-line:nth-of-type(6) .cm-selectionMatch")
            .waitForElementNotPresent("#output-text .cm-content .cm-line:nth-of-type(7) .cm-selectionMatch");

        browser // Input
            .waitForElementVisible("#input-text .cm-selectionLayer .cm-selectionBackground")
            .waitForElementVisible("#input-text .cm-content .cm-line:nth-of-type(1) .cm-selectionMatch")
            .waitForElementNotPresent("#input-text .cm-content .cm-line:nth-of-type(2) .cm-selectionMatch")
            .waitForElementVisible("#input-text .cm-content .cm-line:nth-of-type(3) .cm-selectionMatch")
            .waitForElementNotPresent("#input-text .cm-content .cm-line:nth-of-type(4) .cm-selectionMatch")
            .waitForElementVisible("#input-text .cm-content .cm-line:nth-of-type(5) .cm-selectionMatch")
            .waitForElementNotPresent("#input-text .cm-content .cm-line:nth-of-type(6) .cm-selectionMatch")
            .waitForElementNotPresent("#input-text .cm-content .cm-line:nth-of-type(7) .cm-selectionMatch");

        // Turn autobake off again
        browser.click("#auto-bake-label");
    },

    "Character encoding": browser => {
        const CHINESE_CHARS = "不要恐慌。";
        /* Dropup works */
        /* Selecting changes output correctly */
        utils.setInput(browser, CHINESE_CHARS, false);
        utils.setChrEnc(browser, "input", "UTF-8");
        utils.bake(browser);

        /* Output encoding should be autodetected */
        browser
            .waitForElementVisible("#snackbar-container .snackbar-content", 5000)
            .expect.element("#snackbar-container .snackbar-content").text.to.equal("Output character encoding has been detected and changed to UTF-8");

        utils.expectOutput(browser, CHINESE_CHARS);

        /* Change the output encoding manually to test for URL presence */
        utils.setChrEnc(browser, "output", "UTF-8");

        /* Encodings appear in the URL */
        browser.assert.urlContains("ienc=65001");
        browser.assert.urlContains("oenc=65001");

        /* Preserved when changing tabs */
        browser
            .click("#btn-new-tab")
            .waitForElementVisible("#input-tabs li:nth-of-type(2).active-input-tab");
        browser.expect.element("#input-text .chr-enc-value").text.that.equals("Raw Bytes");
        browser.expect.element("#output-text .chr-enc-value").text.that.equals("Raw Bytes");

        utils.setChrEnc(browser, "input", "UTF-7");
        utils.setChrEnc(browser, "output", "UTF-7");

        browser
            .click("#input-tabs li:nth-of-type(1)")
            .waitForElementVisible("#input-tabs li:nth-of-type(1).active-input-tab");
        browser.expect.element("#input-text .chr-enc-value").text.that.equals("UTF-8");
        browser.expect.element("#output-text .chr-enc-value").text.that.equals("UTF-8");

        /* Try various encodings */
        // These are not meant to be realistic encodings for this data
        utils.setInput(browser, CHINESE_CHARS, false);
        utils.setChrEnc(browser, "input", "UTF-8");
        utils.setChrEnc(browser, "output", "UTF-16LE");
        utils.bake(browser);
        utils.expectOutput(browser, "\uB8E4\uE88D\u81A6\u81E6\uE690\u8C85\u80E3");

        utils.setChrEnc(browser, "output", "Simplified Chinese GBK");
        utils.bake(browser);
        utils.expectOutput(browser, "\u6D93\u5D88\uFDFF\u93AD\u612D\u53A1\u9286\u0000");

        utils.setChrEnc(browser, "input", "UTF-7");
        utils.bake(browser);
        utils.expectOutput(browser, "+Tg0-+iYE-+YFA-+YUw-");

        utils.setChrEnc(browser, "input", "Traditional Chinese Big5");
        utils.bake(browser);
        utils.expectOutput(browser, "\u3043\u74B6\uFDFF\u7A3A\uFDFF");

        utils.setChrEnc(browser, "output", "Windows-1251 Cyrillic");
        utils.bake(browser);
        utils.expectOutput(browser, "\u00A4\u0408\u00ADn\u00AE\u0408\u00B7W\u040EC");
    },

    "Line endings": browser => {
        /* Dropup works */
        /* Selecting changes view in input */
        utils.setInput(browser, MULTI_LINE_STRING);

        // Line endings: LF

        // Input
        browser
            .waitForElementPresent("#input-text .cm-content .cm-line:nth-of-type(3)")
            .waitForElementNotPresent("#input-text .cm-content .cm-line:nth-of-type(4)")
            .waitForElementNotPresent("#input-text .cm-content .cm-specialChar");
        browser.expect.element("#input-text .cm-status-bar .stats-length-value").text.to.equal("301");
        browser.expect.element("#input-text .cm-status-bar .stats-lines-value").text.to.equal("3");

        // Output
        utils.bake(browser);
        browser
            .waitForElementPresent("#output-text .cm-content .cm-line:nth-of-type(3)")
            .waitForElementNotPresent("#output-text .cm-content .cm-line:nth-of-type(4)")
            .waitForElementNotPresent("#output-text .cm-content .cm-specialChar");
        browser.expect.element("#output-text .cm-status-bar .stats-length-value").text.to.equal("301");
        browser.expect.element("#output-text .cm-status-bar .stats-lines-value").text.to.equal("3");

        // Input EOL: VT
        utils.setEOLSeq(browser, "input", "VT");

        // Input
        browser
            .waitForElementPresent("#input-text .cm-content .cm-line:nth-of-type(1)")
            .waitForElementNotPresent("#input-text .cm-content .cm-line:nth-of-type(2)")
            .waitForElementPresent("#input-text .cm-content .cm-specialChar");
        browser.expect.element("#input-text .cm-content .cm-specialChar").text.to.equal("␊");
        browser.expect.element("#input-text .cm-status-bar .stats-length-value").text.to.equal("301");
        browser.expect.element("#input-text .cm-status-bar .stats-lines-value").text.to.equal("1");

        // Output
        utils.bake(browser);
        browser
            .waitForElementPresent("#output-text .cm-content .cm-line:nth-of-type(3)")
            .waitForElementNotPresent("#output-text .cm-content .cm-line:nth-of-type(4)")
            .waitForElementNotPresent("#output-text .cm-content .cm-specialChar");
        browser.expect.element("#output-text .cm-status-bar .stats-length-value").text.to.equal("301");
        browser.expect.element("#output-text .cm-status-bar .stats-lines-value").text.to.equal("3");

        // Output EOL: VT
        utils.setEOLSeq(browser, "output", "VT");

        // Input
        browser
            .waitForElementPresent("#input-text .cm-content .cm-line:nth-of-type(1)")
            .waitForElementNotPresent("#input-text .cm-content .cm-line:nth-of-type(2)")
            .waitForElementPresent("#input-text .cm-content .cm-specialChar");
        browser.expect.element("#input-text .cm-content .cm-specialChar").text.to.equal("␊");
        browser.expect.element("#input-text .cm-status-bar .stats-length-value").text.to.equal("301");
        browser.expect.element("#input-text .cm-status-bar .stats-lines-value").text.to.equal("1");

        // Output
        browser
            .waitForElementPresent("#output-text .cm-content .cm-line:nth-of-type(1)")
            .waitForElementNotPresent("#output-text .cm-content .cm-line:nth-of-type(2)")
            .waitForElementPresent("#output-text .cm-content .cm-specialChar");
        browser.expect.element("#output-text .cm-content .cm-specialChar").text.to.equal("␊");
        browser.expect.element("#output-text .cm-status-bar .stats-length-value").text.to.equal("301");
        browser.expect.element("#output-text .cm-status-bar .stats-lines-value").text.to.equal("1");

        /* Adding new line ending changes output correctly */
        browser.sendKeys("#input-text .cm-content", browser.Keys.RETURN);

        // Input
        browser
            .waitForElementPresent("#input-text .cm-content .cm-line:nth-of-type(2)")
            .waitForElementNotPresent("#input-text .cm-content .cm-line:nth-of-type(3)");
        browser.expect.element("#input-text .cm-status-bar .stats-length-value").text.to.equal("302");
        browser.expect.element("#input-text .cm-status-bar .stats-lines-value").text.to.equal("2");

        // Output
        utils.bake(browser);
        browser
            .waitForElementPresent("#output-text .cm-content .cm-line:nth-of-type(2)")
            .waitForElementNotPresent("#output-text .cm-content .cm-line:nth-of-type(3)");
        browser.expect.element("#output-text .cm-status-bar .stats-length-value").text.to.equal("302");
        browser.expect.element("#output-text .cm-status-bar .stats-lines-value").text.to.equal("2");

        // Input EOL: CRLF
        utils.setEOLSeq(browser, "input", "CRLF");
        // Output EOL: CR
        utils.setEOLSeq(browser, "output", "CR");
        browser.sendKeys("#input-text .cm-content", browser.Keys.RETURN);

        // Input
        browser
            .waitForElementPresent("#input-text .cm-content .cm-line:nth-of-type(2)")
            .waitForElementNotPresent("#input-text .cm-content .cm-line:nth-of-type(3)")
            .waitForElementPresent("#input-text .cm-content .cm-line:nth-of-type(1) .cm-specialChar:nth-of-type(3)");
        browser.expect.element("#input-text .cm-content .cm-line:nth-of-type(1) .cm-specialChar:nth-of-type(3)").text.to.equal("␋");
        browser.expect.element("#input-text .cm-status-bar .stats-length-value").text.to.equal("304");
        browser.expect.element("#input-text .cm-status-bar .stats-lines-value").text.to.equal("2");

        // Output
        utils.bake(browser);
        browser
            .waitForElementPresent("#output-text .cm-content .cm-line:nth-of-type(2)")
            .waitForElementNotPresent("#output-text .cm-content .cm-line:nth-of-type(3)")
            .waitForElementPresent("#output-text .cm-content .cm-line:nth-of-type(2) .cm-specialChar");
        browser.expect.element("#output-text .cm-content .cm-line:nth-of-type(2) .cm-specialChar").text.to.equal("␊");
        browser.expect.element("#output-text .cm-status-bar .stats-length-value").text.to.equal("304");
        browser.expect.element("#output-text .cm-status-bar .stats-lines-value").text.to.equal("2");

        /* Line endings appear in the URL */
        browser.assert.urlContains("ieol=CRLF");
        browser.assert.urlContains("oeol=CR");

        /* Preserved when changing tabs */
        browser
            .click("#btn-new-tab")
            .waitForElementVisible("#input-tabs li:nth-of-type(2).active-input-tab");
        browser.expect.element("#input-text .eol-value").text.that.equals("LF");
        browser.expect.element("#output-text .eol-value").text.that.equals("LF");

        utils.setEOLSeq(browser, "input", "FF");
        utils.setEOLSeq(browser, "output", "LS");

        browser
            .click("#input-tabs li:nth-of-type(1)")
            .waitForElementVisible("#input-tabs li:nth-of-type(1).active-input-tab");
        browser.expect.element("#input-text .eol-value").text.that.equals("CRLF");
        browser.expect.element("#output-text .eol-value").text.that.equals("CR");
    },

    "File inputs": browser => {
        utils.clear(browser);

        /* Side panel displays correct info */
        utils.uploadFile(browser, "files/TowelDay.jpeg");

        browser
            .waitForElementVisible("#input-text .cm-file-details")
            .waitForElementVisible("#input-text .cm-file-details .file-details-toggle-shown")
            .waitForElementVisible("#input-text .cm-file-details .file-details-thumbnail")
            .waitForElementVisible("#input-text .cm-file-details .file-details-name")
            .waitForElementVisible("#input-text .cm-file-details .file-details-size")
            .waitForElementVisible("#input-text .cm-file-details .file-details-type")
            .waitForElementVisible("#input-text .cm-file-details .file-details-loaded");
        browser.expect.element("#input-text .cm-file-details .file-details-name").text.that.equals("TowelDay.jpeg");
        browser.expect.element("#input-text .cm-file-details .file-details-size").text.that.equals("61,379 bytes");
        browser.expect.element("#input-text .cm-file-details .file-details-type").text.that.equals("image/jpeg");
        browser.expect.element("#input-text .cm-file-details .file-details-loaded").text.that.equals("100%");

        /* Side panel can be hidden */
        browser
            .click("#input-text .cm-file-details .file-details-toggle-shown")
            .waitForElementNotPresent("#input-text .cm-file-details .file-details-toggle-shown")
            .waitForElementVisible("#input-text .cm-file-details .file-details-toggle-hidden")
            .expect.element("#input-text .cm-file-details").to.have.css("width").which.equals("1px");

        browser
            .click("#input-text .cm-file-details .file-details-toggle-hidden")
            .waitForElementNotPresent("#input-text .cm-file-details .file-details-toggle-hidden")
            .waitForElementVisible("#input-text .cm-file-details .file-details-toggle-shown")
            .expect.element("#input-text .cm-file-details").to.have.css("width").which.equals("200px");
    },

    "Folder inputs": browser => {
        utils.clear(browser);

        /* Side panel displays correct info */
        utils.uploadFolder(browser, "files");

        // Loop through tabs
        for (let i = 1; i < 3; i++) {
            browser
                .click(`#input-tabs li:nth-of-type(${i})`)
                .waitForElementVisible(`#input-tabs li:nth-of-type(${i}).active-input-tab`);

            browser
                .waitForElementVisible("#input-text .cm-file-details")
                .waitForElementVisible("#input-text .cm-file-details .file-details-toggle-shown")
                .waitForElementVisible("#input-text .cm-file-details .file-details-thumbnail")
                .waitForElementVisible("#input-text .cm-file-details .file-details-name")
                .waitForElementVisible("#input-text .cm-file-details .file-details-size")
                .waitForElementVisible("#input-text .cm-file-details .file-details-type")
                .waitForElementVisible("#input-text .cm-file-details .file-details-loaded");

            browser.getText("#input-text .cm-file-details .file-details-name", function(result) {
                switch (result.value) {
                    case "TowelDay.jpeg":
                        browser.expect.element("#input-text .cm-file-details .file-details-name").text.that.equals("TowelDay.jpeg");
                        browser.expect.element("#input-text .cm-file-details .file-details-size").text.that.equals("61,379 bytes");
                        browser.expect.element("#input-text .cm-file-details .file-details-type").text.that.equals("image/jpeg");
                        browser.expect.element("#input-text .cm-file-details .file-details-loaded").text.that.equals("100%");
                        break;
                    case "Hitchhikers_Guide.jpeg":
                        browser.expect.element("#input-text .cm-file-details .file-details-name").text.that.equals("Hitchhikers_Guide.jpeg");
                        browser.expect.element("#input-text .cm-file-details .file-details-size").text.that.equals("36,595 bytes");
                        browser.expect.element("#input-text .cm-file-details .file-details-type").text.that.equals("image/jpeg");
                        browser.expect.element("#input-text .cm-file-details .file-details-loaded").text.that.equals("100%");
                        break;
                    default:
                        break;
                }
            });
        }
    },

    "Loading from URL": browser => {
        utils.clear(browser);

        /* Side panel displays correct info */
        utils.uploadFile(browser, "files/TowelDay.jpeg");

        browser
            .waitForElementVisible("#input-text .cm-file-details")
            .waitForElementVisible("#input-text .cm-file-details .file-details-toggle-shown")
            .waitForElementVisible("#input-text .cm-file-details .file-details-thumbnail")
            .waitForElementVisible("#input-text .cm-file-details .file-details-name")
            .waitForElementVisible("#input-text .cm-file-details .file-details-size")
            .waitForElementVisible("#input-text .cm-file-details .file-details-type")
            .waitForElementVisible("#input-text .cm-file-details .file-details-loaded");

        /* Complex deep link populates the input correctly (encoding, eol, input) */
        browser
            .urlHash("recipe=To_Base64('A-Za-z0-9%2B/%3D')&input=VGhlIHNoaXBzIGh1bmcgaW4gdGhlIHNreSBpbiBtdWNoIHRoZSBzYW1lIHdheSB0aGF0IGJyaWNrcyBkb24ndC4M&ienc=21866&oenc=1201&ieol=FF&oeol=PS")
            .waitForElementVisible("#rec-list li.operation");

        browser.expect.element(`#input-text .cm-content`).to.have.property("textContent").match(/^.{65}$/);
        browser.expect.element("#input-text .cm-status-bar .stats-length-value").text.to.equal("66");
        browser.expect.element("#input-text .cm-status-bar .stats-lines-value").text.to.equal("2");

        browser.expect.element("#input-text .chr-enc-value").text.that.equals("KOI8-U Ukrainian Cyrillic");
        browser.expect.element("#output-text .chr-enc-value").text.that.equals("UTF-16BE");

        browser.expect.element("#input-text .eol-value").text.that.equals("FF");
        browser.expect.element("#output-text .eol-value").text.that.equals("PS");

        utils.bake(browser);

        browser.expect.element(`#output-text .cm-content`).to.have.property("textContent").match(/^.{44}$/);
        browser.expect.element("#output-text .cm-status-bar .stats-length-value").text.to.equal("44");
        browser.expect.element("#output-text .cm-status-bar .stats-lines-value").text.to.equal("1");
    },

    "Replace input with output": browser => {
        /* Input is correctly populated */
        utils.loadRecipe(browser, "XOR", "The ships hung in the sky in much the same way that bricks don't.", [{ "option": "Hex", "string": "65" }, "Standard", false]);
        utils.setChrEnc(browser, "input", "UTF-32LE");
        utils.setChrEnc(browser, "output", "UTF-7");
        utils.setEOLSeq(browser, "input", "CRLF");
        utils.setEOLSeq(browser, "output", "LS");

        browser
            .sendKeys("#input-text .cm-content", browser.Keys.RETURN)
            .expect.element("#input-text .cm-status-bar .stats-lines-value").text.to.equal("2");
        utils.bake(browser);

        browser.expect.element("#input-text .cm-status-bar .stats-length-value").text.to.equal("67");
        browser.expect.element("#input-text .cm-status-bar .stats-lines-value").text.to.equal("2");
        browser.expect.element("#input-text .chr-enc-value").text.that.equals("UTF-32LE");
        browser.expect.element("#input-text .eol-value").text.that.equals("CRLF");
        browser.expect.element("#output-text .cm-status-bar .stats-length-value").text.to.equal("268");

        browser
            .click("#switch")
            .waitForElementVisible("#stale-indicator");

        browser.expect.element("#input-text .cm-status-bar .stats-length-value").text.to.equal("268");

        /* Special characters, encodings and line endings all as expected */
        browser.expect.element("#input-text .cm-status-bar .stats-lines-value").text.to.equal("1");
        browser.expect.element("#input-text .chr-enc-value").text.that.equals("UTF-7");
        browser.expect.element("#input-text .eol-value").text.that.equals("LS");
        browser.expect.element("#input-text .cm-line:nth-of-type(1) .cm-specialChar:nth-of-type(1)").text.to.equal("␍");
        browser.expect.element("#input-text .cm-line:nth-of-type(1) .cm-specialChar:nth-of-type(49)").text.to.equal("␑");
        browser.waitForElementNotPresent("#input-text .cm-line:nth-of-type(1) .cm-specialChar:nth-of-type(50)");
    },


    after: browser => {
        browser.end();
    }
};
