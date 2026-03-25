#!/usr/bin/env node
// ContextKit — CLI entry point

import { parseArgs } from 'node:util';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import pc from 'picocolors';
import { detectStack } from './detect.js';
import { generateFiles } from './generate.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const { version: VERSION } = JSON.parse(
  readFileSync(resolve(__dirname, '../package.json'), 'utf-8')
) as { version: string };

const { values: flags } = parseArgs({
  options: {
    dir:         { type: 'string',  short: 'd', default: process.cwd() },
    force:       { type: 'boolean', short: 'f', default: false },
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
  --no-agents        Skip agent generation
  -v, --version      Print version
  -h, --help         Show this help

${pc.bold('Examples:')}
  npx contextkit
  npx contextkit --dir ./my-project
  npx contextkit --force

${pc.dim('by Strife Technologies — https://strifetech.com')}
`);
  process.exit(0);
}

const projectDir = resolve(flags.dir as string);

if (!existsSync(projectDir)) {
  console.error(pc.red(`Directory not found: ${projectDir}`));
  process.exit(1);
}

const claudeDir = resolve(projectDir, '.claude');
if (existsSync(claudeDir) && !flags.force) {
  console.log(pc.yellow(`\n  .claude/ already exists. Use --force to overwrite.\n`));
  process.exit(0);
}

console.log(`\n${pc.bold('ContextKit')} ${pc.dim(`v${VERSION}`)}\n`);
console.log(`  Analyzing ${pc.cyan(projectDir)}\n`);

// Detect stack
const detected = await detectStack(projectDir);

if (detected.length === 0) {
  console.log(pc.yellow('  No recognized tech stack detected. Generating generic CLAUDE.md.\n'));
} else {
  console.log(`  ${pc.green('✓')} Detected: ${detected.map(d => pc.bold(d)).join(', ')}\n`);
}

// Generate files
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
console.log(`  ${pc.dim('by Strife Technologies — https://strifetech.com')}\n`);
