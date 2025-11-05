# TOTM Convex MCP Server

An MCP (Model Context Protocol) server that connects to your Convex app `totm-convex` to manage encounters, player characters, and monster templates.

## Features

The server provides the following tools:

1. **list_encounters** - List all encounters with their details, including associated player characters and monsters
2. **add_encounter** - Add a new encounter to the system
3. **add_player_character** - Add a new player character
4. **add_monster_template** - Add a new monster template
5. **add_player_character_to_encounter** - Add a player character to an encounter
6. **remove_player_character_from_encounter** - Remove a player character from an encounter
7. **add_monster_to_encounter** - Add a monster to an encounter using a monster template
8. **remove_monster_from_encounter** - Remove a monster from an encounter

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Then edit `.env` and set your Convex URL:

```
CONVEX_URL=https://your-deployment-name.convex.cloud
```

### Authentication (email + password)

This MCP signs in using Convex Auth (Password provider) if credentials are present in `.env`:

```bash
CONVEX_AUTH_EMAIL=your-email@example.com
CONVEX_AUTH_PASSWORD=your-password
```

At startup, the server calls `auth:signIn` and will use either a returned token (Authorization: Bearer) or session cookies when calling the HTTP API. If these vars are omitted, requests will be unauthenticated and may fail depending on your Convex function visibility.

### 3. Build the Server

```bash
npm run build
```

### 4. Configure Claude Desktop (automated)

This repo includes a helper script that syncs `claude_desktop_config.json` into your Claude app config.

1. Set the absolute path to your Claude config in `.env`:
   - macOS (default path):
     ```bash
     echo "CLAUDE_DESKTOP_CONFIG_PATH=$HOME/Library/Application Support/Claude/claude_desktop_config.json" >> .env
     ```
   - Windows (PowerShell example):
     ```powershell
     Add-Content .env "CLAUDE_DESKTOP_CONFIG_PATH=$env:APPDATA\Claude\claude_desktop_config.json"
     ```

2. Edit `claude_desktop_config.json` in this repo to set (absolute paths required):
   - `command`: your Node binary path (e.g., `/usr/local/bin/node`)
   - `args`: include `--env-file`, the path to your `.env`, and the path to `build/index.js`, for example:
     ```json
     "args": [
       "--env-file",
       "/absolute/path/to/project/.env",
       "/absolute/path/to/project/build/index.js"
     ]
     ```
   - `cwd`: set to the project root absolute path

3. Build and sync:
   - One-step (recommended):
     ```bash
     npm run build-and-sync
     ```
   - Or separately:
     ```bash
     npm run build
     npm run sync:claude-config
     ```

The script will back up your existing Claude config to `claude_desktop_config.json.bak` and then apply the changes.

### 5. Restart Claude Desktop

After configuring, fully quit and restart Claude Desktop (not just close the window):
- **macOS**: Use Cmd+Q or select "Quit Claude" from the menu bar
- **Windows**: Right-click the Claude icon in the system tray and select "Quit"

## Usage

Once configured, you can use the MCP tools in Claude Desktop. For example:
- "List all encounters"
- "Add a new encounter called 'Goblin Cave'"
- "Add a player character named 'Aragorn'"
- "Add the Goblin template to the Goblin Cave encounter"

## Troubleshooting

### Server not showing up in Claude Desktop

1. Check your `claude_desktop_config.json` file syntax
2. Make sure all paths are absolute (not relative)
3. Fully quit and restart Claude Desktop (not just close the window)

### Tool calls failing

1. Check Claude's logs in:
   - **macOS**: `~/Library/Logs/Claude/mcp*.log`
   - **Windows**: Check the Claude logs directory
2. Verify your `CONVEX_URL` is correct
3. Ensure your Convex deployment is running and accessible
4. If functions require authentication, make sure `CONVEX_AUTH_TOKEN` is set correctly

### Convex API errors

If you see Convex API errors, verify:
- Your Convex deployment URL is correct
- The function names match those in your Convex app (`myFunctions:listEncounters`, etc.)
- Your Convex functions are properly exported and accessible

## Development

### Architecture

Source is modularized for clarity and future growth:
- `src/index.ts` – entrypoint; starts the server
- `src/server.ts` – MCP server bootstrap and request handlers wiring
- `src/tools/` – domain-split tool definitions and handlers
  - `src/tools/types.ts` – shared tool types
  - `src/tools/encounters.ts` – encounter-related tools and handler
  - `src/tools/characters.ts` – character-related tools and handler
  - `src/tools/monsters.ts` – monster-related tools and handler
  - `src/tools/index.ts` – combines tool arrays, exports `toolsList`, `ToolName`, `dispatchTool`
- `src/convexClient.ts` – `callConvexFunction` wrapper for Convex HTTP API
- `src/auth.ts` – auth/session management and header building
- `src/config.ts` – environment variable access and validation

### Typical workflow

1. Make changes in the relevant module (see Architecture above)
2. Build: `npm run build`
3. Restart Claude Desktop to load the new build

### Adding a new tool

For an existing domain (encounters/characters/monsters):
1. Add the tool definition to the relevant file (e.g., `src/tools/encounters.ts`)
2. Implement the corresponding `case` in that file's handler
3. If it calls Convex, use `callConvexFunction` from `src/convexClient.ts`
4. Build and restart Claude Desktop

For a new domain:
1. Create a new `src/tools/<domain>.ts` exporting a `<domain>Tools` array and `handle<Domain>Tool`
2. Update `src/tools/index.ts` to import and spread the new tools array, and route in `dispatchTool`
3. Build and restart Claude Desktop

### Debug logging

Set `MCP_DEBUG=1` in your environment to see additional authentication logs.

## License

MIT

