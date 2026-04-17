/**
 * Downloads COERLL Deutsch im Blick MP4s and saves them under
 * electron-app/resources/videos/ using paths referenced in activites.json.
 *
 * Source: https://media.la.utexas.edu/dib/video/<slug>.mp4
 * Mapping: TOC pages https://coerll.utexas.edu/dib/toc.php?k=1|2|3 + workbook QR hints in JSON.
 *
 * Run from repo root: node electron-app/react-app/scripts/download-dib-local-videos.mjs
 */
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Mirrors src/utils/activityVideo.js getActivityVideoClips (keeps this script self-contained). */
function getActivityVideoClips(activity) {
  if (!activity || activity.video?.disabled) return [];
  const chapter = activity.chapter ?? 1;
  const fallbackUrl =
    activity.videoFallbackUrl ||
    activity.video?.fallbackUrl ||
    `https://coerll.utexas.edu/dib/toc.php?k=${chapter}`;
  if (activity.videos?.length) {
    return activity.videos.map((v) => ({
      relativePath: v.path,
      fallbackUrl: v.fallbackUrl || fallbackUrl
    }));
  }
  if (activity.video?.path) {
    return [{ relativePath: activity.video.path, fallbackUrl: activity.video.fallbackUrl || fallbackUrl }];
  }
  if (activity.icon === 'videoclips') {
    const ch = String(chapter).padStart(2, '0');
    const id = String(activity.id).padStart(2, '0');
    return [
      {
        relativePath: `chapter${ch}/k${ch}_a${id}.mp4`,
        fallbackUrl: activity.video?.fallbackUrl || fallbackUrl
      }
    ];
  }
  return [];
}

const REPO_ROOT = path.resolve(__dirname, '../../..');
const VIDEOS_ROOT = path.join(REPO_ROOT, 'electron-app/resources/videos');
const MEDIA_BASE = 'https://media.la.utexas.edu/dib/video/';

/** @type {Record<string, string>} relativePath -> COERLL slug (no .mp4) */
const COERLL_SLUG = {
  'chapter01/k01_interview_harald.mp4': '01_22_int_hb_who',
  'chapter01/k01_interview_peter.mp4': '01_26_int_ph_who',
  'chapter01/k01_a10.mp4': '01_28_sik_bus-to-uni',
  'chapter01/k01_a14.mp4': '01_15_int_bg_who',
  'chapter01/k01_a15.mp4': '01_15_int_bg_who',
  'chapter01/k01_a17.mp4': '01_02_int_ag_who',
  'chapter01/k01_a20.mp4': '01_29_sik_student-id',
  'chapter01/k01_a22.mp4': '01_16_int_bg_studies-home',
  'chapter01/k01_a25.mp4': '01_06_int_hm_studies-home',
  'chapter01/k01_a26.mp4': '01_09_int_ec_friends',
  'chapter01/k01_a27.mp4': '01_16_int_bg_studies-home',
  'chapter01/k01_a28.mp4': '01_24_int_ju_studies-home',
  'chapter01/k01_a30.mp4': '01_30_sik_cell-phone',

  'chapter02/k02_a01.mp4': '02_01_intro_university',
  'chapter02/k02_a02.mp4': '02_02_int_ek_studies',
  'chapter02/k02_a03.mp4': '02_03_int_ag_studies',
  'chapter02/k02_a04.mp4': '02_06_int_bg_studies',
  'chapter02/k02_a05.mp4': '02_09_int_hm_studies',
  'chapter02/k02_a06.mp4': '02_07_int_hb_studies',
  'chapter02/k02_a08.mp4': '02_10_int_scl_favorite',
  'chapter02/k02_a09.mp4': '02_11_int_bg_favorite',
  'chapter02/k02_a12.mp4': '02_18_int_hm_class',
  'chapter02/k02_a13.mp4': '02_22_int_sco_class',
  'chapter02/k02_a16.mp4': '02_16_sik_katrin-studies',
  'chapter02/k02_a18.mp4': '02_24_int_bg_requirements',
  'chapter02/k02_a22.mp4': '02_26_sik_katrin-abroad',
  'chapter02/k02_a27.mp4': '02_29_sik_bernas-house',
  'chapter02/k02_a28.mp4': '02_30_sik_sara-kitchen',
  'chapter02/k02_a33.mp4': '02_35_sik_tobe-computer',
  'chapter02/k02_a34.mp4': '02_34_int_hb_email',

  'chapter03/k03_a02.mp4': '03_01_int_ec_typischertag',
  'chapter03/k03_a03.mp4': '03_03_int_bg_typischertag',
  'chapter03/k03_a04.mp4': '03_05_int_hm_typischertag',
  'chapter03/k03_a11_berna.mp4': '03_24_int_bg_morgenmensch',
  'chapter03/k03_a11_eva.mp4': '03_25_int_ek_morgenmensch',
  'chapter03/k03_a11_harald.mp4': '03_26_int_hb_morgenmensch',
  'chapter03/k03_a11_jan.mp4': '03_27_int_ju_morgenmensch',
  'chapter03/k03_a11_adan.mp4': '03_28_int_ag_morgenmensch',
  'chapter03/k03_a11_hassan.mp4': '03_20_int_hm_morgenmensch',
  'chapter03/k03_a11_erin.mp4': '03_30_int_ec_morgenmensch',
  'chapter03/k03_a11_sara.mp4': '03_31_int_sco_morgenmensch',
  'chapter03/k03_a13_berna.mp4': '03_08_int_bg_mittag',
  'chapter03/k03_a13_jan.mp4': '03_09_int_ju_mittag',
  'chapter03/k03_a13_adan.mp4': '03_28_int_ag_morgenmensch',
  'chapter03/k03_a13_erin.mp4': '03_06_int_ec_fruhstuck',
  'chapter03/k03_a13.mp4': '03_06_int_ec_fruhstuck',
  'chapter03/k03_a17_berna.mp4': '03_08_int_bg_mittag',
  'chapter03/k03_a17_jan.mp4': '03_09_int_ju_mittag',
  'chapter03/k03_a19_doener.mp4': '03_50_sik_donerowner',
  'chapter03/k03_a19.mp4': '03_50_sik_donerowner',
  'chapter03/k03_a20_doener_kaufen.mp4': '03_55_sik_doeneraanda',
  'chapter03/k03_a25_adan.mp4': '03_19_int_ag_kaffee',
  'chapter03/k03_a25_eva.mp4': '03_21_int_ek_kaffee',
  'chapter03/k03_a25_harald.mp4': '03_22_int_hb_kaffee',
  'chapter03/k03_a26_eis.mp4': '03_30_sik_icecream',
  'chapter03/k03_a30_sophia.mp4': '03_26_sik_sophiaimsupermarkt',
  'chapter03/k03_a31_obst.mp4': '03_51_sik_obst',
  'chapter03/k03_a31_gemuese.mp4': '03_52_sik_gemuse',
  'chapter03/k03_a33_austin.mp4': '03_46_sik_anafood',
  'chapter03/k03_a36_drogerie.mp4': '03_44_sik_drogerie'
};

function collectNeededPaths(data) {
  const paths = new Set();
  function walk(o) {
    if (!o || typeof o !== 'object') return;
    if (Array.isArray(o)) {
      o.forEach(walk);
      return;
    }
    for (const [k, v] of Object.entries(o)) {
      if (k === 'videoPath' && typeof v === 'string' && v.endsWith('.mp4')) paths.add(v);
      else walk(v);
    }
  }
  walk(data);
  for (const a of data.activities) {
    const ch = a.chapter ?? 1;
    if (ch > 3) continue;
    getActivityVideoClips(a).forEach((c) => paths.add(c.relativePath));
  }
  return [...paths].sort();
}

async function downloadFile(url, dest) {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  await fs.promises.mkdir(path.dirname(dest), { recursive: true });
  const tmp = `${dest}.part`;
  await pipeline(res.body, fs.createWriteStream(tmp));
  await fs.promises.rename(tmp, dest);
}

async function main() {
  const jsonPath = path.join(REPO_ROOT, 'electron-app/react-app/src/data/activites.json');
  const data = JSON.parse(await fs.promises.readFile(jsonPath, 'utf8'));
  const needed = collectNeededPaths(data);

  const missingMap = [];
  for (const rel of needed) {
    const abs = path.join(VIDEOS_ROOT, rel);
    try {
      await fs.promises.access(abs, fs.constants.R_OK);
    } catch {
      missingMap.push(rel);
    }
  }

  if (!missingMap.length) {
    console.log('All referenced chapter 1–3 videos already exist under', VIDEOS_ROOT);
    return;
  }

  console.log('Missing', missingMap.length, 'files. Downloading…');

  for (const rel of missingMap) {
    const slug = COERLL_SLUG[rel];
    if (!slug) {
      console.warn('SKIP (no COERLL mapping):', rel);
      continue;
    }
    const url = `${MEDIA_BASE}${slug}.mp4`;
    const dest = path.join(VIDEOS_ROOT, rel);
    process.stdout.write(`${rel} <= ${slug}.mp4 … `);
    try {
      await downloadFile(url, dest);
      const st = await fs.promises.stat(dest);
      console.log('OK', `(${(st.size / 1e6).toFixed(1)} MB)`);
    } catch (e) {
      console.log('FAIL', e.message);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
