/**
 * Custom error type for handling operation input errors.
 * i.e. where the operation can handle the error and print a message to the screen.
 *
 * @author d98762625 [d98762625@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */
class OperationError extends Error {
    /**
     * Standard error constructor. Adds no new behaviour.
     *
     * @param args - Standard error args
     */
    constructor(...args) {
        super(...args);

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, OperationError);
        }
    }
}

export default OperationError;
