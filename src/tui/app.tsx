import React, { useState } from "react";
import { render, Box, Text, useApp, useInput } from "ink";
import SelectInput from "ink-select-input";
import { loadConfigForScope, getConfigPath, type CcslConfig } from "../config/loader.js";
import { themeNames } from "../themes/index.js";
import { formatStatusLine, sampleStatusInput } from "../formatter.js";
import { availableWidgets, type WidgetType } from "../widgets/index.js";
import {
  installToClaudeSettings,
  isInstalledInClaude,
  getCurrentClaudeCommand,
} from "../config/claude.js";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { dirname } from "path";

type Screen = "main" | "themes" | "widgets" | "settings" | "preview" | "install";

interface AppProps {
  initialConfig: CcslConfig;
  scope: "local" | "global";
}

function App({ initialConfig, scope }: AppProps) {
  const { exit } = useApp();
  const [screen, setScreen] = useState<Screen>("main");
  const [config, setConfig] = useState<CcslConfig>(initialConfig);
  const [message, setMessage] = useState<string>("");

  useInput((input, key) => {
    if (key.escape) {
      if (screen === "main") {
        exit();
      } else {
        setScreen("main");
      }
    }
    if (input === "q" && screen === "main") {
      exit();
    }
  });

  const saveConfig = () => {
    const configPath = getConfigPath(scope);
    try {
      const dir = dirname(configPath);
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
      writeFileSync(configPath, JSON.stringify(config, null, 2));
      setMessage("Configuration saved!");
      setTimeout(() => setMessage(""), 2000);
    } catch (err) {
      setMessage(`Error saving: ${err}`);
    }
  };

  const renderMain = () => {
    const items = [
      { label: "🎨 Select Theme", value: "themes" },
      { label: "📊 Configure Widgets", value: "widgets" },
      { label: "⚙️  General Settings", value: "settings" },
      { label: "👁️  Live Preview", value: "preview" },
      { label: "📦 Install to Claude Code", value: "install" },
      { label: "💾 Save Configuration", value: "save" },
      { label: "❌ Exit", value: "exit" },
    ];

    return (
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Text bold color="cyan">
            CCSL Configuration
          </Text>
          <Text color="gray"> ({scope})</Text>
        </Box>
        <SelectInput
          items={items}
          onSelect={(item) => {
            if (item.value === "exit") {
              exit();
            } else if (item.value === "save") {
              saveConfig();
            } else {
              setScreen(item.value as Screen);
            }
          }}
        />
        {message && (
          <Box marginTop={1}>
            <Text color="green">{message}</Text>
          </Box>
        )}
        <Box marginTop={1}>
          <Text color="gray">Press q or Esc to exit</Text>
        </Box>
      </Box>
    );
  };

  const renderThemes = () => {
    const items = themeNames.map((name) => ({
      label: `${name}${config.theme === name ? " (current)" : ""}`,
      value: name,
    }));

    return (
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Text bold color="cyan">
            🎨 Select Theme
          </Text>
        </Box>
        <SelectInput
          items={items}
          onSelect={(item) => {
            setConfig({ ...config, theme: item.value });
            setScreen("main");
          }}
        />
        <Box marginTop={1} flexDirection="column">
          <Text color="gray">Preview:</Text>
          <Text>{formatStatusLine(sampleStatusInput, config)}</Text>
        </Box>
        <Box marginTop={1}>
          <Text color="gray">Press Esc to go back</Text>
        </Box>
      </Box>
    );
  };

  const renderWidgets = () => {
    const items = availableWidgets.map((widget) => ({
      label: `${config.widgets.includes(widget) ? "[x]" : "[ ]"} ${widget}`,
      value: widget,
    }));

    return (
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Text bold color="cyan">
            📊 Configure Widgets
          </Text>
        </Box>
        <SelectInput
          items={items}
          onSelect={(item) => {
            const widget = item.value as WidgetType;
            const newWidgets = config.widgets.includes(widget)
              ? config.widgets.filter((w) => w !== widget)
              : [...config.widgets, widget];
            setConfig({ ...config, widgets: newWidgets });
          }}
        />
        <Box marginTop={1} flexDirection="column">
          <Text color="gray">Current order: {config.widgets.join(", ")}</Text>
          <Text>{formatStatusLine(sampleStatusInput, config)}</Text>
        </Box>
        <Box marginTop={1}>
          <Text color="gray">Press Esc to go back</Text>
        </Box>
      </Box>
    );
  };

  const renderSettings = () => {
    const iconOptions = [
      { label: `Icons: auto${config.icons === "auto" ? " (current)" : ""}`, value: "icon-auto" },
      { label: `Icons: nerd${config.icons === "nerd" ? " (current)" : ""}`, value: "icon-nerd" },
      {
        label: `Icons: unicode${config.icons === "unicode" ? " (current)" : ""}`,
        value: "icon-unicode",
      },
      { label: `Icons: ascii${config.icons === "ascii" ? " (current)" : ""}`, value: "icon-ascii" },
    ];

    const separatorOptions = [
      {
        label: `Separator: " │ "${config.separator === " │ " ? " (current)" : ""}`,
        value: "sep- │ ",
      },
      {
        label: `Separator: " | "${config.separator === " | " ? " (current)" : ""}`,
        value: "sep- | ",
      },
      {
        label: `Separator: " · "${config.separator === " · " ? " (current)" : ""}`,
        value: "sep- · ",
      },
      {
        label: `Separator: "  "${config.separator === "  " ? " (current)" : ""}`,
        value: "sep-  ",
      },
    ];

    const items = [...iconOptions, ...separatorOptions];

    return (
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Text bold color="cyan">
            ⚙️  General Settings
          </Text>
        </Box>
        <SelectInput
          items={items}
          onSelect={(item) => {
            if (item.value.startsWith("icon-")) {
              const iconMode = item.value.replace("icon-", "") as
                | "auto"
                | "nerd"
                | "unicode"
                | "ascii";
              setConfig({ ...config, icons: iconMode });
            } else if (item.value.startsWith("sep-")) {
              const sep = item.value.replace("sep-", "");
              setConfig({ ...config, separator: sep });
            }
          }}
        />
        <Box marginTop={1}>
          <Text>{formatStatusLine(sampleStatusInput, config)}</Text>
        </Box>
        <Box marginTop={1}>
          <Text color="gray">Press Esc to go back</Text>
        </Box>
      </Box>
    );
  };

  const renderPreview = () => {
    return (
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Text bold color="cyan">
            👁️  Live Preview
          </Text>
        </Box>
        <Box marginBottom={1} flexDirection="column">
          <Text color="gray">Theme: {config.theme}</Text>
          <Text color="gray">Widgets: {config.widgets.join(", ")}</Text>
          <Text color="gray">Icons: {config.icons}</Text>
        </Box>
        <Box marginBottom={1}>
          <Text bold>Output:</Text>
        </Box>
        <Text>{formatStatusLine(sampleStatusInput, config)}</Text>
        <Box marginTop={2}>
          <Text color="gray">Press Esc to go back</Text>
        </Box>
      </Box>
    );
  };

  const renderInstall = () => {
    const installed = isInstalledInClaude();
    const currentCmd = getCurrentClaudeCommand();

    const items = [
      { label: installed ? "🔄 Update Installation" : "📥 Install to Claude Code", value: "install" },
      { label: "⬅️  Back", value: "back" },
    ];

    return (
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Text bold color="cyan">
            📦 Claude Code Integration
          </Text>
        </Box>
        <Box marginBottom={1} flexDirection="column">
          {installed ? (
            <>
              <Text color="green">Status: Installed</Text>
              <Text color="gray">Command: {currentCmd}</Text>
            </>
          ) : (
            <Text color="yellow">Status: Not installed</Text>
          )}
        </Box>
        <SelectInput
          items={items}
          onSelect={(item) => {
            if (item.value === "install") {
              const success = installToClaudeSettings();
              if (success) {
                setMessage("Installed! Restart Claude Code to apply.");
              } else {
                setMessage("Installation failed. Check permissions.");
              }
              setTimeout(() => setMessage(""), 3000);
            } else {
              setScreen("main");
            }
          }}
        />
        {message && (
          <Box marginTop={1}>
            <Text color={message.includes("failed") ? "red" : "green"}>{message}</Text>
          </Box>
        )}
        <Box marginTop={1}>
          <Text color="gray">Press Esc to go back</Text>
        </Box>
      </Box>
    );
  };

  return (
    <Box padding={1} flexDirection="column">
      {screen === "main" && renderMain()}
      {screen === "themes" && renderThemes()}
      {screen === "widgets" && renderWidgets()}
      {screen === "settings" && renderSettings()}
      {screen === "preview" && renderPreview()}
      {screen === "install" && renderInstall()}
    </Box>
  );
}

export async function launchTui(scope: "local" | "global") {
  const config = await loadConfigForScope(scope);

  const { waitUntilExit } = render(<App initialConfig={config} scope={scope} />);
  await waitUntilExit();
}
