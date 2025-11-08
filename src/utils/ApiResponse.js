// Custom response class to standardize all API responses
class ApiResponse {

  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.data = data; // Main response data (can be user object, list, token, etc.)
    this.message = message; // Success Message
    this.success = statusCode < 400; // Success flag based on status code
  }
}

export { ApiResponse };
