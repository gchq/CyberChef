/**
 * Flow control functions
 *
 * @author d98762625 [d98762625@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 *
 */

/**
 * Returns the index of a label.
 *
 * @private
 * @param {Object} state
 * @param {string} name - The label name to look for.
 * @returns {number}
 */
export function getLabelIndex(name, state) {
    return state.opList.findIndex((operation) => {
        return (operation.name === "Label") && (name === operation.ingValues[0]);
    });
}
