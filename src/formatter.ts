import type { StatusInput } from "./parser.js";
import type { CcslConfig } from "./config/loader.js";
import { themes } from "./themes/index.js";
import { renderWidget } from "./widgets/index.js";
import { applyStyle } from "./utils/colors.js";

export function formatStatusLine(input: StatusInput, config: CcslConfig): string {
  const theme = config.customTheme || themes[config.theme] || themes.minimal;
  const renderedWidgets: string[] = [];

  for (const widget of config.widgets) {
    const result = renderWidget(widget, input, theme, config);
    if (result.visible && result.content) {
      renderedWidgets.push(result.content);
    }
  }

  if (renderedWidgets.length === 0) {
    return "";
  }

  const separator = applyStyle(config.separator, theme.colors.separator);
  const statusLine = renderedWidgets.join(separator);

  // Add padding
  const padding = " ".repeat(config.padding);

  // Prepend ANSI reset to ensure clean state
  return `\x1b[0m${padding}${statusLine}${padding}`;
}

// Sample data for preview
export const sampleStatusInput: StatusInput = {
  hook_event_name: "Status",
  session_id: "sample-session-123",
  model: {
    id: "claude-opus-4-1",
    display_name: "Opus",
  },
  workspace: {
    current_dir: "/home/user/my-project",
    project_dir: "/home/user/my-project",
  },
  version: "1.0.80",
  cost: {
    total_cost_usd: 0.0234,
    total_duration_ms: 45000,
    total_api_duration_ms: 2300,
    total_lines_added: 156,
    total_lines_removed: 23,
  },
  context_window: {
    total_input_tokens: 15234,
    total_output_tokens: 4521,
    context_window_size: 200000,
    used_percentage: 42.5,
    remaining_percentage: 57.5,
    current_usage: {
      input_tokens: 8500,
      output_tokens: 1200,
      cache_creation_input_tokens: 5000,
      cache_read_input_tokens: 2000,
    },
  },
};
