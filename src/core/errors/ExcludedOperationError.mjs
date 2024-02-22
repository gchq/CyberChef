/**
 * Custom error type for handling operation that isnt included in node.js API
 *
 * @author d98762625 [d98762625@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */
class ExcludedOperationError extends Error {
    /**
     * Standard error constructor. Adds no new behaviour.
     *
     * @param args - Standard error args
     */
    constructor(...args) {
        super(...args);

        this.type = "ExcludedOperationError";

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ExcludedOperationError);
        }
    }
}

export default ExcludedOperationError;
