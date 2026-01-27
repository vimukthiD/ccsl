import type { CcslConfig } from "./loader.js";
import type { WidgetType } from "../widgets/index.js";

export const defaultWidgets: WidgetType[] = ["model", "context", "tokens", "cost"];

export const defaultConfig: CcslConfig = {
  theme: "minimal",
  widgets: defaultWidgets,
  separator: " │ ",
  icons: "auto",
  padding: 1,
};
