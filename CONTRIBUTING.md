# Contributing to ContextKit

Thanks for your interest in contributing. ContextKit's value is in its skills library — well-crafted, opinionated guidance files that make Claude Code dramatically better for specific stacks.

## Adding a New Skill

### 1. Create the skill file

Add a new export to `src/skills.ts`:

```typescript
export const SKILL_MYSTACK: SkillFile = {
  path: 'skills/mystack/SKILL.md',
  content: `---
name: mystack
description: [What this skill does and when to use it. Be specific — Claude Code uses this to decide when to load the skill. Make the description slightly "pushy" so Claude loads it proactively.]
---

# MyStack Conventions

## [Category]
- Convention 1
- Convention 2

## Code Patterns
\`\`\`typescript
// Example of correct usage
\`\`\`
`,
};
```

### 2. Add detection logic

In `src/detect.ts`, add the new tech to the `DetectedTech` type and add detection logic to `detectStack()`:

```typescript
// In the DetectedTech union type:
| 'mystack'

// In detectStack():
if (hasFile(dir, 'mystack.config.js') || hasDep(pkg, 'mystack')) {
  detected.add('mystack');
}
```

### 3. Wire it into the registry

In `src/registry.ts`, add an entry to `SKILL_REGISTRY`:

```typescript
{ triggers: ['mystack'], files: [SKILL_MYSTACK] },
```

And import it at the top.

### 4. Test it

```bash
npm run build
node dist/index.js --dir /path/to/a-project-using-mystack
```

Verify the skill file appears in `.claude/skills/mystack/SKILL.md` and looks correct.

## Skill Writing Guidelines

- **Be opinionated.** Vague guidance doesn't help. Pick a pattern and commit to it.
- **Include code examples.** Claude learns from concrete patterns.
- **Cover the common mistakes.** "Do NOT" sections are valuable.
- **Keep SKILL.md under ~150 lines.** Long files dilute focus.
- **Description triggers matter.** Claude auto-loads skills based on the `description` field. Make it comprehensive — list the scenarios where the skill should activate.

## PR Checklist

- [ ] New `SkillFile` export in `src/skills.ts`
- [ ] Detection logic in `src/detect.ts`
- [ ] Registry entry in `src/registry.ts`
- [ ] Tested against a real project using the stack
- [ ] No references to specific user credentials, subscription IDs, or internal tooling
- [ ] Skill content is generic enough for any developer using this stack

## Questions

Open an issue — we're happy to discuss skill design before you write it.
