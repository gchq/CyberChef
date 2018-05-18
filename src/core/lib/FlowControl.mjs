/**
 * Returns the index of a label.
 *
 * @private
 * @param {Object} state
 * @param {string} name
 * @returns {number}
 */
export function getLabelIndex(name, state) {
    return state.opList.findIndex((operation) => {
        return (operation.name === "Label") && (name === operation.ingValues[0]);
    });
}
