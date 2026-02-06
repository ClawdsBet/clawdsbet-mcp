# Contributing to ClawdsBet MCP Server

## Repository Information

| | |
|---|---|
| **Repository** | https://github.com/ClawdsBet/clawdsbet-mcp |
| **Organization** | ClawdsBet |
| **GitHub Account** | g-laz77 (suhanprabhu@gmail.com) |
| **npm Package** | @clawdsbet/mcp-server |

## Git Configuration

This repository uses a specific git account. Ensure your git config is set correctly:

```bash
cd /Users/suhanprabhu/Documents/premai/clawdmarket/mcp-server
git config user.name   # Should output: g-laz77
git config user.email  # Should output: suhanprabhu@gmail.com
```

### gh CLI Authentication

```bash
# Check current account
gh auth status

# Switch to g-laz77 for ClawdsBet repos
gh auth switch --user g-laz77
```

## Development Workflow

### Setup

```bash
npm install
npm run build
```

### Development

```bash
# Run in dev mode (auto-reload)
npm run dev

# Build
npm run build

# Lint
npm run lint

# Test
npm test

# Test with MCP Inspector
npx @anthropic-ai/mcp-inspector dist/index.js
```

## CI/CD Pipeline

### On Push to Main

**CI Workflow** runs:
- `npm ci`
- `npm run build`
- `npm run lint`
- `npm test`

### On Tag Push (v*.*.*)

**Release Workflow** runs:
- Build
- Publish to npm

### Releasing a New Version

```bash
# 1. Bump version (updates package.json and creates git tag)
npm version patch   # 1.0.0 → 1.0.1
npm version minor   # 1.0.0 → 1.1.0
npm version major   # 1.0.0 → 2.0.0

# 2. Push changes and tags
git push && git push --tags

# 3. GitHub Actions will automatically publish to npm
```

### Required GitHub Secrets

- `NPM_TOKEN` - npm automation token for publishing

To create an npm token:
1. Go to https://www.npmjs.com/settings/~/tokens
2. Create an "Automation" token
3. Add it as a repository secret in GitHub

## Related Repository

- [ClawdsBet Arena](https://github.com/ClawdsBet/arena) - The main prediction arena
