// GET /whoami: test endpoint for checking login works end to end.
// Returns who the API thinks you are. Safe to delete once real endpoints exist
// (but the API needs at least one endpoint to deploy).

import { getUsername, getGroups } from '../shared/auth';
import { ok } from '../shared/response';

export async function handler(event: any) {
  return ok({ username: getUsername(event), groups: getGroups(event) });
}
