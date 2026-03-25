# Project — Claude Code Context

> Read this file fully before writing any code.

## Project Overview

**Stack:** TypeScript, Node.js

ContextKit is a zero-config CLI (`npx contextkit`) that scans a project directory, detects the tech stack, and generates `.claude/CLAUDE.md`, skill files, and agent files for Claude Code. Free, MIT, no account required.

## Architecture

Four source files in `src/`:
- `index.ts` — CLI entry point, arg parsing (`--dir`, `--force`, `--no-agents`), orchestration
- `detect.ts` — Filesystem-based stack detection (no network). Returns `DetectedTech[]`
- `registry.ts` — Maps detected techs → skill/agent `SkillFile[]` entries
- `generate.ts` — Writes `.claude/` directory: skills, agents, and `CLAUDE.md`
- `skills.ts` — All skill and agent content as exported constants (hand-crafted markdown)

Output structure:
```
.claude/
├── CLAUDE.md
├── skills/<tech>/SKILL.md
└── agents/<name>.md
```

## Conventions

- ES modules (`"type": "module"` in package.json)
- TypeScript strict mode
- Single runtime dependency: `picocolors`
- `npm run build` → `dist/` — `dist/index.js` is the CLI binary
- `prepublishOnly` runs build automatically before `npm publish`

## Adding a New Stack

1. Add the tech name to `DetectedTech` union in `detect.ts`
2. Add detection logic to `detectStack()` in `detect.ts`
3. Add a `SKILL_<NAME>` export to `skills.ts`
4. Wire triggers and files in `registry.ts`

## Publishing

```bash
npm run build
npm publish --access public
```

---
*Generated for [ContextKit](https://github.com/strifero/ContextKit) — by [Strife Technologies](https://strifetech.com)*
