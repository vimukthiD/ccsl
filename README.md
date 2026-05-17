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

| Widget        | Description                          | Example                          |
|---------------|--------------------------------------|----------------------------------|
| `model`       | Claude model name                    | `Opus`                           |
| `context`     | Context window usage %               | `42%`                            |
| `tokens`      | Input/Output tokens                  | `↑15.2k ↓4.5k`                   |
| `cost`        | Session cost USD                     | `$0.02`                          |
| `duration`    | Session duration                     | `45s`                            |
| `lines`       | Lines added/removed                  | `+156 -23`                       |
| `directory`   | Current directory                    | `my-project`                     |
| `version`     | Claude Code version                  | `v1.0.80`                        |
| `branch`      | Current git branch (from `cwd`)†     | `⎇ main`                         |
| `worktree`    | Active git worktree name‡            | `🌳 feature-payments`            |
| `rateLimit`   | 5-hour rolling rate limit§           | `████░░░░░░ 42% resets 2:00 PM` |
| `weeklyLimit` | 7-day rolling rate limit§            | `███████░░░ 68% resets Tue`     |
| `usage`       | Legacy `session_usage` widget*       | `▰▰▰▱▱ 75/100 (Pro)`             |
| `resetTime`   | Legacy `session_usage` reset widget* | `1h30m`                          |

† `branch` invokes `git symbolic-ref --short HEAD` in the working directory (with a `git rev-parse --short HEAD` fallback for detached HEAD). Cached per-cwd within a single invocation.
‡ `worktree` reads `worktree.name` (set during `--worktree` sessions) and falls back to `workspace.git_worktree` (set for any linked git worktree).
§ `rateLimit` / `weeklyLimit` read `rate_limits.five_hour` and `rate_limits.seven_day`. These fields are only emitted by Claude Code for Claude.ai Pro/Max subscribers after the first API response in a session; the widgets render nothing when the data is absent.
\* The `usage` and `resetTime` widgets rely on a `session_usage` field that Claude Code never shipped. Prefer `rateLimit` / `weeklyLimit` for the same information.

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
ccsl config               # Open TUI configuration (local)
ccsl config --global      # Open TUI configuration (global)
ccsl --version            # Show version
ccsl --help               # Show help
```

## Configuration

### Config File Locations

| Scope  | Location                     | Priority | Use Case                    |
|--------|------------------------------|----------|-----------------------------|
| Local  | `.ccslrc.json`               | Highest  | Project-specific settings   |
| Global | `~/.config/ccsl/config.json` | Default  | User-wide default settings  |

**Configuration Priority:** Local config takes precedence over global config. If no local config exists, the global config is used.

```bash
# Configure global settings (applies to all projects)
ccsl config --global

# Configure local settings (project-specific)
ccsl config --local   # or just: ccsl config
```

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
      "separator": { "fg": "#5c6370" },
      "usage": { "fg": "#98c379" },
      "usageHigh": { "fg": "#e5c07b" },
      "usageCritical": { "fg": "#e06c75" },
      "resetTime": { "fg": "#61afef" },
      "branch": { "fg": "#abb2bf" },
      "worktree": { "fg": "#61afef" },
      "rateLimit": { "fg": "#98c379" },
      "rateLimitHigh": { "fg": "#e5c07b" },
      "rateLimitCritical": { "fg": "#e06c75" },
      "weeklyLimit": { "fg": "#61afef" },
      "weeklyLimitHigh": { "fg": "#e5c07b" },
      "weeklyLimitCritical": { "fg": "#e06c75" }
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
  "version": "1.0.80",
  "rate_limits": {
    "five_hour": { "used_percentage": 23.5, "resets_at": 1738425600 },
    "seven_day": { "used_percentage": 41.2, "resets_at": 1738857600 }
  },
  "worktree": {
    "name": "my-feature",
    "path": "/path/to/.claude/worktrees/my-feature",
    "branch": "worktree-my-feature"
  },
  "session_usage": {
    "requests_used": 45,
    "requests_limit": 100,
    "usage_percentage": 45,
    "reset_in_seconds": 7200,
    "plan": "Pro"
  }
}
```

### Session Usage Fields

> **Note:** Claude Code does not currently expose `session_usage` data to status line commands. This is a [requested feature](https://github.com/anthropics/claude-code/issues/18121). The schema below is included for future compatibility when/if this data becomes available.

The `session_usage` object supports the following fields for the `usage` and `resetTime` widgets:

| Field              | Type   | Description                               |
|--------------------|--------|-------------------------------------------|
| `requests_used`    | number | Number of requests used in current period |
| `requests_limit`   | number | Maximum requests allowed                  |
| `usage_percentage` | number | Usage percentage (0-100)                  |
| `reset_at`         | string | ISO timestamp when usage resets           |
| `reset_in_seconds` | number | Seconds until usage resets                |
| `plan`             | string | Plan/tier name (e.g., "Pro", "Max")       |

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
npm pack  # Creates @vimukthid-ccsl-1.0.6.tgz

# Install the tarball globally
npm install -g ./vimukthid-ccsl-1.0.6.tgz
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
