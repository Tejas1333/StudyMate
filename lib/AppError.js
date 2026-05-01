import { ERRORS } from "./errorCodes";

export class AppError extends Error {
  constructor(code = "INTERNAL_ERROR", details = null, overrideMessage = null) {
    const config = ERRORS[code] || ERRORS.INTERNAL_ERROR;

    super(overrideMessage || config.message);

    this.code = code;
    this.statusCode = config.statusCode;
    this.details = details;
  }
}