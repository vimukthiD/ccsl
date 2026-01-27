# @vimukthid/ccsl - Claude Code Status Line

## 1. Product Overview

**ccsl** (Claude Code Status Line) is an npm package that provides a customizable status line formatter for Claude Code CLI. It receives status data from Claude Code via stdin and outputs beautifully formatted, themed status lines.

### Core Functions
1. **Status Line Formatter** - Receives Claude Code status JSON via stdin and outputs formatted ANSI-colored status line
2. **Interactive TUI Configuration** - When run without piped input, launches an interactive configuration interface
3. **Claude Code Integration** - Automatically configures `~/.claude/settings.json` with the correct statusLine command

### Package Details
- **Name:** `@vimukthid/ccsl`
- **Runtime:** Node.js LTS (v22.x)
- **License:** MIT

---

## 2. How It Works

### Integration with Claude Code

Claude Code supports custom status lines via the `statusLine` setting in `~/.claude/settings.json`:

```json
{
  "statusLine": {
    "type": "command",
    "command": "npx @vimukthid/ccsl"
  }
}
```

When configured, Claude Code:
1. Passes JSON data via stdin to the command
2. Reads the first line of stdout as the status line
3. Updates the status line when conversation messages change (max every 300ms)

### Input Format (from Claude Code)

ccsl receives JSON via stdin with the following structure:

```json
{
  "hook_event_name": "Status",
  "session_id": "abc123...",
  "transcript_path": "/path/to/transcript.json",
  "cwd": "/current/working/directory",
  "model": {
    "id": "claude-opus-4-1",
    "display_name": "Opus"
  },
  "workspace": {
    "current_dir": "/current/working/directory",
    "project_dir": "/original/project/directory"
  },
  "version": "1.0.80",
  "output_style": {
    "name": "default"
  },
  "cost": {
    "total_cost_usd": 0.01234,
    "total_duration_ms": 45000,
    "total_api_duration_ms": 2300,
    "total_lines_added": 156,
    "total_lines_removed": 23
  },
  "context_window": {
    "total_input_tokens": 15234,
    "total_output_tokens": 4521,
    "context_window_size": 200000,
    "used_percentage": 42.5,
    "remaining_percentage": 57.5,
    "current_usage": {
      "input_tokens": 8500,
      "output_tokens": 1200,
      "cache_creation_input_tokens": 5000,
      "cache_read_input_tokens": 2000
    }
  }
}
```

---

## 3. Features

### 3.1 Status Line Widgets

| Widget | Description | Example Output |
|--------|-------------|----------------|
| Model | Current Claude model display name | `◈ Opus` |
| Context | Context window usage percentage | `◐ 42%` |
| Tokens | Input/Output token counts | `↑15.2k ↓4.5k` |
| Cost | Session cost in USD | `$0.01` |
| Duration | Session duration | `⏱ 45s` |
| Lines | Lines added/removed | `+156 -23` |
| Directory | Current working directory | `📁 my-project` |
| Version | Claude Code version | `v1.0.80` |

### 3.2 Configuration Scopes

| Scope | Location | Priority |
|-------|----------|----------|
| Local | `./.ccslrc.json` | Highest |
| Global | `~/.config/ccsl/config.json` | Default |

### 3.3 Icon Support
- **Nerd Font Icons** - Rich glyphs when Nerd Fonts detected
- **Unicode Icons** - Standard Unicode symbols as fallback
- **ASCII Fallback** - Plain text for basic terminals
- Auto-detection with manual override option

---

## 4. Built-in Themes

### 4.1 Colorful Themes

#### `neon`
Vibrant cyberpunk-inspired with electric blues, magentas, and greens
```
◈ Opus │ ◐ 42% │ ↑15.2k ↓4.5k │ $0.01 │ ⏱ 45s
[cyan]   [magenta] [green]       [yellow] [blue]
```

#### `rainbow`
Smooth color transitions across segments
```
◈ Opus │ ◐ 42% │ ↑15.2k ↓4.5k │ $0.01 │ ⏱ 45s
[red→orange→yellow→green→blue→purple]
```

#### `ocean`
Cool blues and teals inspired by deep sea colors
```
◈ Opus │ ◐ 42% │ ↑15.2k ↓4.5k │ $0.01 │ ⏱ 45s
[deep-blue→teal→cyan→aqua]
```

### 4.2 Professional Themes

#### `minimal` (default)
Clean, understated with subtle grays and single accent color
```
Opus | 42% | ↑15.2k ↓4.5k | $0.01 | 45s
[gray→white→dim→accent]
```

#### `monochrome`
Pure grayscale with brightness indicating importance
```
Opus · 42% · 15.2k/4.5k · $0.01 · 45s
[bright→dim gradient]
```

#### `corporate`
Muted blues and grays, enterprise-friendly appearance
```
◈ Opus │ ◐ 42% │ ↑15.2k ↓4.5k │ $0.01 │ ⏱ 45s
[navy→slate→steel-blue]
```

---

## 5. Technical Architecture

### 5.1 Project Structure
```
@vimukthid/ccsl/
├── src/
│   ├── index.ts           # Main entry point & exports
│   ├── cli.ts             # CLI entry, stdin detection, mode routing
│   ├── parser.ts          # Claude Code JSON input parser
│   ├── formatter.ts       # Status line output formatting
│   ├── config/
│   │   ├── loader.ts      # Config file discovery & loading
│   │   ├── schema.ts      # Zod schema validation
│   │   ├── defaults.ts    # Default configuration
│   │   └── claude.ts      # Claude Code settings.json management
│   ├── tui/
│   │   ├── app.tsx        # TUI application (Ink/React)
│   │   ├── screens/
│   │   │   ├── main.tsx   # Main menu
│   │   │   ├── widgets.tsx # Widget configuration
│   │   │   ├── themes.tsx # Theme selection/preview
│   │   │   └── install.tsx # Claude Code installation
│   │   └── components/    # Reusable TUI components
│   ├── themes/
│   │   ├── index.ts       # Theme registry
│   │   └── [theme].ts     # Individual theme definitions
│   ├── widgets/
│   │   ├── index.ts       # Widget registry
│   │   └── [widget].ts    # Individual widget renderers
│   └── utils/
│       ├── icons.ts       # Icon/fallback logic
│       ├── colors.ts      # ANSI color utilities
│       └── format.ts      # Number/time formatting
├── package.json
├── tsconfig.json
└── README.md
```

### 5.2 Dependencies

| Package | Purpose | Version |
|---------|---------|---------|
| `ink` | React-based TUI framework | ^6.x |
| `ink-select-input` | Selection menus for TUI | ^6.x |
| `chalk` | Terminal string styling | ^5.x |
| `zod` | Schema validation | ^3.x |
| `react` | UI component library | ^19.x |

**Dev Dependencies:**
- `typescript` ^5.x
- `@types/node` ^22.x
- `tsup` - Build tool
- `vitest` - Testing
- `eslint` + `prettier`

### 5.3 Node.js Version
- **Minimum:** Node.js 22.x LTS
- **engines** field in package.json: `"node": ">=22.0.0"`

---

## 6. Configuration Schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "theme": {
      "type": "string",
      "default": "minimal"
    },
    "widgets": {
      "type": "array",
      "items": {
        "enum": ["model", "context", "tokens", "cost", "duration", "lines", "directory", "version"]
      },
      "default": ["model", "context", "tokens", "cost"]
    },
    "separator": {
      "type": "string",
      "default": " │ "
    },
    "icons": {
      "type": "string",
      "enum": ["auto", "nerd", "unicode", "ascii"],
      "default": "auto"
    },
    "padding": {
      "type": "number",
      "default": 1
    },
    "customTheme": {
      "type": "object",
      "description": "User-defined theme colors"
    }
  }
}
```

---

## 7. CLI Interface

### 7.1 Usage Modes

```bash
# Status line mode (called by Claude Code with piped JSON)
# This is invoked automatically by Claude Code
echo '{"model":{"display_name":"Opus"},...}' | npx @vimukthid/ccsl

# Interactive TUI - configure settings
npx @vimukthid/ccsl

# Commands
ccsl                  # Launch TUI configuration
ccsl install          # Install to Claude Code settings.json
ccsl uninstall        # Remove from Claude Code settings.json
ccsl theme <name>     # Quick switch theme
ccsl theme --list     # List available themes
ccsl preview          # Preview with sample data
ccsl config --global  # Edit global config
ccsl config --local   # Edit local project config
ccsl --version        # Show version
ccsl --help           # Show help
```

### 7.2 TUI Screens

**Main Menu:**
- 🎨 Select Theme
- 📊 Configure Widgets
- ⚙️  General Settings
- 👁️  Live Preview
- 📦 Install to Claude Code
- 💾 Save Configuration
- ❌ Exit

**Theme Selection:**
- List all built-in themes with live preview
- Option to create/edit custom theme

**Widget Configuration:**
- Toggle widgets on/off
- Reorder widgets via keyboard
- Configure individual widget options

**Install Screen:**
- Shows current Claude Code configuration
- One-click install/update
- Backup existing configuration

---

## 8. Custom Theme Format

```json
{
  "customTheme": {
    "name": "my-theme",
    "colors": {
      "model": { "fg": "#61afef", "bold": true },
      "context": { "fg": "#98c379" },
      "contextHigh": { "fg": "#e5c07b" },
      "contextCritical": { "fg": "#e06c75" },
      "tokens": { "fg": "#c678dd" },
      "cost": { "fg": "#e06c75" },
      "duration": { "fg": "#56b6c2" },
      "lines": { "fg": "#d19a66" },
      "linesAdded": { "fg": "#98c379" },
      "linesRemoved": { "fg": "#e06c75" },
      "directory": { "fg": "#61afef" },
      "version": { "fg": "#abb2bf" },
      "separator": { "fg": "#5c6370" }
    },
    "icons": {
      "model": "◈",
      "context": "◐",
      "tokens": "󰊄",
      "cost": "$",
      "duration": "⏱",
      "lines": "±",
      "directory": "📁",
      "version": "v"
    }
  }
}
```

---

## 9. Claude Code Integration

### 9.1 Automatic Installation

The TUI provides one-click installation that:

1. Reads existing `~/.claude/settings.json` (or creates it)
2. Adds/updates the `statusLine` configuration:
   ```json
   {
     "statusLine": {
       "type": "command",
       "command": "npx @vimukthid/ccsl"
     }
   }
   ```
3. Preserves all other existing settings
4. Creates a backup of the original file

### 9.2 Manual Installation

Add to `~/.claude/settings.json`:

```json
{
  "statusLine": {
    "type": "command",
    "command": "npx @vimukthid/ccsl"
  }
}
```

Or for global npm install:
```json
{
  "statusLine": {
    "type": "command",
    "command": "ccsl"
  }
}
```

---

## 10. Publishing to npm

### 10.1 Package.json Key Fields
```json
{
  "name": "@vimukthid/ccsl",
  "version": "1.0.0",
  "type": "module",
  "description": "Customizable status line formatter for Claude Code CLI",
  "main": "dist/index.js",
  "bin": {
    "ccsl": "dist/cli.js"
  },
  "files": ["dist"],
  "engines": {
    "node": ">=22.0.0"
  },
  "keywords": [
    "claude",
    "claude-code",
    "cli",
    "status-line",
    "terminal",
    "tui",
    "anthropic"
  ]
}
```

### 10.2 Publish Checklist
- [ ] npm account with @vimukthid scope
- [ ] `npm login`
- [ ] Version bump
- [ ] Build: `npm run build`
- [ ] Test: `npm test`
- [ ] Publish: `npm publish --access public`

---

## 11. Success Metrics

- Clean installation via `npm install -g @vimukthid/ccsl`
- TUI launches within 500ms
- Status line formatting under 50ms
- Zero runtime errors with valid Claude Code JSON
- Graceful handling of missing/null fields
- ANSI colors render correctly in Claude Code

---

## 12. Future Considerations (v2.0+)

- Theme marketplace/sharing
- Plugin system for custom widgets
- Multiple status lines support
- Powerline-style separators
- Context-aware theming (change colors based on context usage %)
- Integration with other Claude tools
