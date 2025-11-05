import { startServer } from "./server.js";

startServer().catch((error) => {
  console.error("Fatal error in startServer():", error);
  process.exit(1);
});
