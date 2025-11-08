/* asyncHandler is a higher-order function that wraps async route handlers, it ensures that any errors inside async functions are automatically caught and passed to Express's `next()` for centralized error handling 
*/
const asyncHandler = (requestHandler) => {
  return async (req, res, next) => {
    try {
      // Execute the actual controller (which may return a promise)
      await Promise.resolve(requestHandler(req, res, next));
    } catch (error) {
      // If any error occurs, forward it to Express's error middleware
      // This avoids writing try-catch blocks in every controller
      next(error);
    }
  };
};

export { asyncHandler };
