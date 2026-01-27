import { describe, it, expect } from "vitest";
import { parseStatusInput, isInteractiveMode } from "./parser.js";

describe("parseStatusInput", () => {
  it("should parse valid Claude Code JSON input", () => {
    const input = JSON.stringify({
      hook_event_name: "Status",
      session_id: "abc123",
      model: {
        id: "claude-opus-4-1",
        display_name: "Opus",
      },
      workspace: {
        current_dir: "/home/user/project",
        project_dir: "/home/user/project",
      },
      version: "1.0.80",
      cost: {
        total_cost_usd: 0.0234,
        total_duration_ms: 45000,
        total_lines_added: 156,
        total_lines_removed: 23,
      },
      context_window: {
        total_input_tokens: 15234,
        total_output_tokens: 4521,
        context_window_size: 200000,
        used_percentage: 42.5,
        remaining_percentage: 57.5,
      },
    });

    const result = parseStatusInput(input);

    expect(result).not.toBeNull();
    expect(result?.model?.display_name).toBe("Opus");
    expect(result?.model?.id).toBe("claude-opus-4-1");
    expect(result?.cost?.total_cost_usd).toBe(0.0234);
    expect(result?.context_window?.used_percentage).toBe(42.5);
    expect(result?.workspace?.current_dir).toBe("/home/user/project");
  });

  it("should handle empty input", () => {
    const result = parseStatusInput("");
    expect(result).toBeNull();
  });

  it("should handle invalid JSON", () => {
    const result = parseStatusInput("not json");
    expect(result).toBeNull();
  });

  it("should handle partial input", () => {
    const input = JSON.stringify({
      model: {
        display_name: "Sonnet",
      },
      cost: {
        total_cost_usd: 0.15,
      },
    });

    const result = parseStatusInput(input);

    expect(result).not.toBeNull();
    expect(result?.model?.display_name).toBe("Sonnet");
    expect(result?.cost?.total_cost_usd).toBe(0.15);
    expect(result?.context_window).toBeUndefined();
  });

  it("should handle context_window with current_usage", () => {
    const input = JSON.stringify({
      context_window: {
        total_input_tokens: 1000,
        total_output_tokens: 500,
        context_window_size: 200000,
        used_percentage: 10,
        current_usage: {
          input_tokens: 800,
          output_tokens: 400,
          cache_creation_input_tokens: 100,
          cache_read_input_tokens: 50,
        },
      },
    });

    const result = parseStatusInput(input);

    expect(result?.context_window?.current_usage?.input_tokens).toBe(800);
    expect(result?.context_window?.current_usage?.cache_read_input_tokens).toBe(50);
  });

  it("should handle null current_usage", () => {
    const input = JSON.stringify({
      context_window: {
        total_input_tokens: 0,
        total_output_tokens: 0,
        context_window_size: 200000,
        used_percentage: 0,
        current_usage: null,
      },
    });

    const result = parseStatusInput(input);

    expect(result?.context_window?.current_usage).toBeNull();
  });

  it("should handle whitespace in input", () => {
    const input = `  {"model": {"display_name": "Test"}}  `;

    const result = parseStatusInput(input);

    expect(result?.model?.display_name).toBe("Test");
  });

  it("should pass through unknown fields", () => {
    const input = JSON.stringify({
      model: { display_name: "Test" },
      unknown_field: "some value",
      another_new_field: 123,
    });

    const result = parseStatusInput(input);

    expect(result).not.toBeNull();
    expect(result?.model?.display_name).toBe("Test");
    // passthrough() allows unknown fields
    expect((result as Record<string, unknown>).unknown_field).toBe("some value");
  });
});

describe("isInteractiveMode", () => {
  it("should return boolean", () => {
    const result = isInteractiveMode();
    expect(typeof result).toBe("boolean");
  });
});
