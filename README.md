# ContextKit

**One command gives Claude Code your entire codebase.**

Stop re-explaining your stack every session. ContextKit scans your project, detects your frameworks, and generates everything Claude Code needs to understand your code from day one — skills, agents, and a project overview.

Free. Open source. No account required.

```bash
npx contextkit
```

---

## What It Generates

```
.claude/
├── CLAUDE.md           # Project overview, conventions, and architecture
├── skills/             # Tech-specific knowledge files
│   ├── typescript/
│   │   └── SKILL.md
│   ├── react/
│   │   └── SKILL.md
│   └── ...
└── agents/             # Specialized subagents
    ├── backend-engineer.md
    ├── frontend-engineer.md
    └── code-reviewer.md
```

Claude Code discovers these files automatically. Skills load on-demand when relevant — no wasted context.

---

## Detected Stacks

| Technology | Detected By |
|---|---|
| TypeScript | `tsconfig.json`, `.ts` files |
| Node.js + Express | `package.json` dependencies |
| Next.js | `next.config.*` |
| React | `package.json` dependencies |
| Tailwind CSS | `tailwind.config.*` |
| Swift / SwiftUI | `.xcodeproj`, `.swift` files |
| Stripe | `package.json` dependencies |
| Prisma | `prisma/schema.prisma` |
| PostgreSQL | `package.json` dependencies (`pg`, `postgres`) |
| Azure | `azure.yaml`, `bicep`, `arm` files |
| Docker | `Dockerfile` |
| Go | `go.mod` |
| Python | `pyproject.toml`, `requirements.txt` |
| Django | `manage.py` |
| Rust | `Cargo.toml` |

Don't see yours? [Open an issue](https://github.com/strifero/ContextKit/issues) or submit a PR.

---

## Usage

**Analyze your current project:**
```bash
npx contextkit
```

**Stack changed? Update without losing your edits:**
```bash
npx contextkit --update
```

This re-detects your stack, adds skills for new tech, removes skills for dropped tech, and refreshes the skill/agent lists in CLAUDE.md — while preserving everything you've written (Architecture, Data Model, Conventions, etc.).

**Specify a directory:**
```bash
npx contextkit --dir /path/to/project
```

**Overwrite existing `.claude/` directory:**
```bash
npx contextkit --force
```

**Skip agent generation:**
```bash
npx contextkit --no-agents
```

---

## How It Works

1. **Scans** your project root for config files, `package.json` deps, and file extensions
2. **Detects** your tech stack automatically
3. **Selects** the relevant skills from a hand-crafted library
4. **Generates** `.claude/CLAUDE.md`, `.claude/skills/`, and `.claude/agents/`

With `--update`, ContextKit re-runs detection and syncs your `.claude/` directory non-destructively — new skills are added, stale ones removed, and your hand-written sections in CLAUDE.md are preserved.

Each skill file follows the [Agent Skills open standard](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview) — compatible with Claude Code, Cursor, Codex CLI, and any other agent that supports `SKILL.md`.

---

## Requirements

- Node.js 18+
- A project directory (any language or framework)

---

## Contributing

Skills are plain markdown files. To add a new stack:

1. Create `src/skills/<name>.ts` with the skill content
2. Add detection logic to `src/detect.ts`
3. Wire it up in `src/registry.ts`
4. Open a PR

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

---

## License

MIT — by [Strife Technologies](https://strifetech.com)
