const store = new Map();

export function rateLimit(ip, limit = 10, windowMs = 60_000) {
  const now = Date.now();

  let entry = store.get(ip);

  if (!entry) {
    entry = { count: 0, start: now };
  }

  // reset window
  if (now - entry.start > windowMs) {
    entry = { count: 0, start: now };
  }

  entry.count += 1;
  store.set(ip, entry);

  if (entry.count > limit) {
    const err = new Error("Too many requests");
    err.statusCode = 429;
    throw err;
  }
}