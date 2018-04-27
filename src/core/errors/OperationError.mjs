/**
 * Create custom error type for handling operation input errors.
 * i.e. where the operation can handle the error and print a
 * message to the screen.
 */
class OperationError extends Error {
    /**
     * Standard error constructor. Adds no new behaviour.
     * @param args standard error args
     */
    constructor(...args) {
        super(...args);

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, OperationError);
        }
    }
}

export default OperationError;
