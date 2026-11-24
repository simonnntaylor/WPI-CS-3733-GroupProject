// Shared helper for calling our backend API from any page.
//
// Usage (inside a "use client" component):
//   import { apiGet, apiPost } from "@/lib/api";
//
//   type Dashboard = { name: string; totalItems: number };   // shape of the response
//   const dashboard = await apiGet<Dashboard>("donationCenter/showDashboard");
//   const results = await apiGet<Center[]>("donor/searchDonationCenters", { category: "Toys" });
//   await apiPost("organization/addCategory", { name: "Appliances" });
//
// - Attaches the logged-in user's Cognito token automatically (donor pages
//   with no login just send no token).
// - GET sends inputs in the URL (?category=Toys), POST sends them as JSON.
// - If the API returns an error, this throws an Error with the API's
//   { error: "..." } message, so pages can show it with try/catch:
//     try { ... } catch (e) { setError((e as Error).message); }

import "./amplify"; // make sure Amplify knows our Cognito settings
import { fetchAuthSession } from "aws-amplify/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL as string;

// The logged-in user's ID token, or null if nobody is logged in.
async function getToken(): Promise<string | null> {
  try {
    const session = await fetchAuthSession();
    return session.tokens?.idToken?.toString() ?? null;
  } catch {
    return null;
  }
}

async function request<T>(method: "GET" | "POST", path: string, init: RequestInit): Promise<T> {
  const token = await getToken();

  // Avoid a double slash: API_URL ends with "/", paths may start with one.
  const url = API_URL.replace(/\/$/, "") + "/" + path.replace(/^\//, "");

  const res = await fetch(url, {
    ...init,
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: token } : {}),
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    // Our Lambdas send { error }, API Gateway sends { message } (e.g. 401).
    throw new Error(data.error ?? data.message ?? `Request failed (${res.status})`);
  }
  return data as T;
}

// Read data. `params` become the URL query string.
export function apiGet<T = unknown>(path: string, params?: Record<string, string>): Promise<T> {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  return request<T>("GET", path + query, {});
}

// Create or change data. `body` is sent as JSON.
export function apiPost<T = unknown>(path: string, body?: unknown): Promise<T> {
  return request<T>("POST", path, { body: JSON.stringify(body ?? {}) });
}
