#!/usr/bin/env node
import fs from "fs"
import path from "path"
import url from "url"
import dotenv from "dotenv"

// Load .env from project root
const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, "..\/")
dotenv.config({ path: path.join(projectRoot, ".env") })

const SERVER_KEY = "totm-convex-mcp"
const ENV_PATH_VAR = process.env.CLAUDE_DESKTOP_CONFIG_PATH || process.env.CLAUDE_APP_CONFIG_PATH

function fail(msg) {
  console.error(msg)
  process.exit(1)
}

try {
  if (!ENV_PATH_VAR) {
    fail(
      "Missing CLAUDE_DESKTOP_CONFIG_PATH (or CLAUDE_APP_CONFIG_PATH) in .env — set it to the absolute path of Claude's claude_desktop_config.json"
    )
  }

  const targetConfigPath = ENV_PATH_VAR
  const sourceConfigPath = path.join(projectRoot, "claude_desktop_config.json")

  if (!fs.existsSync(sourceConfigPath)) {
    fail(`Source config not found at ${sourceConfigPath}`)
  }
  if (!fs.existsSync(targetConfigPath)) {
    fail(`Target Claude config not found at ${targetConfigPath}`)
  }

  const rawSource = fs.readFileSync(sourceConfigPath, "utf8")
  const rawTarget = fs.readFileSync(targetConfigPath, "utf8")

  /**
   * Parse JSON with helpful errors
   */
  const parseJson = (text, label) => {
    try {
      return JSON.parse(text)
    } catch (e) {
      fail(`Failed to parse ${label}: ${e.message}`)
    }
  }

  const sourceJson = parseJson(rawSource, "source repo claude_desktop_config.json")
  const targetJson = parseJson(rawTarget, "Claude app claude_desktop_config.json")

  if (!sourceJson?.mcpServers?.[SERVER_KEY]) {
    fail(`Source config is missing mcpServers.${SERVER_KEY}`)
  }

  // Ensure containers exist
  targetJson.mcpServers = targetJson.mcpServers || {}

  const existing = targetJson.mcpServers[SERVER_KEY]
  const incoming = sourceJson.mcpServers[SERVER_KEY]

  const action = existing ? "updated" : "added"
  targetJson.mcpServers[SERVER_KEY] = incoming

  // Backup target file
  const backupPath = `${targetConfigPath}.bak`
  fs.writeFileSync(backupPath, rawTarget, "utf8")

  // Write updated config (2-space indentation to match common style)
  const serialized = JSON.stringify(targetJson, null, 2) + "\n"
  fs.writeFileSync(targetConfigPath, serialized, "utf8")

  console.error(
    `Claude config ${action}. Backup written to: ${backupPath}\nTarget: ${targetConfigPath}`
  )
} catch (err) {
  fail(`Unexpected error: ${err?.message || String(err)}`)
}


