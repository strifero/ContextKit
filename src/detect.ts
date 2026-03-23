// detect.ts — Scan a project directory and identify its tech stack

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export type DetectedTech =
  | 'typescript'
  | 'nodejs'
  | 'express'
  | 'nextjs'
  | 'react'
  | 'tailwind'
  | 'swiftui'
  | 'stripe'
  | 'prisma'
  | 'postgresql'
  | 'azure'
  | 'docker'
  | 'go'
  | 'python'
  | 'django'
  | 'rust';

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

function readJson<T>(path: string): T | null {
  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as T;
  } catch {
    return null;
  }
}

function hasDep(pkg: PackageJson | null, ...names: string[]): boolean {
  if (!pkg) return false;
  const all = { ...pkg.dependencies, ...pkg.devDependencies };
  return names.some(n => n in all);
}

function hasFile(dir: string, ...names: string[]): boolean {
  return names.some(n => existsSync(join(dir, n)));
}

function hasExtension(dir: string, ext: string, maxDepth = 2): boolean {
  try {
    return scanExtension(dir, ext, maxDepth);
  } catch {
    return false;
  }
}

function scanExtension(dir: string, ext: string, depth: number): boolean {
  if (depth < 0) return false;
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'dist') continue;
    if (entry.isFile() && entry.name.endsWith(ext)) return true;
    if (entry.isDirectory() && scanExtension(join(dir, entry.name), ext, depth - 1)) return true;
  }
  return false;
}

export async function detectStack(dir: string): Promise<DetectedTech[]> {
  const detected = new Set<DetectedTech>();
  const pkg = readJson<PackageJson>(join(dir, 'package.json'));

  // TypeScript
  if (hasFile(dir, 'tsconfig.json') || hasExtension(dir, '.ts') || hasExtension(dir, '.tsx')) {
    detected.add('typescript');
  }

  // Next.js (before React — more specific)
  if (
    hasFile(dir, 'next.config.js', 'next.config.ts', 'next.config.mjs') ||
    hasDep(pkg, 'next')
  ) {
    detected.add('nextjs');
    detected.add('react'); // Next implies React
    detected.add('nodejs');
  }

  // React (standalone)
  if (hasDep(pkg, 'react', 'react-dom')) {
    detected.add('react');
  }

  // Node.js
  if (pkg && !detected.has('nextjs')) {
    detected.add('nodejs');
  }

  // Express
  if (hasDep(pkg, 'express')) {
    detected.add('express');
  }

  // Tailwind
  if (
    hasFile(dir, 'tailwind.config.js', 'tailwind.config.ts', 'tailwind.config.mjs') ||
    hasDep(pkg, 'tailwindcss')
  ) {
    detected.add('tailwind');
  }

  // Stripe
  if (hasDep(pkg, 'stripe')) {
    detected.add('stripe');
  }

  // Prisma
  if (
    hasFile(dir, 'prisma/schema.prisma') ||
    hasDep(pkg, '@prisma/client', 'prisma')
  ) {
    detected.add('prisma');
  }

  // PostgreSQL
  if (hasDep(pkg, 'pg', 'postgres', 'node-postgres', '@vercel/postgres', 'drizzle-orm')) {
    detected.add('postgresql');
  }

  // Azure
  if (
    hasFile(dir, 'azure.yaml', 'bicep', '.azure') ||
    hasExtension(dir, '.bicep') ||
    hasDep(pkg, '@azure/cosmos', '@azure/identity', '@azure/storage-blob')
  ) {
    detected.add('azure');
  }

  // Docker
  if (hasFile(dir, 'Dockerfile', 'docker-compose.yml', 'docker-compose.yaml')) {
    detected.add('docker');
  }

  // Swift / SwiftUI
  if (
    hasExtension(dir, '.xcodeproj') ||
    hasExtension(dir, '.swift') ||
    hasFile(dir, 'Package.swift')
  ) {
    detected.add('swiftui');
  }

  // Go
  if (hasFile(dir, 'go.mod', 'go.sum')) {
    detected.add('go');
  }

  // Python / Django
  if (
    hasFile(dir, 'pyproject.toml', 'requirements.txt', 'setup.py', 'Pipfile')
  ) {
    detected.add('python');
    if (hasFile(dir, 'manage.py')) {
      detected.add('django');
    }
  }

  // Rust
  if (hasFile(dir, 'Cargo.toml')) {
    detected.add('rust');
  }

  return Array.from(detected);
}
