// update.ts — Sync .claude/ with current stack without losing user content

import {
  existsSync, readFileSync, writeFileSync, readdirSync,
  mkdirSync, unlinkSync, rmdirSync,
} from 'node:fs';
import { join, dirname, relative } from 'node:path';
import type { DetectedTech } from './detect.js';
import { selectFiles } from './registry.js';

// ── Types ──────────────────────────────────────────────────────────

interface ParsedSection {
  name: string;
  content: string;
}

export interface UpdateOptions {
  projectDir: string;
  detected: DetectedTech[];
  includeAgents: boolean;
}

export interface UpdateResult {
  added: string[];
  removed: string[];
  kept: string[];
  claudeMdUpdated: boolean;
}

// ── Constants ──────────────────────────────────────────────────────

/** Sections that are fully auto-generated and always replaced */
const AUTO_SECTIONS = new Set(['Available Skills', 'Available Agents']);

// ── Helpers ────────────────────────────────────────────────────────

/**
 * Parse CLAUDE.md into a preamble (everything before the first ##)
 * and an ordered list of { name, content } sections.
 */
function parseClaudeMd(raw: string): { preamble: string; sections: ParsedSection[] } {
  const lines = raw.split('\n');
  let preamble = '';
  const sections: ParsedSection[] = [];
  let current: ParsedSection | null = null;

  for (const line of lines) {
    const m = line.match(/^## (.+)$/);
    if (m) {
      if (current) sections.push(current);
      current = { name: m[1].trim(), content: '' };
    } else if (current) {
      current.content += line + '\n';
    } else {
      preamble += line + '\n';
    }
  }
  if (current) sections.push(current);
  return { preamble, sections };
}

/**
 * Strip the auto-generated "**Detected stack:**" line and HTML comment
 * placeholders from a Project Overview section, returning only user content.
 */
function extractUserOverviewContent(content: string): string {
  return content
    .split('\n')
    .filter(l => !l.startsWith('**Detected stack:**'))
    .filter(l => !l.match(/^<!--.*-->$/))
    .join('\n')
    .trim();
}

/**
 * Recursively collect all file paths under a subdirectory,
 * returned relative to claudeDir.
 */
function collectFiles(claudeDir: string, subdir: string): string[] {
  const root = join(claudeDir, subdir);
  if (!existsSync(root)) return [];
  const out: string[] = [];

  function walk(dir: string) {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else out.push(relative(claudeDir, full));
    }
  }

  walk(root);
  return out;
}

/**
 * Delete a file and remove empty parent directories up to claudeDir.
 */
function removeWithCleanup(claudeDir: string, filePath: string) {
  const full = join(claudeDir, filePath);
  if (existsSync(full)) unlinkSync(full);

  let dir = dirname(full);
  while (dir !== claudeDir && existsSync(dir)) {
    if (readdirSync(dir).length === 0) {
      rmdirSync(dir);
      dir = dirname(dir);
    } else {
      break;
    }
  }
}

// ── Main ───────────────────────────────────────────────────────────

export async function updateProject(opts: UpdateOptions): Promise<UpdateResult> {
  const { projectDir, detected, includeAgents } = opts;
  const claudeDir = join(projectDir, '.claude');
  const claudeMdPath = join(claudeDir, 'CLAUDE.md');

  const result: UpdateResult = {
    added: [],
    removed: [],
    kept: [],
    claudeMdUpdated: false,
  };

  // ── 1. Sync skill & agent files ────────────────────────────────

  const desired = selectFiles(detected, includeAgents);
  const desiredPaths = new Set(desired.map(f => f.path));

  const existing = new Set([
    ...collectFiles(claudeDir, 'skills'),
    ...collectFiles(claudeDir, 'agents'),
  ]);

  // Add missing files
  for (const file of desired) {
    if (!existing.has(file.path)) {
      const fullPath = join(claudeDir, file.path);
      mkdirSync(dirname(fullPath), { recursive: true });
      writeFileSync(fullPath, file.content, 'utf-8');
      result.added.push(file.path);
    } else {
      result.kept.push(file.path);
    }
  }

  // Remove stale files (only registry-known paths, never custom user files)
  for (const path of existing) {
    if (!desiredPaths.has(path)) {
      removeWithCleanup(claudeDir, path);
      result.removed.push(path);
    }
  }

  // ── 2. Update CLAUDE.md ────────────────────────────────────────

  const skillNames = desired
    .filter(f => f.path.includes('skills/'))
    .map(f => f.path.split('skills/')[1].split('/')[0]);
  const agentNames = desired
    .filter(f => f.path.includes('agents/'))
    .map(f => f.path.split('agents/')[1].replace('.md', ''));
  const stackLine = detected.length > 0
    ? detected.join(', ')
    : 'generic project';

  const preamble = `# Project — Claude Code Context

> Read this file fully before writing any code.
> Skills in \`.claude/skills/\` load automatically when relevant.
> Agents in \`.claude/agents/\` are available for specialized tasks.

`;

  const footer = `\n---

*Generated by [ContextKit](https://github.com/strifero/ContextKit) — by [Strife Technologies](https://strifetech.com)*
`;

  const skillsSection = `## Available Skills
${skillNames.length > 0
    ? skillNames.map(n => `- \`${n}\``).join('\n')
    : '- (none detected — add your stack and re-run contextkit)'}
`;

  const agentsSection = `## Available Agents
${agentNames.length > 0
    ? agentNames.map(n => `- \`${n}\``).join('\n')
    : '- (none)'}
`;

  if (existsSync(claudeMdPath)) {
    const raw = readFileSync(claudeMdPath, 'utf-8');
    const parsed = parseClaudeMd(raw);

    // Build Project Overview with updated stack but preserved user text
    const overviewOld = parsed.sections.find(s => s.name === 'Project Overview');
    const userOverview = overviewOld ? extractUserOverviewContent(overviewOld.content) : '';

    let overviewSection = `## Project Overview\n\n**Detected stack:** ${stackLine}\n`;
    if (userOverview) overviewSection += '\n' + userOverview + '\n';

    // Collect user sections (skip auto-generated ones and Project Overview)
    const userSections = parsed.sections
      .filter(s => s.name !== 'Project Overview' && !AUTO_SECTIONS.has(s.name))
      .map(s => `## ${s.name}\n${s.content.trimEnd()}`);

    const blocks = [
      preamble.trimEnd(),
      overviewSection.trimEnd(),
      ...userSections,
      skillsSection.trimEnd(),
      agentsSection.trimEnd(),
      footer.trimEnd(),
    ];

    writeFileSync(claudeMdPath, blocks.join('\n\n') + '\n', 'utf-8');
  } else {
    // No CLAUDE.md at all — generate a fresh one
    const overviewSection = [
      '## Project Overview',
      '',
      `**Detected stack:** ${stackLine}`,
      '',
      '<!-- ',
      '  Fill in the sections below to give Claude more context about your project.',
      '  The more detail you add, the better Claude Code performs.',
      '-->',
    ].join('\n');

    const placeholders = [
      '## Architecture',
      '',
      '<!-- Describe how the system is structured (frontend, backend, services, DB) -->',
      '',
      '## Data Model',
      '',
      '<!-- Key entities and their relationships -->',
      '',
      '## Conventions',
      '',
      '<!-- Project-specific coding conventions, naming, folder structure -->',
    ].join('\n');

    const blocks = [
      preamble.trimEnd(),
      overviewSection.trimEnd(),
      placeholders.trimEnd(),
      skillsSection.trimEnd(),
      agentsSection.trimEnd(),
      footer.trimEnd(),
    ];
    mkdirSync(claudeDir, { recursive: true });
    writeFileSync(claudeMdPath, blocks.join('\n\n') + '\n', 'utf-8');
  }

  result.claudeMdUpdated = true;
  return result;
}
