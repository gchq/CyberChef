/**
 * Web worker to handle dish conversion operations.
 *
 * @author j433866 [j433866@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Dish from "../../core/Dish.mjs";
import DishError from "../../core/errors/DishError.mjs";
import { CHR_ENC_SIMPLE_REVERSE_LOOKUP } from "../../core/lib/ChrEnc.mjs";
import Utils from "../../core/Utils.mjs";
import cptable from "codepage";
import loglevelMessagePrefix from "loglevel-message-prefix";

loglevelMessagePrefix(log, {
    prefixes: [],
    staticPrefixes: ["DishWorker"]
});

self.addEventListener("message", function(e) {
    // Handle message from the main thread
    const r = e.data;
    log.debug(`Receiving command '${r.action}'`);

    switch (r.action) {
        case "getDishAs":
            getDishAs(r.data);
            break;
        case "getDishTitle":
            getDishTitle(r.data);
            break;
        case "bufferToStr":
            bufferToStr(r.data);
            break;
        case "setLogLevel":
            log.setLevel(r.data, false);
            break;
        default:
            log.error(`Unknown action: '${r.action}'`);
    }
});

/**
 * Translates the dish to a given type
 *
 * @param {object} data
 * @param {Dish} data.dish
 * @param {string} data.type
 * @param {number} data.id
 */
async function getDishAs(data) {
    const newDish = new Dish(data.dish),
        value = await newDish.get(data.type),
        transferable = (data.type === "ArrayBuffer") ? [value] : undefined;

    self.postMessage({
        action: "dishReturned",
        data: {
            value: value,
            id: data.id
        }
    }, transferable);
}

/**
 * Gets the title of the given dish
 *
 * @param {object} data
 * @param {Dish} data.dish
 * @param {number} data.id
 * @param {number} data.maxLength
 */
async function getDishTitle(data) {
    const newDish = new Dish(data.dish),
        title = await newDish.getTitle(data.maxLength);

    self.postMessage({
        action: "dishReturned",
        data: {
            value: title,
            id: data.id
        }
    });
}

/**
 * Translates a buffer to a string using a specified encoding
 *
 * @param {object} data
 * @param {ArrayBuffer} data.buffer
 * @param {number} data.id
 * @param {number} data.encoding
 */
async function bufferToStr(data) {
    let str;
    if (data.encoding === 0) {
        str = Utils.arrayBufferToStr(data.buffer);
    } else {
        try {
            str = cptable.utils.decode(data.encoding, new Uint8Array(data.buffer));
        } catch (err) {
            str = new DishError(`Error decoding buffer with encoding ${CHR_ENC_SIMPLE_REVERSE_LOOKUP[data.encoding]}: ${err.message}`).toString();
        }
    }

    self.postMessage({
        action: "dishReturned",
        data: {
            value: str,
            id: data.id
        }
    });
}
