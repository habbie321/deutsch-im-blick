#!/usr/bin/env node
/**
 * Normalize activites.json: strip top-level type, infer blurb vs exercise from text/pages.
 *
 * Usage:
 *   node scripts/migrate-multipage.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { normalizeActivity, isBlurb, isExercise } from '../src/utils/normalizeActivity.js';
import { reorderActivityKeys } from './activity-key-order.mjs';
import { validateActivitiesData } from './activity-schema.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, '../src/data/activites.json');

const raw = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
let exercises = 0;
let blurbs = 0;

const activities = raw.activities.map((activity) => {
  const next = reorderActivityKeys(normalizeActivity(activity));
  if (isBlurb(next)) blurbs++;
  else if (isExercise(next)) exercises++;
  return next;
});

const { ok, errors } = validateActivitiesData({ activities });
if (!ok) {
  console.error('Validation failed:');
  errors.slice(0, 20).forEach(({ path: p, message }) => console.error(`  • ${p}: ${message}`));
  process.exit(1);
}

fs.writeFileSync(dataPath, `${JSON.stringify({ activities }, null, 2)}\n`, 'utf8');
console.log(`Normalized ${activities.length} activities: ${exercises} exercises, ${blurbs} blurbs`);
console.log('Wrote', dataPath);
