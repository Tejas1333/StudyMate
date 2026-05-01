export const ERRORS = {
  MISSING_FIELDS: { message: "Missing required fields", statusCode: 400 },
  INVALID_BODY: { message: "Invalid request body", statusCode: 400 },
  NOT_FOUND: { message: "Resource not found", statusCode: 404 },
  VALIDATION_ERROR: { message: "Validation failed", statusCode: 400 },
  UNAUTHORIZED: { message: "Unauthorized", statusCode: 401 },
  INTERNAL_ERROR: { message: "Internal Server Error", statusCode: 500 },
};