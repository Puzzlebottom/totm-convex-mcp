import { CONVEX_URL } from "./config.js";
import { buildAuthHeaders, initializeAuth, isAuthInitialized } from "./auth.js";

export async function callConvexFunction(
  functionPath: string,
  args: any,
  method: "query" | "mutation" | "action" = "query"
): Promise<any> {
  if (!isAuthInitialized()) {
    await initializeAuth();
  }

  const url = `${CONVEX_URL}/api/${method}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...buildAuthHeaders(),
  };

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      path: functionPath,
      args,
      format: "json",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Convex API error for ${functionPath}: ${response.status}`);
    console.error(`Response: ${errorText}`);
    console.error(`Auth header used: ${headers["Authorization"] ? "Bearer token present" : "None"}`);
    throw new Error(`Convex API error: ${response.status} ${errorText}`);
  }

  const result = await response.json();

  if (result && typeof result === "object" && "status" in result) {
    if (result.status === "error") {
      throw new Error(result.errorMessage || "Convex function execution failed");
    }
    return result.value !== undefined ? result.value : result;
  }

  return result;
}


