import type { ColorStyle } from "../utils/colors.js";
import type { IconKey } from "../utils/icons.js";

export interface ThemeColors {
  model?: ColorStyle;
  context?: ColorStyle;
  contextHigh?: ColorStyle;
  contextCritical?: ColorStyle;
  tokens?: ColorStyle;
  cost?: ColorStyle;
  duration?: ColorStyle;
  lines?: ColorStyle;
  linesAdded?: ColorStyle;
  linesRemoved?: ColorStyle;
  directory?: ColorStyle;
  version?: ColorStyle;
  separator?: ColorStyle;
}

export interface Theme {
  name: string;
  colors: ThemeColors;
  icons?: Partial<Record<IconKey, string>>;
}

// Neon theme - Vibrant cyberpunk
const neonTheme: Theme = {
  name: "neon",
  colors: {
    model: { fg: "#00ffff", bold: true },
    context: { fg: "#ff00ff" },
    contextHigh: { fg: "#ffff00" },
    contextCritical: { fg: "#ff0000", bold: true },
    tokens: { fg: "#00ff00" },
    cost: { fg: "#ffff00" },
    duration: { fg: "#00aaff" },
    lines: { fg: "#ff6600" },
    linesAdded: { fg: "#00ff00" },
    linesRemoved: { fg: "#ff0066" },
    directory: { fg: "#00ffff" },
    version: { fg: "#aaaaff" },
    separator: { fg: "#666666" },
  },
};

// Rainbow theme - Colorful gradient
const rainbowTheme: Theme = {
  name: "rainbow",
  colors: {
    model: { fg: "#ff0000", bold: true },
    context: { fg: "#ff7f00" },
    contextHigh: { fg: "#ffff00" },
    contextCritical: { fg: "#ff0000", bold: true },
    tokens: { fg: "#00ff00" },
    cost: { fg: "#0000ff" },
    duration: { fg: "#4b0082" },
    lines: { fg: "#9400d3" },
    linesAdded: { fg: "#00ff00" },
    linesRemoved: { fg: "#ff0000" },
    directory: { fg: "#ff7f00" },
    version: { fg: "#9400d3" },
    separator: { fg: "#888888" },
  },
};

// Ocean theme - Cool blues and teals
const oceanTheme: Theme = {
  name: "ocean",
  colors: {
    model: { fg: "#00bcd4", bold: true },
    context: { fg: "#2d8b8b" },
    contextHigh: { fg: "#4dd0e1" },
    contextCritical: { fg: "#ff5252", bold: true },
    tokens: { fg: "#80deea" },
    cost: { fg: "#4dd0e1" },
    duration: { fg: "#0288d1" },
    lines: { fg: "#26c6da" },
    linesAdded: { fg: "#69f0ae" },
    linesRemoved: { fg: "#ff5252" },
    directory: { fg: "#00bcd4" },
    version: { fg: "#80deea" },
    separator: { fg: "#37474f" },
  },
};

// Minimal theme - Clean and subtle (default)
const minimalTheme: Theme = {
  name: "minimal",
  colors: {
    model: { fg: "#888888" },
    context: { fg: "#ffffff" },
    contextHigh: { fg: "#e5c07b" },
    contextCritical: { fg: "#e06c75", bold: true },
    tokens: { fg: "#666666", dim: true },
    cost: { fg: "#61afef" },
    duration: { fg: "#666666", dim: true },
    lines: { fg: "#abb2bf" },
    linesAdded: { fg: "#98c379" },
    linesRemoved: { fg: "#e06c75" },
    directory: { fg: "#888888" },
    version: { fg: "#5c6370" },
    separator: { fg: "#444444" },
  },
  icons: {
    model: "",
    context: "",
    tokens: "",
    duration: "",
    lines: "",
    directory: "",
  },
};

// Monochrome theme - Grayscale
const monochromeTheme: Theme = {
  name: "monochrome",
  colors: {
    model: { fg: "#ffffff", bold: true },
    context: { fg: "#cccccc" },
    contextHigh: { fg: "#ffffff", bold: true },
    contextCritical: { fg: "#ffffff", bold: true, underline: true },
    tokens: { fg: "#aaaaaa" },
    cost: { fg: "#999999" },
    duration: { fg: "#888888" },
    lines: { fg: "#777777" },
    linesAdded: { fg: "#cccccc" },
    linesRemoved: { fg: "#888888" },
    directory: { fg: "#aaaaaa" },
    version: { fg: "#666666" },
    separator: { fg: "#444444" },
  },
  icons: {
    model: "",
    context: "",
    tokens: "",
    duration: "",
    lines: "",
    directory: "",
  },
};

// Corporate theme - Professional blues
const corporateTheme: Theme = {
  name: "corporate",
  colors: {
    model: { fg: "#3b82f6", bold: true },
    context: { fg: "#64748b" },
    contextHigh: { fg: "#f59e0b" },
    contextCritical: { fg: "#ef4444", bold: true },
    tokens: { fg: "#4682b4" },
    cost: { fg: "#6b7280" },
    duration: { fg: "#64748b" },
    lines: { fg: "#94a3b8" },
    linesAdded: { fg: "#22c55e" },
    linesRemoved: { fg: "#ef4444" },
    directory: { fg: "#3b82f6" },
    version: { fg: "#94a3b8" },
    separator: { fg: "#334155" },
  },
};

export const themes: Record<string, Theme> = {
  neon: neonTheme,
  rainbow: rainbowTheme,
  ocean: oceanTheme,
  minimal: minimalTheme,
  monochrome: monochromeTheme,
  corporate: corporateTheme,
};

export const themeNames = Object.keys(themes);

export function getTheme(name: string): Theme {
  return themes[name] || themes.minimal;
}
