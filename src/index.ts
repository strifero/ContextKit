#!/usr/bin/env node
// ContextKit — CLI entry point

import { parseArgs } from 'node:util';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import pc from 'picocolors';
import { detectStack } from './detect.js';
import { generateFiles } from './generate.js';
import { updateProject } from './update.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const { version: VERSION } = JSON.parse(
  readFileSync(resolve(__dirname, '../package.json'), 'utf-8')
) as { version: string };

const { values: flags } = parseArgs({
  options: {
    dir:         { type: 'string',  short: 'd', default: process.cwd() },
    force:       { type: 'boolean', short: 'f', default: false },
    update:      { type: 'boolean', short: 'u', default: false },
    'no-agents': { type: 'boolean', default: false },
    version:     { type: 'boolean', short: 'v', default: false },
    help:        { type: 'boolean', short: 'h', default: false },
  },
  strict: false,
});

if (flags.version) {
  console.log(`contextkit v${VERSION}`);
  process.exit(0);
}

if (flags.help) {
  console.log(`
${pc.bold('contextkit')} — Give Claude Code your entire codebase in one command.

${pc.bold('Usage:')}
  npx contextkit [options]

${pc.bold('Options:')}
  -d, --dir <path>   Project directory to analyze (default: current directory)
  -f, --force        Overwrite existing .claude/ directory
  -u, --update       Re-sync skills and agents, preserving your edits to CLAUDE.md
  --no-agents        Skip agent generation
  -v, --version      Print version
  -h, --help         Show this help

${pc.bold('Examples:')}
  npx contextkit                        # First run — generate everything
  npx contextkit --update               # Stack changed — sync without losing edits
  npx contextkit --force                # Nuke and regenerate from scratch
  npx contextkit --update --dir ./app   # Update a specific project

${pc.dim('by Strife Technologies — https://strifetech.com')}
`);
  process.exit(0);
}

// ── Validate ─────────────────────────────────────────────────────

const projectDir = resolve(flags.dir as string);

if (!existsSync(projectDir)) {
  console.error(pc.red(`Directory not found: ${projectDir}`));
  process.exit(1);
}

if (flags.force && flags.update) {
  console.error(pc.red('\n  Cannot use --force and --update together.\n'));
  process.exit(1);
}

const claudeDir = resolve(projectDir, '.claude');
const claudeExists = existsSync(claudeDir);

// --update requires existing .claude/
if (flags.update && !claudeExists) {
  console.error(pc.red('\n  Nothing to update — .claude/ does not exist. Run contextkit first.\n'));
  process.exit(1);
}

// Existing .claude/ without a flag — suggest options
if (claudeExists && !flags.force && !flags.update) {
  console.log(pc.yellow(`\n  .claude/ already exists.`));
  console.log(`  Use ${pc.bold('--update')} to sync skills (preserves your edits)`);
  console.log(`  Use ${pc.bold('--force')} to overwrite everything\n`);
  process.exit(0);
}

// ── Detect ───────────────────────────────────────────────────────

console.log(`\n${pc.bold('ContextKit')} ${pc.dim(`v${VERSION}`)}\n`);
console.log(`  Analyzing ${pc.cyan(projectDir)}\n`);

const detected = await detectStack(projectDir);

if (detected.length === 0) {
  console.log(pc.yellow('  No recognized tech stack detected.\n'));
} else {
  console.log(`  ${pc.green('✓')} Detected: ${detected.map(d => pc.bold(d)).join(', ')}\n`);
}

// ── Execute ──────────────────────────────────────────────────────

if (flags.update) {
  // Update mode — sync files, preserve user content
  const result = await updateProject({
    projectDir,
    detected,
    includeAgents: !flags['no-agents'],
  });

  if (result.added.length > 0) {
    console.log(`  ${pc.green('+')} Added:`);
    for (const f of result.added) console.log(`    ${pc.green('+')} ${f}`);
  }
  if (result.removed.length > 0) {
    console.log(`  ${pc.red('−')} Removed:`);
    for (const f of result.removed) console.log(`    ${pc.red('−')} ${f}`);
  }
  if (result.kept.length > 0) {
    console.log(`  ${pc.dim('=')} Unchanged: ${result.kept.length} files`);
  }
  if (result.claudeMdUpdated) {
    console.log(`  ${pc.green('✓')} CLAUDE.md updated (your edits preserved)`);
  }

  const total = result.added.length + result.removed.length;
  if (total === 0 && result.claudeMdUpdated) {
    console.log(`\n  ${pc.bold('Up to date.')} Stack line and skill lists refreshed.\n`);
  } else if (total === 0) {
    console.log(`\n  ${pc.bold('Already up to date.')} Nothing changed.\n`);
  } else {
    console.log(`\n  ${pc.bold('Done.')} ${result.added.length} added, ${result.removed.length} removed.\n`);
  }
} else {
  // Fresh generate (first run or --force)
  const result = await generateFiles({
    projectDir,
    detected,
    includeAgents: !flags['no-agents'],
  });

  console.log(`\n  ${pc.green('✓')} Generated ${result.fileCount} files in ${pc.cyan('.claude/')}\n`);
  for (const file of result.files) {
    console.log(`    ${pc.dim('+')} ${file}`);
  }
  console.log(`\n  ${pc.bold('Done.')} Claude Code will load these skills automatically.\n`);
}

console.log(`  ${pc.dim('by Strife Technologies — https://strifetech.com')}\n`);
