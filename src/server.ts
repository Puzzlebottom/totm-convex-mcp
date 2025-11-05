import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { initializeAuth } from "./auth.js";
import { toolsList, dispatchTool, type ToolName } from "./tools/index.js";

export async function startServer(): Promise<void> {
  // Initialize authentication on startup, but don't fail the server if it errors
  initializeAuth().catch((error) => {
    console.error("Failed to initialize authentication:", error);
  });

  const server = new Server(
    { name: "totm-convex-mcp", version: "1.0.0" },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: toolsList }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
      return await dispatchTool(name as ToolName, args);
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              { error: error.message || "An error occurred", details: error.toString() },
              null,
              2
            ),
          },
        ],
        isError: true,
      };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("totm-convex-mcp server running on stdio");
}


