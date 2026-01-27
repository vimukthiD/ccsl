import { cosmiconfig } from "cosmiconfig";
import { defaultConfig } from "./defaults.js";
import type { Theme } from "../themes/index.js";
import type { WidgetType } from "../widgets/index.js";
import type { IconMode } from "../utils/icons.js";

export interface CcslConfig {
  theme: string;
  widgets: WidgetType[];
  separator: string;
  icons: IconMode;
  padding: number;
  customTheme?: Theme;
}

const explorer = cosmiconfig("ccsl", {
  searchPlaces: [
    ".ccslrc",
    ".ccslrc.json",
    ".ccslrc.yaml",
    ".ccslrc.yml",
    ".ccslrc.js",
    ".ccslrc.cjs",
    ".config/ccsl/config.json",
    "ccsl.config.js",
    "ccsl.config.cjs",
  ],
});

export async function loadConfig(searchFrom?: string): Promise<CcslConfig> {
  try {
    const result = await explorer.search(searchFrom);

    if (result && result.config) {
      return mergeConfig(defaultConfig, result.config);
    }
  } catch {
    // Config loading failed, use defaults
  }

  return { ...defaultConfig };
}

export async function loadConfigFromFile(filePath: string): Promise<CcslConfig> {
  try {
    const result = await explorer.load(filePath);

    if (result && result.config) {
      return mergeConfig(defaultConfig, result.config);
    }
  } catch {
    // Config loading failed, use defaults
  }

  return { ...defaultConfig };
}

function mergeConfig(defaults: CcslConfig, userConfig: Partial<CcslConfig>): CcslConfig {
  return {
    theme: userConfig.theme ?? defaults.theme,
    widgets: userConfig.widgets ?? defaults.widgets,
    separator: userConfig.separator ?? defaults.separator,
    icons: userConfig.icons ?? defaults.icons,
    padding: userConfig.padding ?? defaults.padding,
    customTheme: userConfig.customTheme,
  };
}

export function getConfigPath(scope: "local" | "global"): string {
  if (scope === "local") {
    return ".ccslrc.json";
  }
  const home = process.env.HOME || process.env.USERPROFILE || "~";
  return `${home}/.config/ccsl/config.json`;
}
