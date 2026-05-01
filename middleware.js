import { NextResponse } from "next/server";

export function middleware(req) {
  const res = NextResponse.next();

  // Basic security
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-XSS-Protection", "1; mode=block");

  // Advanced security
  res.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; img-src 'self' data:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
  );

  res.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );

  res.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  res.headers.set(
    "Referrer-Policy",
    "strict-origin-when-cross-origin"
  );

  return res;
}