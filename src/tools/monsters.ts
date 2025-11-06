import { callConvexFunction } from "../convexClient.js";
import type { ToolDefinition, ToolResponse } from "./types.js";

export const monsterTools = [
  {
    name: "add_monster_template",
    description: "Add a new monster template to the system.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "The name of the monster template" },
      },
      required: ["name"],
    },
  },
  {
    name: "add_monster_to_encounter",
    description:
      "Add a monster to an encounter using a monster template. The template will be instantiated for this encounter.",
    inputSchema: {
      type: "object",
      properties: {
        encounterId: { type: "string", description: "The ID of the encounter" },
        templateId: { type: "string", description: "The ID of the monster template to use" },
      },
      required: ["encounterId", "templateId"],
    },
  },
  {
    name: "remove_monster_from_encounter",
    description: "Remove a monster from an encounter.",
    inputSchema: {
      type: "object",
      properties: {
        monsterId: { type: "string", description: "The ID of the monster to remove" },
      },
      required: ["monsterId"],
    },
  },
  {
    name: "delete_monster_template",
    description: "Delete a monster template from the system.",
    inputSchema: {
      type: "object",
      properties: {
        templateId: { type: "string", description: "The ID of the monster template to delete" },
      },
      required: ["templateId"],
    },
  },
  {
    name: "list_monster_templates",
    description: "List all monster templates in the system.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
] as const satisfies readonly ToolDefinition[];

export async function handleMonsterTool(
  name: typeof monsterTools[number]["name"],
  args: any
): Promise<ToolResponse> {
  switch (name) {
    case "add_monster_template": {
      if (!args || typeof args.name !== "string") {
        throw new Error("name parameter is required and must be a string");
      }
      const templateId = await callConvexFunction(
        "myFunctions:createMonsterTemplate",
        { name: args.name },
        "mutation"
      );
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              { success: true, templateId, message: `Monster template "${args.name}" created successfully` },
              null,
              2
            ),
          },
        ],
      };
    }

    case "add_monster_to_encounter": {
      if (!args || typeof args.encounterId !== "string" || typeof args.templateId !== "string") {
        throw new Error("encounterId and templateId parameters are required");
      }
      const result = await callConvexFunction(
        "myFunctions:addMonsterToEncounter",
        { encounterId: args.encounterId, template: args.templateId },
        "mutation"
      );
      return {
        content: [
          { type: "text", text: JSON.stringify({ success: result, message: "Monster added to encounter successfully" }, null, 2) },
        ],
      };
    }

    case "remove_monster_from_encounter": {
      if (!args || typeof args.monsterId !== "string") {
        throw new Error("monsterId parameter is required");
      }
      const result = await callConvexFunction("myFunctions:deleteMonster", { id: args.monsterId }, "mutation");
      return {
        content: [
          { type: "text", text: JSON.stringify({ success: result, message: "Monster removed from encounter successfully" }, null, 2) },
        ],
      };
    }

    case "delete_monster_template": {
      if (!args || typeof args.templateId !== "string") {
        throw new Error("templateId parameter is required and must be a string");
      }
      const result = await callConvexFunction("myFunctions:deleteMonster", { id: args.templateId }, "mutation");
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              { success: result, message: `Monster template "${args.templateId}" deleted successfully` },
              null,
              2
            ),
          },
        ],
      };
    }

    case "list_monster_templates": {
      const templates = await callConvexFunction("myFunctions:listMonsterTemplates", {}, "query");
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(templates, null, 2),
          },
        ],
      };
    }

    default:
      throw new Error(`Unknown monster tool: ${name as string}`);
  }
}

