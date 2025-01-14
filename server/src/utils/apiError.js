class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong", // Default message if not provided
        errors = [], // Additional details for errors
        stack = "" // Optional custom stack trace
    ) {
        super(message);

        // Capture stack trace automatically if not provided
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }

        this.statusCode = statusCode;
        this.message = message;
        this.success = false;
        this.errors = errors;
    }
}

export { ApiError };
