/**
 * Centralized error handler middleware.
 */
export function errorHandler(err, req, res, next) {
  console.error("[ServerError]", {
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method,
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || "An unexpected internal server error occurred",
    timestamp: new Date().toISOString(),
  });
}
