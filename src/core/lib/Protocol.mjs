/**
 * Protocol parsing functions.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2022
 * @license Apache-2.0
 */

import BigNumber from "bignumber.js";
import {toHexFast} from "../lib/Hex.mjs";

/**
 * Recursively displays a JSON object as an HTML table
 *
 * @param {Object} obj
 * @returns string
 */
export function objToTable(obj, nested=false) {
    let html = `<table
        class='table table-sm table-nonfluid ${nested ? "mb-0 table-borderless" : "table-bordered"}'
        style='table-layout: fixed; ${nested ? "margin: -1px !important;" : ""}'>`;
    if (!nested)
        html += `<tr>
            <th>Field</th>
            <th>Value</th>
        </tr>`;

    for (const key in obj) {
        if (typeof obj[key] === "function")
            continue;

        html += `<tr><td style='word-wrap: break-word'>${key}</td>`;
        if (typeof obj[key] === "object")
            html += `<td style='padding: 0'>${objToTable(obj[key], true)}</td>`;
        else
            html += `<td>${obj[key]}</td>`;
        html += "</tr>";
    }
    html += "</table>";
    return html;
}

/**
 * Converts bytes into a BigNumber string
 * @param {Uint8Array} bs
 * @returns {string}
 */
export function bytesToLargeNumber(bs) {
    return BigNumber(toHexFast(bs), 16).toString();
}
