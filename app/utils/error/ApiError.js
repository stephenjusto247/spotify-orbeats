// https://en.wikipedia.org/wiki/List_of_HTTP_status_codes

class ApiError {
  constructor(code, message) {
    this.code = code;
    this.message = message;
  }

  static unauthorized(msg) {
    return new ApiError(401, msg);
  }

  static internal(msg) {
    return new ApiError(500, msg);
  }
}
  
module.exports = ApiError;