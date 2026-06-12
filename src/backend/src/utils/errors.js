export default class AppError extends Error {
    constructor(statusCode, message) {
	super(message);
	this.statusCode = statusCode;
	Error.captureStackTrace(this, this.constructor);
    }

    static badRequest(message = "Bad Request") {
	return new AppError(400, message);
    }

    static unauthorized(message = "Unauthorized") {
        return new AppError(401, message);
    }

    static forbidden(message = "Access Denied") {
        return new AppError(403, message);
    }

    static notFound(message = "Resource Not Found") {
        return new AppError(404, message);
    }
}
