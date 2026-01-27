import { Command } from "commander";
import { loadConfig, getConfigPath } from "./config/loader.js";
import { parseStatusInput, readStdin, isInteractiveMode } from "./parser.js";
import { formatStatusLine, sampleStatusInput } from "./formatter.js";
import { themeNames } from "./themes/index.js";
import {
  installToClaudeSettings,
  uninstallFromClaudeSettings,
  isInstalledInClaude,
  getCurrentClaudeCommand,
  backupClaudeSettings,
  getClaudeSettingsPath,
} from "./config/claude.js";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { dirname } from "path";
import { defaultConfig } from "./config/defaults.js";

const program = new Command();

program
  .name("ccsl")
  .description("Customizable status line formatter for Claude Code CLI")
  .version("1.0.0");

program
  .command("install")
  .description("Install ccsl to Claude Code settings.json")
  .option("-c, --command <cmd>", "Custom command to use", "npx @vimukthid/ccsl")
  .action(async (options) => {
    console.log("\nInstalling ccsl to Claude Code...\n");

    // Check if already installed
    if (isInstalledInClaude()) {
      const currentCmd = getCurrentClaudeCommand();
      console.log(`  Already installed with command: ${currentCmd}`);
      console.log("  Updating configuration...\n");
    }

    // Backup existing settings
    const backupPath = backupClaudeSettings();
    if (backupPath) {
      console.log(`  Backup created: ${backupPath}`);
    }

    // Install
    const success = installToClaudeSettings(options.command);
    if (success) {
      console.log(`  Installed to: ${getClaudeSettingsPath()}`);
      console.log(`  Command: ${options.command}`);
      console.log("\n  ccsl is now configured for Claude Code!");
      console.log("  Restart Claude Code to see your new status line.\n");
    } else {
      console.error("\n  Failed to install. Check file permissions.\n");
      process.exit(1);
    }
  });

program
  .command("uninstall")
  .description("Remove ccsl from Claude Code settings.json")
  .action(async () => {
    console.log("\nRemoving ccsl from Claude Code...\n");

    if (!isInstalledInClaude()) {
      console.log("  ccsl is not currently installed in Claude Code.\n");
      return;
    }

    // Backup existing settings
    const backupPath = backupClaudeSettings();
    if (backupPath) {
      console.log(`  Backup created: ${backupPath}`);
    }

    const success = uninstallFromClaudeSettings();
    if (success) {
      console.log("  Successfully removed from Claude Code settings.\n");
    } else {
      console.error("\n  Failed to uninstall. Check file permissions.\n");
      process.exit(1);
    }
  });

program
  .command("theme [name]")
  .description("Quick switch theme or list available themes")
  .option("-l, --list", "List available themes")
  .action(async (name, options) => {
    if (options.list || !name) {
      listThemes();
      return;
    }
    await switchTheme(name);
  });

program
  .command("preview")
  .description("Preview current configuration with sample data")
  .action(async () => {
    await previewConfig();
  });

program
  .command("init")
  .description("Create local config file")
  .option("-g, --global", "Create global config file instead")
  .action(async (options) => {
    const scope = options.global ? "global" : "local";
    await initConfig(scope);
  });

program
  .command("config")
  .description("Open TUI configuration")
  .option("-g, --global", "Configure global settings")
  .option("-l, --local", "Configure local project settings")
  .action(async (options) => {
    const scope = options.global ? "global" : "local";
    await runTui(scope);
  });

// Default action - either format stdin or launch TUI
program.action(async () => {
  if (isInteractiveMode()) {
    // No piped input - launch TUI
    await runTui("local");
  } else {
    // Piped input - format status line
    const stdinData = await readStdin();
    const input = parseStatusInput(stdinData);

    if (!input) {
      // Output empty line if no valid input
      console.log("");
      return;
    }

    const config = await loadConfig();
    const output = formatStatusLine(input, config);
    console.log(output);
  }
});

async function runTui(scope: "local" | "global") {
  const { launchTui } = await import("./tui/app.js");
  await launchTui(scope);
}

function listThemes() {
  console.log("\nAvailable themes:\n");

  const descriptions: Record<string, string> = {
    neon: "Vibrant cyberpunk with electric colors",
    rainbow: "Colorful gradient transitions",
    ocean: "Cool blues and teals",
    minimal: "Clean, understated (default)",
    monochrome: "Pure grayscale",
    corporate: "Professional muted blues",
  };

  for (const name of themeNames) {
    const desc = descriptions[name] || "";
    console.log(`  ${name.padEnd(12)} - ${desc}`);
  }

  console.log("\nUse 'ccsl theme <name>' to switch themes");
  console.log("Use 'ccsl preview' to see the current theme\n");
}

async function switchTheme(themeName: string) {
  if (!themeNames.includes(themeName)) {
    console.error(`\nError: Unknown theme '${themeName}'`);
    console.log(`Available themes: ${themeNames.join(", ")}\n`);
    process.exit(1);
  }

  const configPath = getConfigPath("local");
  const config = await loadConfig();
  config.theme = themeName;

  try {
    const dir = dirname(configPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`\nTheme switched to '${themeName}'\n`);

    // Show preview
    const output = formatStatusLine(sampleStatusInput, config);
    console.log("Preview:");
    console.log(output);
    console.log("");
  } catch (err) {
    console.error(`\nError saving config: ${err}\n`);
    process.exit(1);
  }
}

async function previewConfig() {
  const config = await loadConfig();

  console.log("\nCurrent configuration:");
  console.log(`  Theme: ${config.theme}`);
  console.log(`  Widgets: ${config.widgets.join(", ")}`);
  console.log(`  Separator: "${config.separator}"`);
  console.log(`  Icons: ${config.icons}`);
  console.log("\nPreview with sample data:\n");
  console.log(formatStatusLine(sampleStatusInput, config));
  console.log("");

  // Show Claude Code status
  if (isInstalledInClaude()) {
    console.log(`Claude Code: Installed (${getCurrentClaudeCommand()})`);
  } else {
    console.log("Claude Code: Not installed (run 'ccsl install')");
  }
  console.log("");
}

async function initConfig(scope: "local" | "global") {
  const configPath = getConfigPath(scope);

  if (existsSync(configPath)) {
    console.log(`\nConfig file already exists at ${configPath}\n`);
    return;
  }

  try {
    const dir = dirname(configPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
    console.log(`\nCreated config file at ${configPath}\n`);
  } catch (err) {
    console.error(`\nError creating config: ${err}\n`);
    process.exit(1);
  }
}

program.parse();
