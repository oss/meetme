export default class AppError extends Error {
  readonly statusCode: number;
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }

  static badRequest(message: string = "Bad Request") {
    return new AppError(400, message);
  }

  static unauthorized(message: string = "Unauthorized") {
    return new AppError(401, message);
  }

  static forbidden(message: string = "Access Denied") {
    return new AppError(403, message);
  }

  static notFound(message: string = "Resource Not Found") {
    return new AppError(404, message);
  }

  static serverError(message: string = "Internal Error") {
    return new AppError(500, message);
  }
}
