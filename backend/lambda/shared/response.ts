// Shared response helpers for every endpoint Lambda.
//
// Usage:
//   return ok({ name, inventory });          // 200 with a JSON body
//   return fail('Center not found');          // 400 with { error: ... }
//   return fail('Not allowed', 403);          // other status codes
//
// The CORS header lets the frontend's browser read the response. API Gateway
// handles the CORS "preflight" request, but the real response must include
// this header too, so always return through these helpers.

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

export function ok(body: unknown, statusCode = 200) {
  return { statusCode, headers, body: JSON.stringify(body) };
}

export function fail(error: string, statusCode = 400) {
  return { statusCode, headers, body: JSON.stringify({ error }) };
}
