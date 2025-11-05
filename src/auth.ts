import { CONVEX_AUTH_EMAIL, CONVEX_AUTH_PASSWORD, CONVEX_URL, MCP_DEBUG } from "./config.js";

let sessionCookies: string | null = null;
let authToken: string | null = null;
let authInitialized = false;

export function isAuthInitialized(): boolean {
  return authInitialized;
}


export async function initializeAuth(): Promise<void> {
  if (authInitialized) return;

  const email = CONVEX_AUTH_EMAIL;
  const password = CONVEX_AUTH_PASSWORD;

  if (!email || !password) {
    if (MCP_DEBUG) console.error("Auth disabled: missing CONVEX_AUTH_EMAIL/PASSWORD");
    authInitialized = true;
    return;
  }

  try {
    const signInUrl = `${CONVEX_URL}/api/action`;
    const response = await fetch(signInUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: "auth:signIn",
        args: {
          provider: "password",
          params: { email, password, flow: "signIn" },
        },
        format: "json",
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`Authentication failed: ${response.status} ${text}`);
      authInitialized = true;
      return;
    }

    const result = await response.json();
    const signInResult = result?.status === "success" ? result.value : result;

    const cookies: string[] = [];
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === "set-cookie") cookies.push(value);
    });

    if (cookies.length > 0) {
      sessionCookies = cookies.join("; ");
      if (MCP_DEBUG) console.error("Authenticated with session cookies");
    } else if (signInResult?.tokens?.token) {
      authToken = signInResult.tokens.token;
      if (MCP_DEBUG) console.error("Authenticated with token from signIn");
    } else {
      console.error("Authentication succeeded but no cookies or tokens.token returned");
      if (MCP_DEBUG) console.error(`signInResult payload: ${JSON.stringify(signInResult)}`);
    }

    authInitialized = true;
  } catch (err) {
    console.error("Error during authentication:", err);
    authInitialized = true;
  }
}

export function buildAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  if (authToken) headers["Authorization"] = `Bearer ${authToken}`;
  else if (sessionCookies) headers["Cookie"] = sessionCookies;
  return headers;
}


