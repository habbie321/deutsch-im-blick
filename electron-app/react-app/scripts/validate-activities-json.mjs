#!/usr/bin/env node
/**
 * Validate src/data/activites.json against activity-schema.mjs rules.
 *
 * Usage (from react-app/):
 *   node scripts/validate-activities-json.mjs
 *   node scripts/validate-activities-json.mjs --file path/to/activites.json
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { validateActivitiesData } from './activity-schema.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const args = { file: path.join(__dirname, '../src/data/activites.json') };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--file' && argv[i + 1]) {
      args.file = path.resolve(argv[++i]);
    }
  }
  return args;
}

const { file } = parseArgs(process.argv);

let raw;
try {
  raw = JSON.parse(fs.readFileSync(file, 'utf8'));
} catch (e) {
  console.error('Failed to read/parse JSON:', file, e.message);
  process.exit(1);
}

const { ok, errors } = validateActivitiesData(raw);

if (ok) {
  console.log(`OK — ${raw.activities.length} activities validated (${file})`);
  process.exit(0);
}

console.error(`Validation failed — ${errors.length} error(s) in ${file}:\n`);
errors.forEach(({ path: p, message }) => {
  console.error(`  • ${p}: ${message}`);
});
process.exit(1);
