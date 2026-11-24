import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

// CORS headers so the Next.js app can call the API from the browser.
const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

export function respond(statusCode: number, body: object): APIGatewayProxyResult {
  return { statusCode, headers, body: JSON.stringify(body) };
}

/** Returns the trimmed "name" field, or "" if missing or not a string. */
export function readName(rawBody: string | null): { name: string; badJson: boolean } {
  if (!rawBody) return { name: '', badJson: false };
  try {
    const parsed = JSON.parse(rawBody);
    const name = typeof parsed?.name === 'string' ? parsed.name.trim() : '';
    return { name, badJson: false };
  } catch {
    return { name: '', badJson: true };
  }
}

/**
 * The logged-in user's Cognito username, when the route is protected by a
 * Cognito authorizer. Undefined when the route has no authorizer.
 */
export function cognitoUsername(event: APIGatewayProxyEvent): string | undefined {
  const claims = event.requestContext?.authorizer?.claims;
  return claims?.['cognito:username'] ?? claims?.username;
}