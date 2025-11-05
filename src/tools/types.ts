import { z } from "zod";
import {
  ToolSchema,
  CallToolResultSchema,
  TextContentSchema,
} from "@modelcontextprotocol/sdk/types.js";

export type ToolDefinition = z.infer<typeof ToolSchema>;
export type ToolResponse = z.infer<typeof CallToolResultSchema>;
export type ToolTextContent = z.infer<typeof TextContentSchema>;

