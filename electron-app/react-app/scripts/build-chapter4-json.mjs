/**
 * Generates Kapitel 4 activities aligned with COERLL k_04.pdf
 * Run: node scripts/build-chapter4-json.mjs
 * Then merge output into src/data/activites.json (or use merge script).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { reorderActivityKeys } from './activity-key-order.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PDF = 'https://coerll.utexas.edu/dib/pdfs/k_04.pdf';
const TOC = 'https://coerll.utexas.edu/dib/toc.php?k=4';
const VOC = 'https://coerll.utexas.edu/dib/voc.php?k=4';

const wb = (partial) => ({
  type: 'workbook',
  icon: partial.icon || 'groupactivity',
  chapter: 4,
  prerequisites: [],
  duration: partial.duration || '20 min',
  pdfNote: partial.pdfNote || `COERLL Kapitel 4 workbook: ${PDF}`,
  links: partial.links || [
    { label: 'Kapitel 4 · Videos & Übersicht', url: TOC },
    { label: 'Kapitel 4 · Wortschatz', url: VOC }
  ],
  ...partial
});

const writing = (partial) => ({
  type: 'writing',
  icon: partial.icon || 'writing',
  chapter: 4,
  prerequisites: [],
  duration: partial.duration || '15 min',
  pdfNote: partial.pdfNote || `COERLL Kapitel 4 workbook: ${PDF}`,
  links: partial.links || [
    { label: 'Kapitel 4 · Videos & Übersicht', url: TOC },
    { label: 'Kapitel 4 · Wortschatz', url: VOC }
  ],
  ...partial
});

const multiSpeaker = (partial) => ({
  type: 'multi_speaker_writing',
  icon: 'videoclips',
  chapter: 4,
  prerequisites: [],
  duration: partial.duration || '25 min',
  pdfNote: partial.pdfNote || `COERLL Kapitel 4 workbook: ${PDF}`,
  links: partial.links || [
    { label: 'Kapitel 4 · Videos & Übersicht', url: TOC },
    { label: 'Kapitel 4 · Wortschatz', url: VOC }
  ],
  ...partial
});

const matching = (partial) => ({
  type: 'matching_activity',
  icon: 'readingtask',
  chapter: 4,
  prerequisites: [],
  duration: partial.duration || '15 min',
  pdfNote: partial.pdfNote || `COERLL Kapitel 4 workbook: ${PDF}`,
  links: partial.links || [
    { label: 'Kapitel 4 · Videos & Übersicht', url: TOC },
    { label: 'Kapitel 4 · Wortschatz', url: VOC }
  ],
  ...partial
});

/** Teil B Akt. 2 — German phrase → English (workbook p. 161) */
const freizeitMatchingPairs = [
  { id: 1, german: 'in die Disco gehen', english: 'to go to a club' },
  { id: 2, german: 'mit Freunden ausgehen', english: 'to go out with friends' },
  { id: 3, german: 'Freunde besuchen oder treffen', english: 'to visit or meet friends' },
  { id: 4, german: 'Gitarre spielen', english: 'to play guitar' },
  { id: 5, german: 'klettern gehen', english: 'to go climbing' },
  { id: 6, german: 'in die Kneipe gehen', english: 'to go to a bar' },
  { id: 7, german: 'Musik hören', english: 'to listen to music' },
  { id: 8, german: 'in die Natur gehen', english: 'to go into nature' },
  { id: 9, german: 'reisen', english: 'to travel' },
  { id: 10, german: 'rudern', english: 'to row' },
  { id: 11, german: 'spazieren gehen', english: 'to go walking' },
  { id: 12, german: 'Sport treiben', english: 'to do sports' },
  { id: 13, german: 'tanzen', english: 'to dance' },
  { id: 14, german: 'in den Bergen wandern', english: 'to hike in the mountains' }
];

/** Akt. 13 — clothing (correct pairs from workbook) */
const kleidungMatchingPairs = [
  { id: 1, german: 'der Anzug', english: 'suit' },
  { id: 2, german: 'der Badeanzug', english: 'bathing suit' },
  { id: 3, german: 'der Gürtel', english: 'belt' },
  { id: 4, german: 'der Hut', english: 'hat' },
  { id: 5, german: 'das Kleid', english: 'dress' },
  { id: 6, german: 'der Mantel', english: 'coat' },
  { id: 7, german: 'der Pullover / der Pulli', english: 'sweater' },
  { id: 8, german: 'die Socken', english: 'socks' },
  { id: 9, german: 'die Stiefel', english: 'boots' },
  { id: 10, german: 'die Unterhose', english: 'underwear' }
];

const freizeitWordBank = [
  { german: 'in die Disco gehen', english: 'to go to a disco/club' },
  { german: 'Fahrrad fahren', english: 'to ride a bike' },
  { german: 'mit Freunden ausgehen', english: 'to go out with friends' },
  { german: 'Freunde besuchen oder treffen', english: 'to visit or meet friends' },
  { german: 'Gitarre spielen', english: 'to play guitar' },
  { german: 'schlafen', english: 'to sleep' },
  { german: 'Kaffee trinken gehen', english: 'to go for coffee' },
  { german: 'mit den Katzen spielen', english: 'to play with the cats' },
  { german: 'klettern gehen', english: 'to go climbing' },
  { german: 'in die Kneipen gehen', english: 'to go to bars' },
  { german: 'lesen', english: 'to read' },
  { german: 'Musik hören', english: 'to listen to music' },
  { german: 'in die Natur gehen', english: 'to go into nature' },
  { german: 'reisen', english: 'to travel' },
  { german: 'rudern', english: 'to row' },
  { german: 'spazieren gehen', english: 'to go for a walk' },
  { german: 'Sport machen', english: 'to do sports' },
  { german: 'tanzen', english: 'to dance' },
  { german: 'in den Bergen wandern', english: 'to hike in the mountains' }
];

const speakersFreizeit = [
  { id: 'berna', name: 'Berna (QR 4.2)', videoPath: 'chapter04/k04_a02_berna.mp4', questions: ['Welche Freizeitaktivitäten werden genannt? (Notizen)'] },
  { id: 'adan', name: 'Adan (QR 4.7)', videoPath: 'chapter04/k04_a02_adan.mp4', questions: ['Welche Freizeitaktivitäten werden genannt? (Notizen)'] },
  { id: 'eva', name: 'Eva (QR 4.3)', videoPath: 'chapter04/k04_a02_eva.mp4', questions: ['Welche Freizeitaktivitäten werden genannt? (Notizen)'] },
  { id: 'hassan', name: 'Hassan (QR 4.8)', videoPath: 'chapter04/k04_a02_hassan.mp4', questions: ['Welche Freizeitaktivitäten werden genannt? (Notizen)'] },
  { id: 'harald', name: 'Harald (QR 4.4)', videoPath: 'chapter04/k04_a02_harald.mp4', questions: ['Welche Freizeitaktivitäten werden genannt? (Notizen)'] },
  { id: 'erin', name: 'Erin (QR 4.9)', videoPath: 'chapter04/k04_a02_erin.mp4', questions: ['Welche Freizeitaktivitäten werden genannt? (Notizen)'] },
  { id: 'jan', name: 'Jan (QR 4.5)', videoPath: 'chapter04/k04_a02_jan.mp4', questions: ['Welche Freizeitaktivitäten werden genannt? (Notizen)'] },
  { id: 'sara', name: 'Sara (QR 4.10)', videoPath: 'chapter04/k04_a02_sara.mp4', questions: ['Welche Freizeitaktivitäten werden genannt? (Notizen)'] },
  { id: 'peter', name: 'Peter (QR 4.6)', videoPath: 'chapter04/k04_a02_peter.mp4', questions: ['Welche Freizeitaktivitäten werden genannt? (Notizen)'] },
  { id: 'sophia', name: 'Sophia (QR 4.11)', videoPath: 'chapter04/k04_a02_sophia.mp4', questions: ['Welche Freizeitaktivitäten werden genannt? (Notizen)'] }
];

const activities = [
  writing({
    id: 1,
    title: 'Aktivität 1. Was machst du gern in deiner Freizeit?',
    description: 'Brainstorm hobbies and leisure activities (Hobbys und Interessen).',
    duration: '15 min',
    icon: 'groupactivity',
    intro:
      'You already talked a little about „Hobbys und Interessen“. Think back and collect as many hobbies and leisure-time activities as you can think of.',
    tasks: ['List as many hobbies and Freizeitaktivitäten as you can in German and/or English, then expand a few into short German phrases.']
  }),

  multiSpeaker({
    id: 2,
    title: 'Aktivität 2. Freizeitaktivitäten — Teil A',
    description: 'Watch „In der Freizeit“ clips; note what each speaker enjoys.',
    duration: '35 min',
    intro:
      'Teil A: What do the native speakers and American students like to do in their free time? Watch the videos „In der Freizeit“ and note which activities each speaker enjoys. Teil B (Zuordnung) follows as the next activity.',
    wordBank: freizeitWordBank,
    speakers: speakersFreizeit
  }),

  matching({
    id: 2.5,
    title: 'Aktivität 2. Freizeitaktivitäten — Teil B',
    description: 'Match German free-time phrases with their English meanings.',
    duration: '15 min',
    intro:
      'You are already familiar with many activities from earlier chapters. For the newer phrases, match each German expression with the English that fits best (as in the workbook).',
    leftColumnTitle: 'Deutsch',
    rightColumnTitle: 'English',
    matchInstruction: 'Match each German phrase with its English equivalent.',
    matchingPairs: freizeitMatchingPairs
  }),

  writing({
    id: 3,
    title: 'Aktivität 3. Jetzt bist du dran!',
    description: 'Reflect on your own free time: how much, when, and what you do.',
    duration: '20 min',
    intro:
      'How much free time do YOU have at the moment? When do you have free time? How do you spend it? (Wie viel Freizeit hast du? Wann hast du Freizeit? Was machst du gern in deiner Freizeit?)',
    tasks: [
      'Wie viel Freizeit hast du im Moment? (sehr viel / viel / ein wenig / wenig / gar keine)',
      'Wann hast du Freizeit? (times, days, weekends …)',
      'Was machst du gern in deiner Freizeit? Write several sentences in German.'
    ]
  }),

  writing({
    id: 4,
    title: 'Aktivität 4. Eine kleine Reportage: Das Wochenende',
    description: 'Devise interview questions, interview a partner, then report.',
    duration: '30 min',
    icon: 'groupactivity',
    intro:
      'One of the greatest sources of free time is the weekend. A. With a partner, develop five questions about what you usually do on weekends (use W-words: Wann, Was, Wie lange, Wo, Wohin, Warum, …). B. Interview each other and jot down answers. C. Report to the class what you learned about your partner.',
    tasks: [
      'A. Schreiben Sie fünf Interviewfragen (Frage #1–#5).',
      'B. Antworten Ihres Partners / Ihrer Partnerin (Antwort #1–#5).',
      'C. Kurze Reportage: Mein Partner / meine Partnerin … (3–4 Sätze).'
    ]
  }),

  writing({
    id: 5,
    title: 'Aktivität 5. Was machen Studenten am Wochenende?',
    description: 'Top-10 weekend activities and typical student habits.',
    duration: '20 min',
    icon: 'groupactivity',
    intro:
      'A. Based on Aktivität 4, collect common answers as a class (here: brainstorm individually), then rank a Top-10 list from 10 to 1. B. What do typical students do on the weekend? Write 4–5 statements in German.',
    tasks: [
      'A. Top-10 Liste: Platz 10 … Platz 1 (liebste Aktivität).',
      'B. 4–5 Sätze: Typische Studenten am Wochenende … (Beispiel: Typische UT-Studenten sehen am Wochenende viel fern.)'
    ]
  }),

  wb({
    id: 6,
    title: 'Aktivität 6. Während der Woche versus am Wochenende',
    description: 'Sort activities by week vs weekend; modal reflections.',
    duration: '25 min',
    icon: 'readingtask',
    intro:
      'How does your lifestyle during the week differ from the weekend? A. Sort each activity: während der Woche or am Wochenende (check all that apply for you). B. Then note what you want to / must / can / may do — as in the workbook.',
    checks: {
      blocks: [
        { type: 'sectionTitle', text: 'A. Während der Woche oder am Wochenende?' },
        {
          type: 'multi',
          id: 'k06_woche',
          question: 'Which do you do während der Woche? (check all that apply)',
          options: [
            'ausgehen',
            'Besorgungen machen',
            'fernsehen',
            'Freunde treffen',
            'Hausaufgaben machen',
            'ins Internet gehen',
            'Bücher lesen',
            'in den Bergen wandern',
            'viel schlafen',
            'Sport machen',
            'in die Stadt fahren',
            'zum Unterricht gehen'
          ],
          correctIndices: []
        },
        {
          type: 'multi',
          id: 'k06_wochenende',
          question: 'Which do you do am Wochenende?',
          options: [
            'ausgehen',
            'Besorgungen machen',
            'fernsehen',
            'Freunde treffen',
            'Hausaufgaben machen',
            'ins Internet gehen',
            'Bücher lesen',
            'in den Bergen wandern',
            'viel schlafen',
            'Sport machen',
            'in die Stadt fahren',
            'zum Unterricht gehen'
          ],
          correctIndices: []
        },
        { type: 'sectionTitle', text: 'B. Modalverben — Notizen (optional)' },
        {
          type: 'text',
          id: 'k06_modals',
          prompts: [
            'Was ich machen möchte (Stichpunkte):',
            'Was ich machen muss:',
            'Was ich (nicht) machen kann:',
            'Was ich (nicht) machen will:',
            'Was ich machen soll:',
            'Was ich (nicht) machen darf:'
          ]
        },
        {
          type: 'text',
          id: 'k06_partner_fragen',
          prompts: [
            'Fragen an den Partner (du-Form): z. B. Was musst du am Wochenende tun?',
            'Weitere Partnerfragen:'
          ]
        }
      ]
    }
  }),

  writing({
    id: 7,
    title: 'Aktivität 7. Eine perfekte Woche',
    description: 'Plan your perfect week and negotiate a joint activity with a partner.',
    duration: '30 min',
    icon: 'groupactivity',
    intro:
      'What would you do if you could plan the perfect week? A. Choose at least eight activities (from the list or your own). B. Create a plan: which activity on which day? C. With a partner, find a time to do something together (ask questions; do not look at each other’s schedules). D. Notes on your partner’s plan and what you might do together.',
    tasks: [
      'A. Mindestens 8 Aktivitäten (schwimmen, einkaufen gehen, faulenzen, …).',
      'B. Wochenplan: Montag–Sonntag (Stichpunkte).',
      'C. Fragen an den Partner (z. B. Was willst du am Montag machen?).',
      'D. Was mein Partner machen möchte / gemeinsame Aktivität:'
    ]
  }),

  writing({
    id: 8,
    title: 'Aktivität 8. Wohin kann man gehen?',
    description: 'Match activities with places (Biergarten, Kino, Restaurant, …).',
    duration: '20 min',
    icon: 'readingtask',
    intro:
      'Where can one go to do the following activities? Use the word bank destinations (each destination may be used more than once). Complete the sentences as in the workbook.',
    wordBank: [
      { german: '(zum) Biergarten', english: 'beer garden' },
      { german: '(auf die) Kirmes', english: 'fair / carnival' },
      { german: '(in den) Park', english: 'park' },
      { german: '(ins) Café', english: 'café' },
      { german: '(in die) Kneipe', english: 'pub' },
      { german: '(ins) Restaurant', english: 'restaurant' },
      { german: '(zur) Dönerbude', english: 'döner shop' },
      { german: '(ins) Konzert', english: 'concert' },
      { german: '(ins) Theater', english: 'theater' },
      { german: '(ins) Einkaufszentrum', english: 'shopping mall' },
      { german: '(ins) Museum', english: 'museum' },
      { german: '(zur) Vorlesung', english: 'lecture (university)' },
      { german: '(ins) Kino', english: 'cinema' },
      { german: '(in die) Oper', english: 'opera' }
    ],
    tasks: [
      '1. Wenn man ein Bier trinken möchte, kann man …',
      '2. Wenn man gute Musik hören möchte, kann man …',
      '3. Wenn man einen Film sehen möchte, kann man …',
      '4. Wenn man einen Döner essen möchte, kann man …',
      '5. Wenn man eine Pizza essen möchte, kann man …',
      '6. Wenn man Kleidung kaufen möchte, kann man …'
    ]
  }),

  wb({
    id: 9,
    title: 'Aktivität 9. Was magst du lieber?',
    description: 'Partner preferences (Magst du lieber …?) and reasons with denn.',
    duration: '25 min',
    intro:
      'A. With a partner, take turns asking preferences (Tee oder Kaffee, …). B. Think about reasons (Vorliebe / Grund). C. Write at least four complete sentences using denn or weil to explain your preferences.',
    checks: {
      blocks: [
        { type: 'sectionTitle', text: 'A. Partnernotizen (Kurz)' },
        {
          type: 'text',
          id: 'k09_partner',
          prompts: [
            'Lieblingsantworten deines Partners (Stichworte):',
            'Habt ihr viel gemeinsam oder seid ihr verschieden?'
          ]
        },
        { type: 'sectionTitle', text: 'C. Sätze mit denn / weil (mind. 4)' },
        {
          type: 'text',
          id: 'k09_denn',
          prompts: [
            '1. Ich mag lieber …, denn …',
            '2.',
            '3.',
            '4.'
          ]
        }
      ]
    }
  }),

  writing({
    id: 10,
    title: 'Aktivität 10. Eine Verbesserung',
    description: 'Rewrite your paragraph from Akt. 6 using coordinating conjunctions.',
    duration: '20 min',
    intro:
      'Revisit Aktivität 6. Read your notes and incorporate coordinating conjunctions: aber, denn, oder, sondern, und. A. Rewrite your paragraph. B. Exchange with a partner and jot down improvement suggestions.',
    helpfulExpressions: [
      { german: 'aber', english: 'but' },
      { german: 'denn', english: 'because' },
      { german: 'oder', english: 'or' },
      { german: 'sondern', english: 'but rather' },
      { german: 'und', english: 'and' }
    ],
    tasks: [
      'A. Überarbeiteter Absatz mit Konjunktionen:',
      'B. Vorschläge vom Partner / von der Partnerin:'
    ]
  }),

  multiSpeaker({
    id: 11,
    title: 'Aktivität 11. Kleidung kaufen',
    description: 'Watch each clip; answer the six workbook questions (notes).',
    duration: '25 min',
    intro:
      'Watch the „Kleidung kaufen“ clips (QR 4.12–4.16) for Berna, Eva, Harald, Erin, and Sara. Use each speaker step for notes, then answer the six questions on the last step.',
    speakers: [
      { id: 'berna', name: 'Berna (QR 4.12)', videoPath: 'chapter04/k04_a11_berna.mp4', questions: ['Notizen (Kleidung kaufen):'] },
      { id: 'eva', name: 'Eva (QR 4.13)', videoPath: 'chapter04/k04_a11_eva.mp4', questions: ['Notizen:'] },
      { id: 'harald', name: 'Harald (QR 4.14)', videoPath: 'chapter04/k04_a11_harald.mp4', questions: ['Notizen:'] },
      { id: 'erin', name: 'Erin (QR 4.15)', videoPath: 'chapter04/k04_a11_erin.mp4', questions: ['Notizen:'] },
      { id: 'sara', name: 'Sara (QR 4.16)', videoPath: 'chapter04/k04_a11_sara.mp4', questions: ['Notizen:'] },
      {
        id: 'fragen',
        name: 'Fragen zum Text (alle Sprecher)',
        questions: [
          '1. Wie oft geht Berna Kleidung kaufen?',
          '2. Wohin fährt Eva, wenn sie Kleidung kaufen möchte?',
          '3. Wer kauft Kleidung im Internet?',
          '4. Wo kauft Harald seine Kleidung? (bei …)',
          '5. Was kaufte Erin das letzte Mal?',
          '6. Wessen Lieblingsläden sind Galeria Kaufhof und H&M?'
        ]
      }
    ]
  }),

  multiSpeaker({
    id: 12,
    title: 'Aktivität 12. Einkaufsgewohnheiten – Ein kleines Interview',
    description: 'Interview two classmates about shopping habits.',
    duration: '20 min',
    icon: 'groupactivity',
    intro:
      'Ask two classmates how often they buy clothes, how much they spend per month, where they shop, and their favorite store.',
    speakers: [
      {
        id: 'p1',
        name: 'Partner(in) 1',
        questions: [
          'Wie oft gehst du Kleidung kaufen?',
          'Wie viel Geld gibst du jeden Monat für Kleidung aus?',
          'Wo kaufst du am liebsten Kleidung?',
          'Was ist dein Lieblingsgeschäft?'
        ]
      },
      {
        id: 'p2',
        name: 'Partner(in) 2',
        questions: [
          'Wie oft gehst du Kleidung kaufen?',
          'Wie viel Geld gibst du jeden Monat für Kleidung aus?',
          'Wo kaufst du am liebsten Kleidung?',
          'Was ist dein Lieblingsgeschäft?'
        ]
      }
    ]
  }),

  matching({
    id: 13,
    title: 'Aktivität 13. Wie heißen die Kleidungsstücke?',
    description: 'Match German clothing words with English (H&M / drawings).',
    duration: '15 min',
    intro:
      'Browse H&M’s German site if you like, then match each clothing item with its English equivalent (workbook).',
    leftColumnTitle: 'Deutsch',
    rightColumnTitle: 'English',
    matchInstruction: 'Match each German word with the correct English meaning.',
    matchingPairs: kleidungMatchingPairs
  }),

  writing({
    id: 14,
    title: 'Aktivität 14. Alles durcheinander!',
    description: 'Odd one out: clothing groups in the department store.',
    duration: '15 min',
    icon: 'readingtask',
    intro:
      'Which clothing item does not belong with the others? For each row (A–C), name the items, mark the odd one out, and explain why (workbook).',
    tasks: [
      'A. Vier Begriffe + Ausreißer + Begründung',
      'B. Vier Begriffe + Ausreißer + Begründung',
      'C. Vier Begriffe + Ausreißer + Begründung'
    ]
  }),

  writing({
    id: 15,
    title: 'Aktivität 15. Was trägt mein Lieblingsstar?',
    description: 'Label a star’s outfit and describe each piece.',
    duration: '20 min',
    intro:
      'Find a picture of your favorite movie or music star. Label the clothing and write one sentence per item (modisch, schick, hässlich, …).',
    tasks: ['Beschreibung und Bewertung der Kleidungsstücke (mit Adjektiven):']
  }),

  writing({
    id: 16,
    title: 'Aktivität 16. Ratespiel',
    description: 'Describe your outfit for others to guess who you are.',
    duration: '15 min',
    icon: 'groupactivity',
    intro:
      'On a small sheet, describe your own outfit in detail (colors, schick/bunt, …). In class someone reads descriptions aloud and others guess — here, write your description.',
    tasks: ['Ich trage … (ausführliche Beschreibung für das Ratespiel):']
  }),

  writing({
    id: 17,
    title: 'Aktivität 17. Was trägst du wo?',
    description: 'What would you wear hiking, camping, beach, ski, concert?',
    duration: '15 min',
    tasks: [
      'Zum Wandern trage ich …',
      'Beim Camping trage ich …',
      'Zum Strandurlaub nehme ich … mit.',
      'Im Skiurlaub trage ich …',
      'Auf einem Rockkonzert trage ich …'
    ]
  }),

  writing({
    id: 18,
    title: 'Aktivität 18. Einkaufen online',
    description: '250 € gift card — plan purchases at Peek & Cloppenburg or H&M.',
    duration: '25 min',
    icon: 'readingtask',
    intro:
      'Visit peek-cloppenburg.de or shop.hm.com/de/. Imagine a 250 € Gutschein zum Geburtstag. What do you buy? How do the items look? Take notes for a partner — they draw your choices.',
    links: [
      { label: 'Peek & Cloppenburg', url: 'https://www.peek-cloppenburg.de/' },
      { label: 'H&M Deutschland', url: 'https://www2.hm.com/de_de/index.html' }
    ],
    tasks: ['Was kaufst du? Wie sehen die Kleidungsstücke aus? (Stichpunkte + Preise)', 'Partnerzeichnung — passt das? (Kurz kommentieren)']
  }),

  writing({
    id: 19,
    title: 'Aktivität 19. Interviews: Die beste Musik',
    description: 'Watch music interviews; match preferences to speakers.',
    duration: '35 min',
    intro:
      'Read the musical preference descriptions in the workbook, then watch each speaker (QR 4.17–4.26). Write which speaker matches each numbered description.',
    tasks: [
      '1. Er mag Rap-Musik und deutschsprachige Musik. → Sprecher(in):',
      '2. Er mag amerikanischen Rock, Folkmusik, Jazz und Blues … →',
      '3. Sie mag besonders gern Musik aus den 70er Jahren … →',
      '4. Sie mag viel Musik, aber kein bestimmtes Genre. →',
      '5. Er mag klassische Musik und klassischen Rock ’n’ Roll … →',
      '6. Sie mag klassische Musik, aber sie hört alles gern. →',
      '7. Er mag jede Musik, aber am besten klassische Musik und Hip-Hop. →',
      '8. Sie mag alles außer Techno; Fan von Country. →',
      '9. Sie mag fast jede Musik, meistens Bluegrass … →',
      '10. Er hört gern klassische Musik (Bach, Beethoven) und Jazz/R&B. →'
    ]
  }),

  multiSpeaker({
    id: 20,
    title: 'Aktivität 20. Welche Musik hörst du gern?',
    description: 'Interview two partners about musical tastes.',
    duration: '20 min',
    icon: 'groupactivity',
    intro:
      'Take turns asking two classmates about music (Welche Musik hörst du gern? Lieblingssänger/in? Was hörst du nicht gern?). Ask at least one question of your own.',
    speakers: [
      { id: 's2', name: 'Partner(in) 2', questions: ['Welche Musik hörst du gern?', 'Wer ist dein Lieblingssänger / deine Lieblingssängerin / deine Lieblingsgruppe?', 'Welche Musik hörst du nicht gern?', 'Eigene Frage:', 'Notizen zu Partner 2:'] },
      { id: 's3', name: 'Partner(in) 3', questions: ['Welche Musik hörst du gern?', 'Wer ist dein Lieblingssänger / deine Lieblingssängerin / deine Lieblingsgruppe?', 'Welche Musik hörst du nicht gern?', 'Eigene Frage:', 'Notizen zu Partner 3:'] }
    ]
  }),

  wb({
    id: 21,
    title: 'Aktivität 21. Musik machen – Eine Umfrage',
    description: 'Class survey: who plays which instrument?',
    duration: '15 min',
    intro:
      'Interview classmates: Spielst du ein Instrument? Go around the room and collect signatures / names as in the workbook lines.',
    checks: {
      blocks: [
        {
          type: 'text',
          id: 'k21_umfrage',
          prompts: [
            'Posaune:',
            'Flöte:',
            'Geige:',
            'Gitarre:',
            'Klarinette:',
            'Klavier:',
            'Schlagzeug:',
            'Gesang (singt):',
            'Trompete:'
          ]
        }
      ]
    }
  }),

  writing({
    id: 22,
    title: 'Aktivität 22. Ein kleines Musik-Referat',
    description: 'Short oral report on a favorite singer, band, composer, or instrument.',
    duration: '30 min',
    intro:
      'Pick a favorite singer, band, composer, or instrument. Prepare a 2–3 minute report with facts and prompts on index cards (do not read word-for-word).',
    tasks: ['Mein Thema:', 'Wichtige Details / Stichpunkte für die Präsentation:']
  }),

  wb({
    id: 23,
    title: 'Aktivität 23. Lieder & Musik',
    description: 'Sportfreunde Stiller — workbook exercises on the DiB website.',
    duration: '20 min',
    icon: 'readingtask',
    intro:
      'Die Sportfreunde Stiller – „54, 74, 90, 2006/10“. Read the lyrics and/or listen to the song about Fußball, then complete the activities under Kapitel 4: Lieder & Musik on the Deutsch im Blick website.',
    tasks: ['Complete the Lieder & Musik exercises on the website (same chapter as the PDF).'],
    links: [{ label: 'Deutsch im Blick — Kapitel 4', url: TOC }]
  }),

  writing({
    id: 24,
    title: 'Aktivität 24. Die Sportarten',
    description: 'German sports vocabulary — same or similar as English.',
    duration: '15 min',
    intro:
      'Review sport names (Baseball, Basketball, Fußball, …). List any new sports from the workbook and note which you have tried.',
    tasks: ['Liste: Sportarten die ich kenne / die ich treibe:', 'Welche Sportarten möchtest du ausprobieren?']
  }),

  writing({
    id: 25,
    title: 'Aktivität 25. Ein Kreuzworträtsel',
    description: 'Crossword practice (Waagerecht / Senkrecht) — workbook p. 179.',
    duration: '20 min',
    icon: 'readingtask',
    intro:
      'Complete the Kreuzworträtsel in the PDF (sports vocabulary). Write ß as ss if needed.',
    tasks: ['Lösungen oder Notizen zum Kreuzworträtsel (im Heft oder hier):']
  }),

  multiSpeaker({
    id: 26,
    title: 'Aktivität 26. Treiben Jan und Eva Sport?',
    description: 'Fill in blanks while watching „Sport treiben“ clips.',
    duration: '20 min',
    speakers: [
      { id: 'jan', name: 'Jan (QR 4.30)', videoPath: 'chapter04/k04_a26_jan.mp4', questions: [
        'Ergänzen Sie die Lücken (Jan) — transkribieren Sie aus dem Video:',
        'Ich treibe im Moment … Sport …',
        'Eigentlich würde ich gerne … Sport treiben.',
        'Zum Beispiel … / … spielen …',
        'Aber es ist im Moment für mich schwer, das in meinen … einzubringen.',
        'Aber in der Zukunft würde ich gerne … machen.'
      ]},
      { id: 'eva', name: 'Eva (QR 4.31)', videoPath: 'chapter04/k04_a26_eva.mp4', questions: [
        'Ergänzen Sie die Lücken (Eva):',
        'Ich gehe … die Woche … zum Sport.',
        'Montag bis Mittwoch … Stunden.',
        'Donnerstags … bis … Stunden.',
        'Ich … selbst, ich gebe Kinderturnen.',
        'Wir … mit den Kindern in der Turnhalle …'
      ]}
    ]
  }),

  wb({
    id: 27,
    title: 'Aktivität 27. Über Sport sprechen',
    description: 'Interview a partner about sports; short report.',
    duration: '25 min',
    intro:
      'A. Ask your partner the workbook questions and circle Ja/Nein and sports. B. Write a 5–6 sentence paragraph about your partner’s sports habits.',
    checks: {
      blocks: [
        {
          type: 'tf',
          id: 'k27_sport',
          statement: 'Treibst du Sport? (Partner antwortet Ja.)',
          trueLabel: 'Ja',
          falseLabel: 'Nein'
        },
        {
          type: 'multi',
          id: 'k27_welche',
          question: 'Was für Sport treibt dein Partner? (alles Zutreffende)',
          options: [
            'Baseball',
            'Basketball',
            'Billard',
            'Football',
            'Fußball',
            'Golf',
            'Tennis',
            'Volleyball',
            'Karate',
            'Leichtathletik',
            'joggen / joggen gehen',
            'schwimmen / schwimmen gehen',
            'wandern / wandern gehen'
          ],
          correctIndices: []
        },
        {
          type: 'text',
          id: 'k27_oft',
          prompts: [
            'Wie oft? (jeden Tag / einmal die Woche / …):',
            'Weitere Notizen:',
            'B. Kurzer Bericht (5–6 Sätze über den Partner):'
          ]
        }
      ]
    }
  }),

  wb({
    id: 28,
    title: 'Aktivität 28. Wie findest du …?',
    description: 'Rate hobbies with adjectives (entspannend, spannend, teuer, …).',
    duration: '20 min',
    intro:
      'For each hobby, choose adjectives that fit your opinion (eher positiv / eher negativ). You may reuse adjectives.',
    checks: {
      blocks: [
        {
          type: 'text',
          id: 'k28_adj',
          prompts: [
            'Beispiel: Fußball spielen finde ich … / Marathon laufen finde ich …',
            '1. Ins Museum gehen finde ich …',
            '2. Mountainbike fahren finde ich …',
            '3. Monopoly spielen finde ich …',
            '4. Zeichnen finde ich …',
            '5. Briefmarken sammeln finde ich …',
            '6. Musik hören finde ich …',
            'Web-Tipp: de.eurosport.yahoo.com — drei kurze Antworten (optional):'
          ]
        }
      ]
    }
  }),

  writing({
    id: 29,
    title: 'Aktivität 29. Ins Restaurant gehen',
    description: 'Plan a group dinner dialogue; note other groups’ choices.',
    duration: '35 min',
    icon: 'groupactivity',
    intro:
      'A. In a small group, plan where to go for dinner (4–5 minute dialogue). Use prompts: Wo gehst du gerne essen? Vegetarier? Budget? B. After other groups present, take notes: Wohin gehen sie?',
    tasks: [
      'A. Ideen zum Dialog (Stichpunkte, Rollen, Restaurantwahl):',
      'B. Notizen zu anderen Gruppen (Gruppe 1–3 …):'
    ]
  }),

  wb({
    id: 30,
    title: 'Aktivität 30. Auswärts essen.',
    description: 'Read DAAD text „Kulinarisches“ / „Auswärts essen“; true/false and discussion.',
    duration: '30 min',
    icon: 'readingtask',
    intro:
      'Read the passage in the workbook (Kulinarisches / Auswärts essen). A. Predict from title. B. Reading questions while you read. C. Stimmt das oder stimmt das nicht?',
    checks: {
      blocks: [
        {
          type: 'tf',
          id: 'k30_1',
          statement: 'Many Germans like hearty dishes such as Sauerkraut, Bratwurst, and Grünkohl.',
          correct: true
        },
        {
          type: 'tf',
          id: 'k30_2',
          statement: 'In Germany’s big cities there is a wide selection of national cuisines.',
          correct: true
        },
        {
          type: 'tf',
          id: 'k30_3',
          statement: 'The majority of restaurants with traditional German fare are found in big cities.',
          correct: false
        },
        {
          type: 'tf',
          id: 'k30_4',
          statement: 'German cooks have not tried to lighten up traditional German fare.',
          correct: false
        },
        {
          type: 'text',
          id: 'k30_d',
          prompts: [
            'D. Kurze Antworten zu den Diskussionsfragen (für dich / Partner):'
          ]
        }
      ]
    }
  }),

  wb({
    id: 31,
    title: 'Aktivität 31. Sprache im Kontext: Trinkgeld',
    description: 'Peter Süß video + tipping text; order the dialogue lines.',
    duration: '25 min',
    intro:
      'A. Watch Peter Süß beim Bezahlen (QR 4.32) and put the statements in order; mark PS (Peter Süß) or K (Kellner). B. Read „Das Trinkgeld“ and compare US vs German tipping.',
    videos: [{ path: 'chapter04/k04_a31_trinkgeld.mp4', label: 'Peter Süß gibt Trinkgeld (QR 4.32)' }],
    checks: {
      blocks: [
        {
          type: 'order',
          id: 'k31_order',
          instruction: 'Put the lines in the order they occur at the restaurant (first = earliest).',
          items: [
            { id: 2, text: 'Danke schön.' },
            { id: 1, text: '17 Euro bitte.' },
            { id: 5, text: 'Zwei Euro zurück, vielen Dank.' },
            { id: 3, text: 'Ein Spezi und ein Schnitzel.' },
            { id: 4, text: 'Geben Sie mir bitte auf 18 heraus.' }
          ],
          correctOrder: [3, 1, 4, 5, 2]
        },
        {
          type: 'text',
          id: 'k31_compare',
          prompts: [
            'Wer sagt was? (PS/K pro Zeile — Notizen):',
            'How does paying differ from a US restaurant?',
            'B. Compare tipping customs US vs Germany (kurz):'
          ]
        }
      ]
    }
  }),

  writing({
    id: 32,
    title: 'Aktivität 32. Wir gehen ins Kino!',
    description: 'Brainstorm what you associate with going to the movies.',
    duration: '10 min',
    intro:
      'What do you associate with going to the movies? Jot down ideas in German or English (der Film, Popcorn, …).',
    tasks: ['Assoziationen zum Kinobesuch:']
  }),

  multiSpeaker({
    id: 33,
    title: 'Aktivität 33. Sprache im Kontext: Harald im Kino',
    description: 'Fill in Harald’s answers about movie habits (QR 4.33).',
    duration: '20 min',
    speakers: [
      {
        id: 'harald',
        name: 'Harald im Kino (QR 4.33)',
        videoPath: 'chapter04/k04_a33_harald.mp4',
        questions: [
          'Wie oft gehst du ins Kino? (Lücken aus dem Video):',
          'Popcorn: gesalzen oder gezuckert?',
          'Hast du einen Lieblingsschauspieler / eine Lieblingsschauspielerin?'
        ]
      }
    ]
  }),

  wb({
    id: 34,
    title: 'Aktivität 34. Wie oft gehst du ins Kino?',
    description: 'Compare your habits to Harald’s (partner interview).',
    duration: '15 min',
    intro:
      'Answer with a partner: Wie oft gehst du ins Kino? Popcorn? Lieblingsschauspieler(in)?',
    checks: {
      blocks: [
        {
          type: 'text',
          id: 'k34_du',
          prompts: [
            'Ich gehe … ins Kino.',
            'Popcorn: gesalzen / gezuckert',
            'Mein Lieblingsschauspieler / meine Lieblingsschauspielerin:'
          ]
        },
        {
          type: 'text',
          id: 'k34_partner',
          prompts: [
            'Partner — Wie oft?',
            'Partner — Popcorn?',
            'Partner — Lieblingsschauspieler(in)?'
          ]
        }
      ]
    }
  }),

  multiSpeaker({
    id: 35,
    title: 'Aktivität 35. Interviews: Lieblingsfilme & -bücher',
    description: 'Berna, Harald, Jan on favorite films and books.',
    duration: '30 min',
    speakers: [
      { id: 'berna', name: 'Berna (QR 4.27)', videoPath: 'chapter04/k04_a35_berna.mp4', questions: [
        'Bernas Lieblingsfilm — Notizen (Wer spielt die Hauptrollen?):',
        'Bernas Lieblingsbuch — Idee im Buch:'
      ]},
      { id: 'harald', name: 'Harald (QR 4.29)', videoPath: 'chapter04/k04_a35_harald.mp4', questions: [
        'Was schaut Harald gern im Fernsehen?',
        'Lieblingsschauspieler — in welchem Film besonders gut?',
        'Was liest Harald im Moment?'
      ]},
      { id: 'jan', name: 'Jan (QR 4.28)', videoPath: 'chapter04/k04_a35_jan.mp4', questions: [
        'Jans Lieblingsfilme — warum?',
        'Jans Lieblingsbuch — warum?'
      ]},
      {
        id: 'du',
        name: 'B. Jetzt bist du dran!',
        questions: [
          'Dein Lieblingsfilm / Schauspieler / warum?',
          'Dein Lieblingsbuch / Autor(in) / warum?',
          'Welche Themen findest du in Literatur oder Filmen besonders faszinierend?'
        ]
      },
      {
        id: 'umfrage',
        name: 'C. Kleine Umfrage',
        questions: [
          'Name Partner — Lieblingsbuch / Warum?',
          'Lieblingsfilm / Regisseur / Warum?'
        ]
      }
    ]
  }),

  writing({
    id: 36,
    title: 'Aktivität 36. Alles über das Kino',
    description: 'Film genres, titles on amazon.de, plot summary, guessing game.',
    duration: '40 min',
    intro:
      'A. Filmgenres: write at least two German titles per genre (use amazon.de for German titles). B. Write a plot summary of a favorite film without naming it. C. In class, others guess — note classmates’ summaries here if you like.',
    tasks: [
      'A. Genres (Abenteuerfilm, Drama, Horrorfilm, …) mit je 2 Titeln:',
      'B. Kurzbeschreibung ohne Filmtitel (6–8 Sätze):',
      'C. Notizen „Raten Sie mal!“ (optional):'
    ],
    links: [{ label: 'amazon.de', url: 'https://www.amazon.de/' }]
  }),

  writing({
    id: 37,
    title: 'Aktivität 37. Ein Theaterstück',
    description: 'Questions on Theater am Neunerplatz program (Peterchens Mondfahrt).',
    duration: '25 min',
    icon: 'readingtask',
    intro:
      'Skim the program PDF for Peterchens Mondfahrt at Theater am Neunerplatz and answer the workbook questions.',
    links: [{ label: 'Theater am Neunerplatz — Downloads', url: 'https://www.neunerplatz.de/Downloads' }],
    tasks: [
      '1. Wie heißt das Theaterstück?',
      '2. Wo kann man es sehen?',
      '3. Wer sind die Hauptfiguren?',
      '4. An welchen Tagen?',
      '5. Um wie viel Uhr?',
      '6. Was machen Peterchen, Anneliese und der Maikäfer?',
      '7. Für wen ist das Stück geeignet?'
    ]
  }),

  wb({
    id: 38,
    title: 'Aktivität 38. Ausgehen',
    description: 'Austin outings — Ja/Nein and reasons (denn/weil).',
    duration: '20 min',
    intro:
      'A. Do you and your friends ever do these Austin activities? Mark Ja or Nein for yourself (adapt to your area if needed). B. Explain your answers with denn or weil.',
    checks: {
      blocks: [
        {
          type: 'text',
          id: 'k38_ja',
          prompts: [
            '1. Wir fahren zu Mount Bonnell. (Ja / Nein)',
            '2. Wir gehen ins Alamo Drafthouse. (Ja / Nein)',
            '3. Wir feiern auf Sixth Street. (Ja / Nein)',
            '4. Wir essen bei Rudy’s. (Ja / Nein)',
            '5. Wir schwimmen bei Barton Springs. (Ja / Nein)'
          ]
        },
        {
          type: 'text',
          id: 'k38_warum',
          prompts: [
            'B. Warum? Warum nicht? (1–5, jeweils 1–2 Sätze mit denn/weil):'
          ]
        }
      ]
    }
  }),

  writing({
    id: 39,
    title: 'Aktivität 39. Ausgehen in Würzburg',
    description: 'Plan a Nachtprogramm using wuerzburg.de Veranstaltungskalender.',
    duration: '30 min',
    icon: 'readingtask',
    intro:
      'Use wuerzburg.de (Veranstaltungskalender) to plan an evening out. A. Answer navigation questions from the workbook. B. At home, draft your Nachtprogramm. C. Interview a partner about their plan.',
    links: [{ label: 'Würzburg — Stadtportal', url: 'https://www.wuerzburg.de/' }],
    tasks: [
      'A. Navigation / Suchkategorien (Antworten):',
      'B. Mein Nachtprogramm (Events, Ort, Preis, Warum):',
      'C. Fragen an den Partner + Vergleich:'
    ]
  }),

  writing({
    id: 40,
    title: 'Aktivität 40. Ein Dokumentarfilm: Ein langes Wochenende',
    description: '5–10 min screenplay: how students at your university spend the weekend.',
    duration: '45 min',
    icon: 'groupactivity',
    intro:
      'Create a 5–10-minute documentary screenplay (or skit) for „Deutschland sucht die Superstudis“: how American students at your university spend the weekend. Use chapter vocabulary; be creative.',
    tasks: [
      'Treatment / Szenenplan:',
      'Dialog oder Voiceover (Hauptteil):',
      '(Optional) Wer macht mit / wer filmt?'
    ]
  })
];

const outPath = path.join(__dirname, '../src/data/chapter04.generated.json');
const ordered = activities.map(reorderActivityKeys);
fs.writeFileSync(outPath, JSON.stringify(ordered, null, 2));
console.log('Wrote', outPath, ordered.length, 'activities (canonical key order)');
