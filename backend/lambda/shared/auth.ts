// Shared login helpers for every endpoint Lambda.
//
// API Gateway already rejects requests without a valid Cognito login before
// the Lambda runs. These helpers read WHO is logged in, and check they are
// the right kind of user for the endpoint.
//
// Usage:
//   const centerName = requireGroup(event, 'DonationCenter');
//   if (!centerName) return fail('Only donation centers can do this', 403);

// Must match the group names in the Cognito user pool exactly.
export type Group = 'Organization' | 'DonationCenter';

// The logged-in user's details, filled in by API Gateway's Cognito authorizer.
function claims(event: any): Record<string, any> {
  return event?.requestContext?.authorizer?.claims ?? {};
}

// The logged-in username (= organization username / donation center name).
export function getUsername(event: any): string | null {
  return claims(event)['cognito:username'] ?? null;
}

// The Cognito groups the user is in. API Gateway can pass these as a list,
// or as one string like "DonationCenter" or "[Organization DonationCenter]".
export function getGroups(event: any): string[] {
  const raw = claims(event)['cognito:groups'];
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  return String(raw).replaceAll(/[[\]]/g, '').split(/[\s,]+/).filter(Boolean);
}

// Returns the username if the user is in `group`, otherwise null.
export function requireGroup(event: any, group: Group): string | null {
  const username = getUsername(event);
  if (!username || !getGroups(event).includes(group)) return null;
  return username;
}
