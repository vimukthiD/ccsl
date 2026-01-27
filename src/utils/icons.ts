import type { Theme } from "../themes/index.js";

export type IconMode = "auto" | "nerd" | "unicode" | "ascii";
export type IconKey =
  | "model"
  | "context"
  | "tokens"
  | "cost"
  | "duration"
  | "lines"
  | "directory"
  | "version";

const nerdIcons: Record<IconKey, string> = {
  model: "◈",
  context: "◐",
  tokens: "󰊄",
  cost: "$",
  duration: "⏱",
  lines: "±",
  directory: "",
  version: "",
};

const unicodeIcons: Record<IconKey, string> = {
  model: "◈",
  context: "◐",
  tokens: "⇅",
  cost: "$",
  duration: "⏱",
  lines: "±",
  directory: "📁",
  version: "v",
};

const asciiIcons: Record<IconKey, string> = {
  model: "*",
  context: "%",
  tokens: "",
  cost: "$",
  duration: "",
  lines: "",
  directory: "",
  version: "v",
};

let detectedIconMode: IconMode | null = null;

function detectIconSupport(): IconMode {
  if (detectedIconMode !== null) {
    return detectedIconMode;
  }

  const term = process.env.TERM || "";
  const termProgram = process.env.TERM_PROGRAM || "";
  const nerdFontEnv = process.env.NERD_FONT || "";

  // Explicit Nerd Font environment variable
  if (nerdFontEnv === "1" || nerdFontEnv.toLowerCase() === "true") {
    detectedIconMode = "nerd";
    return "nerd";
  }

  // Known Nerd Font capable terminals
  const nerdFontTerminals = ["iTerm.app", "WezTerm", "Alacritty", "kitty", "Hyper", "Tabby"];

  if (nerdFontTerminals.some((t) => termProgram.includes(t))) {
    detectedIconMode = "nerd";
    return "nerd";
  }

  // Modern terminals with good Unicode support
  if (term.includes("256color") || term.includes("truecolor")) {
    detectedIconMode = "unicode";
    return "unicode";
  }

  detectedIconMode = "ascii";
  return "ascii";
}

export function getIcon(key: IconKey, theme: Theme, mode: IconMode): string {
  // Check theme-specific icons first
  if (theme.icons && theme.icons[key]) {
    return theme.icons[key] || "";
  }

  // Determine which icon set to use
  const effectiveMode = mode === "auto" ? detectIconSupport() : mode;

  switch (effectiveMode) {
    case "nerd":
      return nerdIcons[key] || "";
    case "unicode":
      return unicodeIcons[key] || "";
    case "ascii":
      return asciiIcons[key] || "";
    default:
      return unicodeIcons[key] || "";
  }
}

export function getAllIcons(mode: IconMode): Record<IconKey, string> {
  const effectiveMode = mode === "auto" ? detectIconSupport() : mode;

  switch (effectiveMode) {
    case "nerd":
      return { ...nerdIcons };
    case "unicode":
      return { ...unicodeIcons };
    case "ascii":
      return { ...asciiIcons };
    default:
      return { ...unicodeIcons };
  }
}
