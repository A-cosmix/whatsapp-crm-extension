#!/usr/bin/env node
/**
 * Creates a Chrome Web Store-ready zip from the dist/ folder.
 */
import { execSync } from 'node:child_process';
import { existsSync, unlinkSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
const out = path.join(root, 'ai-email-summarizer-v1.0.1.zip');

if (!existsSync(dist)) {
  console.error('dist/ not found. Run npm run build first.');
  process.exit(1);
}

if (existsSync(out)) unlinkSync(out);

execSync(`zip -r "${out}" .`, { cwd: dist, stdio: 'inherit' });
console.log(`Package created: ${out}`);
