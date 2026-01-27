import { z } from "zod";

// Schema for Claude Code status JSON input
export const StatusInputSchema = z
  .object({
    hook_event_name: z.string().optional(),
    session_id: z.string().optional(),
    transcript_path: z.string().optional(),
    cwd: z.string().optional(),
    model: z
      .object({
        id: z.string().optional(),
        display_name: z.string().optional(),
      })
      .optional(),
    workspace: z
      .object({
        current_dir: z.string().optional(),
        project_dir: z.string().optional(),
      })
      .optional(),
    version: z.string().optional(),
    output_style: z
      .object({
        name: z.string().optional(),
      })
      .optional(),
    cost: z
      .object({
        total_cost_usd: z.number().optional(),
        total_duration_ms: z.number().optional(),
        total_api_duration_ms: z.number().optional(),
        total_lines_added: z.number().optional(),
        total_lines_removed: z.number().optional(),
      })
      .optional(),
    context_window: z
      .object({
        total_input_tokens: z.number().optional(),
        total_output_tokens: z.number().optional(),
        context_window_size: z.number().optional(),
        used_percentage: z.number().optional(),
        remaining_percentage: z.number().optional(),
        current_usage: z
          .object({
            input_tokens: z.number().optional(),
            output_tokens: z.number().optional(),
            cache_creation_input_tokens: z.number().optional(),
            cache_read_input_tokens: z.number().optional(),
          })
          .nullable()
          .optional(),
      })
      .optional(),
  })
  .passthrough();

export type StatusInput = z.infer<typeof StatusInputSchema>;

export function parseStatusInput(input: string): StatusInput | null {
  try {
    const trimmed = input.trim();
    if (!trimmed) {
      return null;
    }
    const parsed = JSON.parse(trimmed);
    const result = StatusInputSchema.safeParse(parsed);

    if (result.success) {
      return result.data;
    }

    // If validation fails, still try to use the data
    // Claude Code may add new fields we don't know about
    return parsed as StatusInput;
  } catch {
    return null;
  }
}

export async function readStdin(): Promise<string> {
  return new Promise((resolve) => {
    let data = "";

    process.stdin.setEncoding("utf8");

    process.stdin.on("readable", () => {
      let chunk;
      while ((chunk = process.stdin.read()) !== null) {
        data += chunk;
      }
    });

    process.stdin.on("end", () => {
      resolve(data);
    });

    process.stdin.on("error", () => {
      resolve("");
    });
  });
}

export function isInteractiveMode(): boolean {
  return process.stdin.isTTY === true;
}
