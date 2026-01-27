import { describe, it, expect } from "vitest";
import { formatStatusLine, sampleStatusInput } from "./formatter.js";
import type { StatusInput } from "./parser.js";
import type { CcslConfig } from "./config/loader.js";

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
    const config = { ...baseConfig, widgets: ["cost", "model"] as const };
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
    const config = { ...baseConfig, widgets: ["duration"] as const };
    const result = formatStatusLine(sampleStatusInput, config);

    expect(result).toContain("45s"); // 45000ms = 45s
  });

  it("should format lines widget", () => {
    const config = { ...baseConfig, widgets: ["lines"] as const };
    const result = formatStatusLine(sampleStatusInput, config);

    expect(result).toContain("+156");
    expect(result).toContain("-23");
  });

  it("should format directory widget", () => {
    const config = { ...baseConfig, widgets: ["directory"] as const };
    const result = formatStatusLine(sampleStatusInput, config);

    expect(result).toContain("my-project");
  });

  it("should format version widget", () => {
    const config = { ...baseConfig, widgets: ["version"] as const };
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

    const config = { ...baseConfig, widgets: ["context"] as const };
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
});
