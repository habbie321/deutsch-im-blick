/**
 * Generates Kapitel 5–10 activities: QR-linked multi_speaker_writing (like Kapitel 4) + writing fallbacks.
 * Run from react-app: node scripts/build-chapters-5-10-json.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseActivityTitles } from './parse-activity-titles.mjs';
import { reorderActivityKeys } from './activity-key-order.mjs';
import { SPEAKER_ROWS } from './chapters-5-10-speakers.mjs';
import { DEFAULT_VIDEO_QUESTIONS, videoPath } from './chapter-video-path.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function pdfUrl(chapter) {
  return `https://coerll.utexas.edu/dib/pdfs/k_${String(chapter).padStart(2, '0')}.pdf`;
}

function tocUrl(chapter) {
  return `https://coerll.utexas.edu/dib/toc.php?k=${chapter}`;
}

function vocUrl(chapter) {
  return `https://coerll.utexas.edu/dib/voc.php?k=${chapter}`;
}

function links(chapter) {
  return [
    { label: `Kapitel ${chapter} · Videos & Übersicht`, url: tocUrl(chapter) },
    { label: `Kapitel ${chapter} · Wortschatz`, url: vocUrl(chapter) },
    { label: `Workbook PDF (Kapitel ${chapter})`, url: pdfUrl(chapter) }
  ];
}

function isLieder(titleSuffix) {
  return titleSuffix.toLowerCase().includes('lieder & musik');
}

function isSprache(titleSuffix) {
  return titleSuffix.includes('Sprache im Kontext');
}

const TITLE_OVERRIDES = {
  '6:13': 'Sprache im Kontext: Wie waren ihre letzten Reisen?',
  '6:24': 'Sprache im Kontext: Josh, Doug und Susan — Reisen in Europa',
  '7:10': 'Sprache im Kontext: Die Körperteile (Stephan)'
};

function applyTitleOverride(chapter, id, titleSuffix) {
  return TITLE_OVERRIDES[`${chapter}:${id}`] ?? titleSuffix;
}

/** Travel / interview vocabulary — Kapitel 6 Akt. 1 (Teil B) */
const WORD_BANK_CH6_A1 = [
  { german: 'reisen', english: 'to travel' },
  { german: 'der Urlaub', english: 'vacation' },
  { german: 'das Flugzeug', english: 'airplane' },
  { german: 'die Bahn', english: 'train / rail' },
  { german: 'der Bahnhof', english: 'train station' },
  { german: 'günstig', english: 'inexpensive' },
  { german: 'teuer', english: 'expensive' },
  { german: 'die Sehenswürdigkeit', english: 'sight (tourist)' },
  { german: 'die Reise', english: 'trip, journey' }
];

function buildMultiSpeaker(chapter, id, titleSuffix, rows) {
  const pdf = pdfUrl(chapter);
  const speakers = rows.map((r) => ({
    id: r.id,
    name: `${r.label} (QR ${r.qr})`,
    videoPath: videoPath(chapter, id, r.id),
    questions: [...DEFAULT_VIDEO_QUESTIONS]
  }));
  const duration = rows.length >= 5 ? '40 min' : rows.length >= 3 ? '30 min' : '20 min';
  const intro = isSprache(titleSuffix)
    ? `Watch each QR-linked „Sprache im Kontext” clip in order. Complete the blanks, tables, and reflection prompts in the Kapitel ${chapter} PDF for Aktivität ${id}.`
    : `Watch the interview / listening clips in the workbook (QR codes). Take notes in German while you listen, then complete the written follow-up in the PDF.`;

  const base = {
    chapter,
    id,
    type: 'multi_speaker_writing',
    icon: 'videoclips',
    title: `Aktivität ${id}. ${titleSuffix}`,
    description: `Video-based listening and writing from the COERLL Deutsch im Blick Kapitel ${chapter} workbook.`,
    duration,
    prerequisites: [],
    intro,
    speakers,
    links: links(chapter),
    pdfNote: `COERLL Kapitel ${chapter} workbook: ${pdf}`
  };

  if (chapter === 6 && id === 1) {
    base.wordBank = WORD_BANK_CH6_A1;
  }

  return base;
}

function buildActivity(chapter, id, titleSuffix) {
  const pdf = pdfUrl(chapter);
  const baseNote = `COERLL Kapitel ${chapter} workbook: ${pdf}`;
  const key = `${chapter}:${id}`;
  const rows = SPEAKER_ROWS[key];

  if (rows && rows.length > 0) {
    return buildMultiSpeaker(chapter, id, titleSuffix, rows);
  }

  if (isLieder(titleSuffix)) {
    return {
      chapter,
      id,
      type: 'writing',
      icon: 'readingtask',
      title: `Aktivität ${id}. ${titleSuffix}`,
      description: `Song and music exercises for Kapitel ${chapter} on the Deutsch im Blick website.`,
      duration: '25 min',
      prerequisites: [],
      intro:
        `On the Deutsch im Blick chapter page, open „Lieder & Musik”, download the song PDF, and complete the exercises there. The same chapter’s course-pack PDF (${pdf}) gives broader context.`,
      tasks: [
        'Complete the Lieder & Musik exercises on the DiB website for this chapter.',
        'Note new vocabulary from the lyrics and reuse it in one short written response.'
      ],
      links: links(chapter),
      pdfNote: baseNote
    };
  }

  const icon = isSprache(titleSuffix) ? 'videoclips' : 'writing';
  const intro = isSprache(titleSuffix)
    ? `Follow the workbook prompts for this „Sprache im Kontext” section. Use the QR-linked videos on the Deutsch im Blick Kapitel ${chapter} page (${tocUrl(chapter)}) where the PDF directs you, then complete the written follow-up in the PDF.`
    : `Work through this activity in the Kapitel ${chapter} workbook PDF. Use the chapter website for QR-linked interviews and „Sprache im Kontext” clips when the PDF points to them.`;

  return {
    chapter,
    id,
    type: 'writing',
    icon,
    title: `Aktivität ${id}. ${titleSuffix}`,
    description: `Workbook activity from the COERLL Deutsch im Blick Kapitel ${chapter} course pack.`,
    duration: '20 min',
    prerequisites: [],
    intro,
    tasks: [
      'Answer in German following the prompts and layout in the PDF.',
      'Use the Wortschatz link for this chapter if you need topic vocabulary.'
    ],
    links: links(chapter),
    pdfNote: baseNote
  };
}

function loadTitles(chapter) {
  const file = path.join(__dirname, 'pdf-extracts', `k_${String(chapter).padStart(2, '0')}.txt`);
  const text = fs.readFileSync(file, 'utf8');
  return parseActivityTitles(text);
}

const newActivities = [];
for (let chapter = 5; chapter <= 10; chapter++) {
  const titles = loadTitles(chapter);
  titles.forEach((suffix, idx) => {
    const id = idx + 1;
    newActivities.push(buildActivity(chapter, id, applyTitleOverride(chapter, id, suffix)));
  });
}

const dataPath = path.join(__dirname, '../src/data/activites.json');
const raw = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const keep = raw.activities.filter((a) => a.chapter < 5);
const merged = [...keep, ...newActivities].map(reorderActivityKeys);

fs.writeFileSync(dataPath, JSON.stringify({ activities: merged }, null, 2));
console.log('Wrote', newActivities.length, 'activities (chapters 5–10). Total:', merged.length);

const titlesOut = path.join(__dirname, '../src/data/chapters-5-10-titles.json');
const titlesObj = {};
for (let ch = 5; ch <= 10; ch++) {
  titlesObj[ch] = loadTitles(ch);
}
fs.writeFileSync(titlesOut, JSON.stringify(titlesObj, null, 2));
console.log('Wrote', titlesOut);
