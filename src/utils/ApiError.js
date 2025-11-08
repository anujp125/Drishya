// Custom error class for consistent API error handling across the project
class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code (e.g. 400, 404, 500)
   * @param {string} message - Human-readable error message
   * @param {Array|Object} errors - Additional error details (optional)
   * @param {string} stack - Optional stack trace (useful in development)
   */
  constructor(
    statusCode,
    message = "Something went wrong",
    errors = [],
    stack = ""
  ) {
    // Call the parent Error class constructor with the message
    super(message);

    this.statusCode = statusCode;
    this.data = null;
    this.message = message; // Main error message for the client
    this.success = false; // Indicates API call failed (helps in standardized responses)
    this.errors = errors; // Store extra error details (like validation errors)
    // Capture the error stack trace for debugging
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
