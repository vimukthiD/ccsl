# @vimukthid/ccsl

**Claude Code Status Line** - A customizable status line formatter for Claude Code CLI.

Transform Claude Code status data into beautifully formatted, themed terminal displays.

## Installation

```bash
npm install -g @vimukthid/ccsl
```

**Requirements:** Node.js 22.x or higher

## Quick Start

### 1. Install to Claude Code

```bash
# Run the installer
ccsl install

# Or launch the TUI and select "Install to Claude Code"
ccsl
```

This automatically configures `~/.claude/settings.json` with:

```json
{
  "statusLine": {
    "type": "command",
    "command": "npx @vimukthid/ccsl"
  }
}
```

### 2. Restart Claude Code

After installation, restart Claude Code to see your new status line!

## How It Works

Claude Code passes JSON data via stdin to ccsl, which formats it into a beautiful status line:

```
 Opus │ 42% │ ↑15.2k ↓4.5k │ $0.02
```

## Features

### Available Widgets

| Widget      | Description            | Example        |
|-------------|------------------------|----------------|
| `model`     | Claude model name      | `Opus`         |
| `context`   | Context window usage % | `42%`          |
| `tokens`    | Input/Output tokens    | `↑15.2k ↓4.5k` |
| `cost`      | Session cost USD       | `$0.02`        |
| `duration`  | Session duration       | `45s`          |
| `lines`     | Lines added/removed    | `+156 -23`     |
| `directory` | Current directory      | `my-project`   |
| `version`   | Claude Code version    | `v1.0.80`      |

### Built-in Themes

**Colorful:**
- `neon` - Vibrant cyberpunk with electric colors
- `rainbow` - Colorful gradient transitions
- `ocean` - Cool blues and teals

**Professional:**
- `minimal` - Clean and subtle (default)
- `monochrome` - Pure grayscale
- `corporate` - Professional muted blues

### Icon Modes

- `auto` - Detect terminal capabilities (default)
- `nerd` - Nerd Font icons
- `unicode` - Standard Unicode symbols
- `ascii` - Plain ASCII text

## CLI Commands

```bash
# Interactive TUI configuration
ccsl

# Install/Uninstall from Claude Code
ccsl install              # Add to Claude Code settings
ccsl uninstall            # Remove from Claude Code settings

# Theme management
ccsl theme <name>         # Quick switch theme
ccsl theme --list         # List available themes

# Other commands
ccsl preview              # Preview with sample data
ccsl init                 # Create local config file
ccsl init --global        # Create global config file
ccsl config               # Open TUI configuration
ccsl --version            # Show version
ccsl --help               # Show help
```

## Configuration

### Config File Locations

| Scope  | Location                     | Priority |
|--------|------------------------------|----------|
| Local  | `.ccslrc.json`               | Highest  |
| Global | `~/.config/ccsl/config.json` | Default  |

### Config Schema

```json
{
  "theme": "minimal",
  "widgets": ["model", "context", "tokens", "cost"],
  "separator": " │ ",
  "icons": "auto",
  "padding": 1
}
```

### Custom Theme

```json
{
  "theme": "minimal",
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
    }
  }
}
```

## Input Format

ccsl receives JSON from Claude Code via stdin:

```json
{
  "model": { "display_name": "Opus" },
  "context_window": {
    "used_percentage": 42.5,
    "total_input_tokens": 15234,
    "total_output_tokens": 4521
  },
  "cost": {
    "total_cost_usd": 0.0234,
    "total_duration_ms": 45000,
    "total_lines_added": 156,
    "total_lines_removed": 23
  },
  "workspace": { "current_dir": "/path/to/project" },
  "version": "1.0.80"
}
```

## Development

### Build from Source

```bash
# Clone the repository
git clone https://github.com/vimukthid/ccsl.git
cd ccsl

# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test
```

### Local Installation (without npm publish)

You can install ccsl locally without publishing to npm:

```bash
# Option 1: Install globally from local directory
cd /path/to/ccsl
npm run build
npm link

# Now you can use 'ccsl' command globally
ccsl --help
ccsl install
```

```bash
# Option 2: Install directly from the built package
cd /path/to/ccsl
npm run build
npm pack  # Creates @vimukthid-ccsl-1.0.0.tgz

# Install the tarball globally
npm install -g ./vimukthid-ccsl-1.0.0.tgz
```

```bash
# Option 3: Reference the local build in Claude Code settings
# Edit ~/.claude/settings.json manually:
{
  "statusLine": {
    "type": "command",
    "command": "node /path/to/ccsl/dist/cli.js"
  }
}
```

### Test the Status Line

```bash
# Preview with sample data
npm run build && node dist/cli.js preview

# Test piped input (simulates what Claude Code sends)
echo '{"model":{"display_name":"Opus"},"context_window":{"used_percentage":45}}' | node dist/cli.js
```

### Unlink Local Installation

```bash
# Remove the global link
npm unlink -g @vimukthid/ccsl
```

## License

MIT
