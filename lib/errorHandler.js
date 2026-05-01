const isDev = process.env.NODE_ENV !== "production";

export const handleError = (err) => {
  console.error("🔥 ERROR FULL:", {
    message: err.message,
    code: err.code,
    stack: err.stack,
    details: err.details,
  });

  const status = err.statusCode || 500;

  // Known error
  if (err.code && err.statusCode) {
    return new Response(
      JSON.stringify({
        success: false,
        message: err.message,
        code: err.code,
        details: err.details || null,
        ...(isDev && { stack: err.stack }),
      }),
      {
        status,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Unknown error
  return new Response(
    JSON.stringify({
      success: false,
      message: "Internal Server Error",
      code: "INTERNAL_ERROR",
      ...(isDev && {
        actualError: err.message,
        stack: err.stack,
      }),
    }),
    {
      status: 500,
      headers: { "Content-Type": "application/json" },
    }
  );
};