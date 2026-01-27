import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from "fs";
import { dirname, join } from "path";
import { homedir } from "os";

export interface ClaudeSettings {
  statusLine?: {
    type: "command";
    command: string;
    padding?: number;
  };
  [key: string]: unknown;
}

export function getClaudeSettingsPath(): string {
  const claudeDir = process.env.CLAUDE_CONFIG_DIR || join(homedir(), ".claude");
  return join(claudeDir, "settings.json");
}

export function getClaudeSettings(): ClaudeSettings | null {
  const settingsPath = getClaudeSettingsPath();

  if (!existsSync(settingsPath)) {
    return null;
  }

  try {
    const content = readFileSync(settingsPath, "utf8");
    return JSON.parse(content);
  } catch {
    return null;
  }
}

export function backupClaudeSettings(): string | null {
  const settingsPath = getClaudeSettingsPath();

  if (!existsSync(settingsPath)) {
    return null;
  }

  const backupPath = settingsPath + ".backup";
  try {
    copyFileSync(settingsPath, backupPath);
    return backupPath;
  } catch {
    return null;
  }
}

export function installToClaudeSettings(command: string = "npx @vimukthid/ccsl"): boolean {
  const settingsPath = getClaudeSettingsPath();
  const dir = dirname(settingsPath);

  // Ensure directory exists
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  // Load existing settings or create new
  let settings: ClaudeSettings = {};
  if (existsSync(settingsPath)) {
    try {
      const content = readFileSync(settingsPath, "utf8");
      settings = JSON.parse(content);
    } catch {
      // If parse fails, start fresh
      settings = {};
    }
  }

  // Update statusLine
  settings.statusLine = {
    type: "command",
    command,
  };

  // Write back
  try {
    writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    return true;
  } catch {
    return false;
  }
}

export function uninstallFromClaudeSettings(): boolean {
  const settingsPath = getClaudeSettingsPath();

  if (!existsSync(settingsPath)) {
    return true; // Nothing to uninstall
  }

  try {
    const content = readFileSync(settingsPath, "utf8");
    const settings: ClaudeSettings = JSON.parse(content);

    // Remove statusLine
    delete settings.statusLine;

    // Write back
    writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    return true;
  } catch {
    return false;
  }
}

export function isInstalledInClaude(): boolean {
  const settings = getClaudeSettings();
  if (!settings?.statusLine) {
    return false;
  }

  const command = settings.statusLine.command || "";
  return command.includes("ccsl") || command.includes("@vimukthid/ccsl");
}

export function getCurrentClaudeCommand(): string | null {
  const settings = getClaudeSettings();
  return settings?.statusLine?.command || null;
}
