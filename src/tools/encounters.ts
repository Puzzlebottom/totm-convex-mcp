import { callConvexFunction } from "../convexClient.js";
import type { ToolDefinition, ToolResponse } from "./types.js";

export const encounterTools = [
  {
    name: "list_encounters",
    description:
      "List all encounters with their details including associated player characters and monsters.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "add_encounter",
    description: "Add a new encounter to the system.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "The name of the encounter" },
      },
      required: ["name"],
    },
  },
] as const satisfies readonly ToolDefinition[];

export async function handleEncounterTool(
  name: typeof encounterTools[number]["name"],
  args: any
): Promise<ToolResponse> {
  switch (name) {
    case "list_encounters": {
      const encounters = await callConvexFunction("myFunctions:listEncounters", {}, "query");
      const encountersWithDetails = await Promise.all(
        (encounters as any[]).map(async (encounter: any) => {
          let characters: any[] = [];
          let monsters: any[] = [];

          try {
            characters =
              (await callConvexFunction(
                "myFunctions:listCharactersByEncounter",
                { encounterId: encounter._id },
                "query"
              )) || [];
          } catch (error: any) {
            console.error(`Could not fetch characters for encounter ${encounter._id}: ${error.message}`);
          }

          try {
            monsters =
              (await callConvexFunction(
                "myFunctions:listMonstersByEncounter",
                { encounterId: encounter._id },
                "query"
              )) || [];
          } catch (error: any) {
            console.error(`Could not fetch monsters for encounter ${encounter._id}: ${error.message}`);
          }

          return { ...encounter, characters: characters || [], monsters: monsters || [] };
        })
      );

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(encountersWithDetails, null, 2),
          },
        ],
      };
    }

    case "add_encounter": {
      if (!args || typeof args.name !== "string") {
        throw new Error("name parameter is required and must be a string");
      }
      const encounterId = await callConvexFunction("myFunctions:addEncounter", { name: args.name }, "mutation");
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              { success: true, encounterId, message: `Encounter "${args.name}" created successfully` },
              null,
              2
            ),
          },
        ],
      };
    }

    default:
      throw new Error(`Unknown encounter tool: ${name as string}`);
  }
}

