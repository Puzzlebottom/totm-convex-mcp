// Environment and configuration helpers

export const MCP_DEBUG = ["1", "true", "yes"].includes((process.env.MCP_DEBUG || "").toLowerCase());

if (!process.env.CONVEX_URL) {
  console.error("Error: CONVEX_URL environment variable is required");
  process.exit(1);
}

export const CONVEX_URL = process.env.CONVEX_URL as string;
export const CONVEX_AUTH_EMAIL = process.env.CONVEX_AUTH_EMAIL || null;
export const CONVEX_AUTH_PASSWORD = process.env.CONVEX_AUTH_PASSWORD || null;


