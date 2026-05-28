/**
 * Merge activity arrays by (chapter, id) without overwriting unrelated chapters.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { reorderActivityKeys } from './activity-key-order.mjs';
import { validateActivitiesData } from './activity-schema.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_DATA = path.join(__dirname, '../src/data/activites.json');

export function activityKey(activity) {
  return `${activity.chapter}-${activity.id}`;
}

/**
 * @param {object[]} existing
 * @param {object[]} incoming
 * @param {{ replaceChapters?: number[] }} [options]
 *   replaceChapters — drop all existing activities in these chapters before merging
 *   (use when regenerating a full chapter from a build script).
 * @returns {object[]}
 */
export function mergeActivities(existing, incoming, options = {}) {
  const { replaceChapters = null } = options;
  const replaceSet = replaceChapters ? new Set(replaceChapters) : null;
  const incomingKeys = new Set(incoming.map(activityKey));

  const byKey = new Map();

  for (const activity of existing) {
    const key = activityKey(activity);
    if (replaceSet?.has(activity.chapter) && !incomingKeys.has(key)) {
      continue;
    }
    byKey.set(key, activity);
  }

  for (const activity of incoming) {
    byKey.set(activityKey(activity), reorderActivityKeys(activity));
  }

  return [...byKey.values()].sort((a, b) => {
    if (a.chapter !== b.chapter) return a.chapter - b.chapter;
    return a.id - b.id;
  });
}

function loadActivitiesJson(filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  if (!Array.isArray(data.activities)) {
    throw new Error(`${filePath}: root.activities must be an array`);
  }
  return data.activities;
}

function parseArgs(argv) {
  const args = {
    target: DEFAULT_DATA,
    from: null,
    chapters: [],
    dryRun: false,
    skipValidate: false
  };

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--from' && argv[i + 1]) {
      args.from = path.resolve(argv[++i]);
    } else if (arg === '--target' && argv[i + 1]) {
      args.target = path.resolve(argv[++i]);
    } else if (arg === '--chapters' && argv[i + 1]) {
      args.chapters = argv[++i]
        .split(',')
        .map((n) => parseInt(n.trim(), 10))
        .filter((n) => !Number.isNaN(n));
    } else if (arg === '--dry-run') {
      args.dryRun = true;
    } else if (arg === '--skip-validate') {
      args.skipValidate = true;
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }
  }

  return args;
}

function printHelp() {
  console.log(`Usage: node scripts/merge-activities.mjs --from <incoming.json> [options]

Options:
  --from <path>       JSON file with { activities: [...] } or a bare activity array
  --target <path>     activites.json to patch (default: src/data/activites.json)
  --chapters 4,5      Replace entire chapters (drop old rows not in incoming)
  --dry-run           Print stats without writing
  --skip-validate     Skip post-merge validation
`);
}

function normalizeIncoming(raw) {
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.activities)) return raw.activities;
  throw new Error('Incoming file must be { activities: [...] } or a bare array');
}

function main() {
  const args = parseArgs(process.argv);
  if (!args.from) {
    printHelp();
    process.exit(1);
  }

  const existing = loadActivitiesJson(args.target);
  const incomingRaw = JSON.parse(fs.readFileSync(args.from, 'utf8'));
  const incoming = normalizeIncoming(incomingRaw);

  const merged = mergeActivities(existing, incoming, {
    replaceChapters: args.chapters.length ? args.chapters : null
  });

  const added = incoming.filter((a) => !existing.some((e) => activityKey(e) === activityKey(a))).length;
  const updated = incoming.length - added;

  console.log(
    `Merge: ${incoming.length} incoming → ${updated} updated, ${added} new (${merged.length} total)`
  );
  if (args.chapters.length) {
    console.log(`  replaceChapters: [${args.chapters.join(', ')}]`);
  }

  if (!args.skipValidate) {
    const { ok, errors } = validateActivitiesData({ activities: merged });
    if (!ok) {
      console.error('\nPost-merge validation failed:');
      errors.slice(0, 20).forEach(({ path: p, message }) => console.error(`  • ${p}: ${message}`));
      if (errors.length > 20) console.error(`  … and ${errors.length - 20} more`);
      process.exit(1);
    }
  }

  if (args.dryRun) {
    console.log('Dry run — no file written.');
    return;
  }

  fs.writeFileSync(args.target, `${JSON.stringify({ activities: merged }, null, 2)}\n`, 'utf8');
  console.log('Wrote', args.target);
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  main();
}
