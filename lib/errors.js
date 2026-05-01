import { AppError } from "./AppError";

export const missingFields = (details) =>
  new AppError("MISSING_FIELDS", details);

export const notFound = (msg) =>
  new AppError("NOT_FOUND", null, msg);

export const badRequest = (msg, details) =>
  new AppError("INVALID_BODY", details, msg);

export const unauthorized = () =>
  new AppError("UNAUTHORIZED");