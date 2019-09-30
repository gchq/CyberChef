/**
 * Web worker to handle dish conversion operations.
 *
 * @author j433866 [j433866@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Dish from "../../core/Dish.mjs";

self.addEventListener("message", function(e) {
    // Handle message from the main thread
    const r = e.data;
    log.debug(`DishWorker receiving command '${r.action}'`);

    switch (r.action) {
        case "getDishAs":
            getDishAs(r.data);
            break;
        case "getDishTitle":
            getDishTitle(r.data);
            break;
        default:
            log.error(`DishWorker sent invalid action: '${r.action}'`);
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
