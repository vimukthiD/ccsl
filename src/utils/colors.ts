import chalk from "chalk";

export interface ColorStyle {
  fg?: string;
  bg?: string;
  bold?: boolean;
  dim?: boolean;
  italic?: boolean;
  underline?: boolean;
}

export function applyStyle(text: string, style?: ColorStyle): string {
  if (!style) return text;

  let result = chalk;

  if (style.fg) {
    result = result.hex(style.fg);
  }
  if (style.bg) {
    result = result.bgHex(style.bg);
  }
  if (style.bold) {
    result = result.bold;
  }
  if (style.dim) {
    result = result.dim;
  }
  if (style.italic) {
    result = result.italic;
  }
  if (style.underline) {
    result = result.underline;
  }

  return result(text);
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}
