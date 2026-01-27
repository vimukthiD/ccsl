import type { StatusInput } from "../parser.js";
import type { Theme } from "../themes/index.js";
import type { CcslConfig } from "../config/loader.js";
import { getIcon } from "../utils/icons.js";
import { applyStyle } from "../utils/colors.js";
import { formatNumber, formatDuration, formatCost } from "../utils/format.js";
import path from "path";

export type WidgetType =
  | "model"
  | "context"
  | "tokens"
  | "cost"
  | "duration"
  | "lines"
  | "directory"
  | "version";

export const availableWidgets: WidgetType[] = [
  "model",
  "context",
  "tokens",
  "cost",
  "duration",
  "lines",
  "directory",
  "version",
];

export interface WidgetResult {
  content: string;
  visible: boolean;
}

export function renderWidget(
  widget: WidgetType,
  input: StatusInput,
  theme: Theme,
  config: CcslConfig
): WidgetResult {
  switch (widget) {
    case "model":
      return renderModel(input, theme, config);
    case "context":
      return renderContext(input, theme, config);
    case "tokens":
      return renderTokens(input, theme, config);
    case "cost":
      return renderCostWidget(input, theme, config);
    case "duration":
      return renderDurationWidget(input, theme, config);
    case "lines":
      return renderLines(input, theme, config);
    case "directory":
      return renderDirectory(input, theme, config);
    case "version":
      return renderVersion(input, theme, config);
    default:
      return { content: "", visible: false };
  }
}

function renderModel(input: StatusInput, theme: Theme, config: CcslConfig): WidgetResult {
  const displayName = input.model?.display_name;
  if (!displayName) {
    return { content: "", visible: false };
  }

  const icon = getIcon("model", theme, config.icons);
  const text = icon ? `${icon} ${displayName}` : displayName;
  const content = applyStyle(text, theme.colors.model);

  return { content, visible: true };
}

function renderContext(input: StatusInput, theme: Theme, config: CcslConfig): WidgetResult {
  const percentage = input.context_window?.used_percentage;
  if (percentage === undefined) {
    return { content: "", visible: false };
  }

  const icon = getIcon("context", theme, config.icons);
  const roundedPercent = Math.round(percentage);
  const progressBar = renderProgressBar(percentage, theme);
  const value = `${roundedPercent}%`;
  const text = icon ? `${icon} ${progressBar} ${value}` : `${progressBar} ${value}`;

  // Color based on usage level
  let colorKey: "context" | "contextHigh" | "contextCritical" = "context";
  if (percentage >= 80) {
    colorKey = "contextCritical";
  } else if (percentage >= 60) {
    colorKey = "contextHigh";
  }

  const style = theme.colors[colorKey] || theme.colors.context;
  const content = applyStyle(text, style);

  return { content, visible: true };
}

function renderProgressBar(percentage: number, theme: Theme): string {
  const totalBars = 10;
  const filledBars = Math.round((percentage / 100) * totalBars);
  const emptyBars = totalBars - filledBars;

  // Use block characters for progress bar
  const filledChar = "█";
  const emptyChar = "░";

  // Color the filled portion based on usage level
  let filledStyle = theme.colors.context;
  if (percentage >= 80) {
    filledStyle = theme.colors.contextCritical || theme.colors.context;
  } else if (percentage >= 60) {
    filledStyle = theme.colors.contextHigh || theme.colors.context;
  }

  const filled = applyStyle(filledChar.repeat(filledBars), filledStyle);
  const empty = applyStyle(emptyChar.repeat(emptyBars), { fg: "#444444", dim: true });

  return `${filled}${empty}`;
}

function renderTokens(input: StatusInput, theme: Theme, config: CcslConfig): WidgetResult {
  const inputTokens = input.context_window?.total_input_tokens;
  const outputTokens = input.context_window?.total_output_tokens;

  if (inputTokens === undefined && outputTokens === undefined) {
    return { content: "", visible: false };
  }

  const icon = getIcon("tokens", theme, config.icons);
  const inStr = formatNumber(inputTokens ?? 0);
  const outStr = formatNumber(outputTokens ?? 0);
  const text = icon ? `${icon} ↑${inStr} ↓${outStr}` : `↑${inStr} ↓${outStr}`;
  const content = applyStyle(text, theme.colors.tokens);

  return { content, visible: true };
}

function renderCostWidget(input: StatusInput, theme: Theme, config: CcslConfig): WidgetResult {
  const costUsd = input.cost?.total_cost_usd;
  if (costUsd === undefined) {
    return { content: "", visible: false };
  }

  const icon = getIcon("cost", theme, config.icons);
  const value = formatCost(costUsd);
  const text = icon ? `${icon}${value}` : `$${value}`;
  const content = applyStyle(text, theme.colors.cost);

  return { content, visible: true };
}

function renderDurationWidget(input: StatusInput, theme: Theme, config: CcslConfig): WidgetResult {
  const durationMs = input.cost?.total_duration_ms;
  if (durationMs === undefined) {
    return { content: "", visible: false };
  }

  const icon = getIcon("duration", theme, config.icons);
  const value = formatDuration(durationMs);
  const text = icon ? `${icon} ${value}` : value;
  const content = applyStyle(text, theme.colors.duration);

  return { content, visible: true };
}

function renderLines(input: StatusInput, theme: Theme, config: CcslConfig): WidgetResult {
  const added = input.cost?.total_lines_added;
  const removed = input.cost?.total_lines_removed;

  if (added === undefined && removed === undefined) {
    return { content: "", visible: false };
  }

  const icon = getIcon("lines", theme, config.icons);

  const addedStr = applyStyle(`+${added ?? 0}`, theme.colors.linesAdded || theme.colors.lines);
  const removedStr = applyStyle(`-${removed ?? 0}`, theme.colors.linesRemoved || theme.colors.lines);

  const text = icon ? `${icon} ${addedStr} ${removedStr}` : `${addedStr} ${removedStr}`;

  return { content: text, visible: true };
}

function renderDirectory(input: StatusInput, theme: Theme, config: CcslConfig): WidgetResult {
  const dir = input.workspace?.current_dir || input.cwd;
  if (!dir) {
    return { content: "", visible: false };
  }

  const icon = getIcon("directory", theme, config.icons);
  const dirName = path.basename(dir);
  const text = icon ? `${icon} ${dirName}` : dirName;
  const content = applyStyle(text, theme.colors.directory);

  return { content, visible: true };
}

function renderVersion(input: StatusInput, theme: Theme, config: CcslConfig): WidgetResult {
  const version = input.version;
  if (!version) {
    return { content: "", visible: false };
  }

  const icon = getIcon("version", theme, config.icons);
  const text = icon ? `${icon}${version}` : `v${version}`;
  const content = applyStyle(text, theme.colors.version);

  return { content, visible: true };
}
