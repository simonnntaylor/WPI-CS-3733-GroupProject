import { fetchAuthSession } from "aws-amplify/auth";
// Side-effect import: makes sure Amplify is configured before we ask for a session.
import "./amplify";

// ApiUrl is printed by `cdk deploy`. Put it in .env.local as NEXT_PUBLIC_API_URL.
const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

export type ApiResult = { ok: true; message: string } | { ok: false; error: string };

// Sends the logged-in user's Cognito token so the API can identify the Organization.
async function authHeaders(): Promise<Record<string, string>> {
  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString();
  return token ? { Authorization: token } : {};
}

async function post(path: string, body: object): Promise<ApiResult> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await authHeaders()) },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error ?? "Something went wrong" };
    return { ok: true, message: data.message };
  } catch {
    return { ok: false, error: "Could not reach the server. Try again." };
  }
}

export const addCategory = (name: string) => post("/addCategory", { name });

export const removeCategory = (name: string) => post("/removeCategory", { name });

export async function listCategories(): Promise<string[]> {
  const res = await fetch(`${API_URL}/listCategories`, {
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error("Could not load categories");
  const data = await res.json();
  return data.categories;
}