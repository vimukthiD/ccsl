import { describe, it, expect } from "vitest";
import { formatStatusLine, sampleStatusInput } from "./formatter.js";
import type { StatusInput } from "./parser.js";
import type { CcslConfig } from "./config/loader.js";
import type { WidgetType } from "./widgets/index.js";

describe("formatStatusLine", () => {
  const baseConfig: CcslConfig = {
    theme: "minimal",
    widgets: ["model", "context", "tokens", "cost"],
    separator: " | ",
    icons: "ascii",
    padding: 0,
  };

  it("should format all widgets from sample input", () => {
    const result = formatStatusLine(sampleStatusInput, baseConfig);

    expect(result).toContain("Opus");
    expect(result).toContain("43%"); // context percentage (42.5 rounds to 43)
    expect(result).toContain("15.2k"); // input tokens
    expect(result).toContain("4.5k"); // output tokens
    expect(result).toContain("0.02"); // cost
  });

  it("should use custom separator", () => {
    const config = { ...baseConfig, separator: " · " };
    const result = formatStatusLine(sampleStatusInput, config);

    expect(result).toContain(" · ");
  });

  it("should respect widget order", () => {
    const config = { ...baseConfig, widgets: ["cost", "model"] as WidgetType[] };
    const result = formatStatusLine(sampleStatusInput, config);

    const costIndex = result.indexOf("0.02");
    const modelIndex = result.indexOf("Opus");

    expect(costIndex).toBeLessThan(modelIndex);
  });

  it("should handle missing data gracefully", () => {
    const input: StatusInput = {
      model: {
        display_name: "Sonnet",
      },
    };

    const result = formatStatusLine(input, baseConfig);

    expect(result).toContain("Sonnet");
    expect(result).not.toContain("undefined");
    expect(result).not.toContain("null");
  });

  it("should format duration widget", () => {
    const config = { ...baseConfig, widgets: ["duration"] as WidgetType[] };
    const result = formatStatusLine(sampleStatusInput, config);

    expect(result).toContain("45s"); // 45000ms = 45s
  });

  it("should format lines widget", () => {
    const config = { ...baseConfig, widgets: ["lines"] as WidgetType[] };
    const result = formatStatusLine(sampleStatusInput, config);

    expect(result).toContain("+156");
    expect(result).toContain("-23");
  });

  it("should format directory widget", () => {
    const config = { ...baseConfig, widgets: ["directory"] as WidgetType[] };
    const result = formatStatusLine(sampleStatusInput, config);

    expect(result).toContain("my-project");
  });

  it("should format version widget", () => {
    const config = { ...baseConfig, widgets: ["version"] as WidgetType[] };
    const result = formatStatusLine(sampleStatusInput, config);

    expect(result).toContain("1.0.80");
  });

  it("should return empty string when no widgets have data", () => {
    const input: StatusInput = {};
    const result = formatStatusLine(input, baseConfig);

    // Should only contain ANSI reset and padding
    // eslint-disable-next-line no-control-regex
    expect(result.replace(/\x1b\[0m/g, "").trim()).toBe("");
  });

  it("should add padding", () => {
    const config = { ...baseConfig, padding: 2 };
    const result = formatStatusLine(sampleStatusInput, config);

    // Should start with ANSI reset + 2 spaces
    expect(result.startsWith("\x1b[0m  ")).toBe(true);
  });

  it("should color context based on usage level", () => {
    // High usage (60-80%)
    const highUsage: StatusInput = {
      ...sampleStatusInput,
      context_window: {
        ...sampleStatusInput.context_window!,
        used_percentage: 70,
      },
    };

    const config = { ...baseConfig, widgets: ["context"] as WidgetType[] };
    const result = formatStatusLine(highUsage, config);

    expect(result).toContain("70%");
  });

  it("should handle all themes", () => {
    const themes = ["neon", "rainbow", "ocean", "minimal", "monochrome", "corporate"];

    for (const theme of themes) {
      const config = { ...baseConfig, theme };
      const result = formatStatusLine(sampleStatusInput, config);

      expect(result).toContain("Opus");
    }
  });

  it("should render worktree from JSON (workspace.git_worktree)", () => {
    const config = { ...baseConfig, widgets: ["worktree"] as WidgetType[] };
    const input: StatusInput = {
      workspace: { current_dir: "/x", git_worktree: "feature-payments" },
    };
    const result = formatStatusLine(input, config);
    expect(result).toContain("feature-payments");
  });

  it("should prefer worktree.name over workspace.git_worktree", () => {
    const config = { ...baseConfig, widgets: ["worktree"] as WidgetType[] };
    const input: StatusInput = {
      workspace: { current_dir: "/x", git_worktree: "linked" },
      worktree: { name: "session-name" },
    };
    const result = formatStatusLine(input, config);
    expect(result).toContain("session-name");
    expect(result).not.toContain("linked");
  });

  it("should hide worktree widget when no worktree data present", () => {
    const config = { ...baseConfig, widgets: ["worktree"] as WidgetType[] };
    const result = formatStatusLine({ workspace: { current_dir: "/x" } }, config);
    // eslint-disable-next-line no-control-regex
    expect(result.replace(/\x1b\[0m/g, "").trim()).toBe("");
  });

  it("should render rateLimit from rate_limits.five_hour", () => {
    const config = { ...baseConfig, widgets: ["rateLimit"] as WidgetType[] };
    const input: StatusInput = {
      rate_limits: { five_hour: { used_percentage: 24, resets_at: 1738425600 } },
    };
    const result = formatStatusLine(input, config);
    expect(result).toContain("24%");
    expect(result).toContain("resets");
  });

  it("should render weeklyLimit from rate_limits.seven_day", () => {
    const config = { ...baseConfig, widgets: ["weeklyLimit"] as WidgetType[] };
    const input: StatusInput = {
      rate_limits: { seven_day: { used_percentage: 41, resets_at: 1738857600 } },
    };
    const result = formatStatusLine(input, config);
    expect(result).toContain("41%");
  });

  it("should hide rateLimit widget when rate_limits absent", () => {
    const config = { ...baseConfig, widgets: ["rateLimit"] as WidgetType[] };
    const result = formatStatusLine({ model: { display_name: "Opus" } }, config);
    // eslint-disable-next-line no-control-regex
    expect(result.replace(/\x1b\[0m/g, "").trim()).toBe("");
  });

  it("should render branch from worktree.branch without invoking git", () => {
    const config = { ...baseConfig, widgets: ["branch"] as WidgetType[] };
    const input: StatusInput = {
      workspace: { current_dir: "/nonexistent/path/that/cannot/exist" },
      worktree: { branch: "feature/payments" },
    };
    const result = formatStatusLine(input, config);
    expect(result).toContain("feature/payments");
  });
});
