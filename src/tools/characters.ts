import { callConvexFunction } from "../convexClient.js";
import type { ToolDefinition, ToolResponse } from "./types.js";

export const characterTools = [
  {
    name: "add_player_character",
    description: "Add a new player character to the system.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "The name of the player character" },
      },
      required: ["name"],
    },
  },
  {
    name: "add_player_character_to_encounter",
    description:
      "Add a player character to an encounter. The character must exist and not already be in another encounter.",
    inputSchema: {
      type: "object",
      properties: {
        encounterId: { type: "string", description: "The ID of the encounter" },
        characterId: { type: "string", description: "The ID of the player character to add" },
      },
      required: ["encounterId", "characterId"],
    },
  },
  {
    name: "remove_player_character_from_encounter",
    description: "Remove a player character from an encounter.",
    inputSchema: {
      type: "object",
      properties: {
        encounterId: { type: "string", description: "The ID of the encounter" },
        characterId: { type: "string", description: "The ID of the player character to remove" },
      },
      required: ["encounterId", "characterId"],
    },
  },
] as const satisfies readonly ToolDefinition[];

export async function handleCharacterTool(
  name: typeof characterTools[number]["name"],
  args: any
): Promise<ToolResponse> {
  switch (name) {
    case "add_player_character": {
      if (!args || typeof args.name !== "string") {
        throw new Error("name parameter is required and must be a string");
      }
      const characterId = await callConvexFunction("myFunctions:createCharacter", { name: args.name }, "mutation");
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              { success: true, characterId, message: `Player character "${args.name}" created successfully` },
              null,
              2
            ),
          },
        ],
      };
    }

    case "add_player_character_to_encounter": {
      if (!args || typeof args.encounterId !== "string" || typeof args.characterId !== "string") {
        throw new Error("encounterId and characterId parameters are required");
      }
      const result = await callConvexFunction(
        "myFunctions:addCharacterToEncounter",
        { encounterId: args.encounterId, characterId: args.characterId },
        "mutation"
      );
      return {
        content: [
          { type: "text", text: JSON.stringify({ success: result, message: "Player character added to encounter successfully" }, null, 2) },
        ],
      };
    }

    case "remove_player_character_from_encounter": {
      if (!args || typeof args.encounterId !== "string" || typeof args.characterId !== "string") {
        throw new Error("encounterId and characterId parameters are required");
      }
      const result = await callConvexFunction(
        "myFunctions:removeCharacterFromEncounter",
        { encounterId: args.encounterId, characterId: args.characterId },
        "mutation"
      );
      return {
        content: [
          { type: "text", text: JSON.stringify({ success: result, message: "Player character removed from encounter successfully" }, null, 2) },
        ],
      };
    }

    default:
      throw new Error(`Unknown character tool: ${name as string}`);
  }
}

