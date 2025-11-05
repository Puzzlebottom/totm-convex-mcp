import { encounterTools, handleEncounterTool } from "./encounters.js";
import { characterTools, handleCharacterTool } from "./characters.js";
import { monsterTools, handleMonsterTool } from "./monsters.js";
import type { ToolDefinition, ToolResponse } from "./types.js";

// Combine all tool definitions
export const toolsList = [
  ...encounterTools,
  ...characterTools,
  ...monsterTools,
] as const satisfies readonly ToolDefinition[];

// Export the ToolName type derived from the combined list
export type ToolName = typeof toolsList[number]["name"];

// Re-export types for convenience
export type { ToolDefinition, ToolResponse, ToolTextContent } from "./types.js";

// Unified dispatch function that routes to the appropriate handler
export async function dispatchTool(name: ToolName, args: any): Promise<ToolResponse> {
  // Check if it's an encounter tool
  if (encounterTools.some((t) => t.name === name)) {
    return handleEncounterTool(name as typeof encounterTools[number]["name"], args);
  }

  // Check if it's a character tool
  if (characterTools.some((t) => t.name === name)) {
    return handleCharacterTool(name as typeof characterTools[number]["name"], args);
  }

  // Check if it's a monster tool
  if (monsterTools.some((t) => t.name === name)) {
    return handleMonsterTool(name as typeof monsterTools[number]["name"], args);
  }

  // This should be unreachable because name is a ToolName
  throw new Error(`Unknown tool: ${name as string}`);
}

