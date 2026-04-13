import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chapter2Activities from './chapter2Activities.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(__dirname, '../src/data/activites.json');

const DIB_K1 = 'https://coerll.utexas.edu/dib/toc.php?k=1';
const DIB_VOC = 'https://coerll.utexas.edu/dib/voc.php?k=1';
const PDF_K1 = 'https://coerll.utexas.edu/dib/pdfs/k_01.pdf';
const activities = [
  {
    chapter: 1,
    id: 1,
    type: 'multiple_choice',
    icon: 'videoclips',
    title: 'Aktivität 1. Harald und Peter: Wer bin ich?',
    description: 'Listen to the interviews and choose the correct answers.',
    duration: '10 min',
    prerequisites: [],
    videos: [
      { path: 'chapter01/k01_interview_harald.mp4', label: 'Harald — Wer bin ich?' },
      { path: 'chapter01/k01_interview_peter.mp4', label: 'Peter — Wer bin ich?' }
    ],
    questionSets: [
      {
        setId: 1,
        title: 'Harald',
        questions: [
          { id: 1, question: 'Herkunft? Er kommt aus', options: ['Münster', 'München', 'Mainz'], correctAnswer: 0 },
          { id: 2, question: 'Alter? Er ist', options: ['15 Jahre alt', '25 Jahre alt', '50 Jahre alt'], correctAnswer: 1 },
          { id: 3, question: 'Lieblingsfarbe? Seine Lieblingsfarbe ist', options: ['Rot', 'Blau', 'Braun'], correctAnswer: 1 },
          {
            id: 4,
            question: 'Warum? Warum ist das seine Lieblingsfarbe?',
            options: ['Sie ist wie Bayern und der Himmel (sky).', 'Er weiß es nicht.', 'Diese Farbe ist energisch.'],
            correctAnswer: 0
          }
        ]
      },
      {
        setId: 2,
        title: 'Peter',
        questions: [
          { id: 1, question: 'Herkunft? Er kommt aus', options: ['der Schweiz', 'Texas', 'Stuttgart'], correctAnswer: 0 },
          {
            id: 2,
            question: 'Nummer? Welche Nummer sagt er?',
            options: ['seine Telefonnummer', 'seine Hausnummer'],
            correctAnswer: 0
          },
          { id: 3, question: 'Lieblingsfarbe? Seine Lieblingsfarbe ist', options: ['Rot', 'Blau', 'Braun'], correctAnswer: 0 },
          {
            id: 4,
            question: 'Warum? Warum ist das seine Lieblingsfarbe?',
            options: ['Sie ist ruhig (peaceful).', 'Sie ist intensiv.', 'Sie ist die Farbe der Liebe (love).'],
            correctAnswer: 0
          }
        ]
      }
    ]
  },
  {
    chapter: 1,
    id: 2,
    type: 'matching_activity',
    icon: 'videoclips',
    title: 'Aktivität 2. Wer bin ich?',
    description: 'Match each interview question with its English meaning.',
    duration: '15 min',
    prerequisites: [],
    videos: [
      { path: 'chapter01/k01_interview_harald.mp4', label: 'Harald — noch einmal' },
      { path: 'chapter01/k01_interview_peter.mp4', label: 'Peter — noch einmal' }
    ],
    leftColumnTitle: 'Frage (Deutsch)',
    rightColumnTitle: 'English',
    matchInstruction: 'Match each German question with its English translation (Harald & Peter interviews).',
    matchingPairs: [
      { id: 1, german: 'Wie heißen Sie?', english: "What's your name?" },
      { id: 2, german: 'Woher kommen Sie?', english: 'Where are you from?' },
      { id: 3, german: 'Wie alt sind Sie?', english: 'How old are you?' },
      { id: 4, german: 'Wie lautet Ihre Telefonnummer?', english: "What's your telephone number?" },
      { id: 5, german: 'Was ist Ihre Lieblingsfarbe?', english: "What's your favorite color?" },
      { id: 6, german: 'Warum?', english: 'Why?' }
    ]
  },
  {
    chapter: 1,
    id: 3,
    type: 'workbook',
    icon: 'groupactivity',
    title: 'Aktivität 3. Wie heißt du?',
    description: 'Classroom partner practice: names and reporting.',
    duration: '15 min',
    prerequisites: [],
    intro:
      'Ask several classmates their names and report back. In the classroom this is done orally; here is the prompt from the COERLL workbook.',
    tasks: [
      'Ask: Wie heißt du? and note three classmates’ names.',
      'Report to the group: Wie heißt er/sie? — Er/sie heißt …'
    ],
    links: [
      { label: 'Deutsch im Blick — Kapitel 1 (videos & PDF)', url: DIB_K1 },
      { label: 'Workbook PDF (Kapitel 1)', url: PDF_K1 }
    ],
    pdfNote: 'Content aligns with COERLL Deutsch im Blick, Kapitel 1 workbook (Aktivität 3).'
  },
  {
    chapter: 1,
    id: 4,
    type: 'workbook',
    icon: 'groupactivity',
    title: 'Aktivität 4. Ich heiße …',
    description: 'Chain game introducing names in a circle.',
    duration: '15 min',
    prerequisites: [],
    intro:
      'Form a circle and play the name chain: each person gives their name, repeats previous names with er/sie heißt …, and asks the next person Wie heißt du?',
    sections: [
      {
        heading: 'Grammar reminder',
        paragraphs: [
          'Review present tense of regular verbs (e.g. kommen) and formal vs. informal “you” on Grimm Grammar when preparing this activity.'
        ],
        list: ['Present tense — regular verbs: coerll.utexas.edu/gg/gr/v_02.htm']
      }
    ],
    links: [
      { label: 'Grimm Grammar — regular verbs', url: 'https://coerll.utexas.edu/gg/gr/v_02.htm' },
      { label: 'Workbook PDF', url: PDF_K1 }
    ],
    pdfNote: 'See Aktivität 4 in the printed/ PDF workbook for the full classroom script.'
  },
  {
    chapter: 1,
    id: 5,
    type: 'workbook',
    icon: 'groupactivity',
    title: 'Aktivität 5. Wie lautet deine Telefonnummer?',
    description: 'Numbers 0–10 and exchanging phone numbers.',
    duration: '15 min',
    prerequisites: [],
    intro: 'Practice digits null–zehn, then ask two classmates: Wie lautet deine Telefonnummer?',
    sections: [
      {
        heading: 'Useful phrases',
        list: [
          'Wie lautet deine Telefonnummer?',
          'Meine Telefonnummer ist …',
          'Report back: Seine/Ihre Telefonnummer ist …'
        ]
      }
    ],
    links: [{ label: 'Kapitel 1 vocabulary', url: DIB_VOC }],
    pdfNote: 'Number chart and prompts: COERLL workbook Aktivität 5.'
  },
  {
    chapter: 1,
    id: 6,
    type: 'reading_self_check',
    icon: 'readingtask',
    title: 'Aktivität 6. Wichtige Adressen & Telefonnummern in Deutschland',
    description: 'Read authentic contact information and answer in English (or German).',
    duration: '20 min',
    prerequisites: [],
    intro:
      'Use the embassy notice and related materials in your workbook. Part of the answers depend on figures in the printed packet; model answers cover the embassy block from the PDF text.',
    readingItems: [
      {
        id: 1,
        prompt: 'What is the address of the American Embassy (Berlin)?',
        modelAnswer: 'Neustädtische Kirchstr. 4–5, 10117 Berlin.',
        acceptedAnswers: [
          'Neustädtische Kirchstr. 4-5, 10117 Berlin',
          'neustädtische kirchstrasse 4-5 10117 berlin',
          'Neustädtische Kirchstr 4-5 10117 Berlin'
        ]
      },
      {
        id: 2,
        prompt: 'What is its main telephone number?',
        modelAnswer: '(030) 2385 174',
        acceptedAnswers: ['(030) 2385 174', '030 2385 174', '2385 174', '0302385174']
      },
      {
        id: 3,
        prompt: 'When is American Citizen Services open (hours)?',
        modelAnswer: '14–16 Uhr',
        acceptedAnswers: ['14-16 Uhr', '14–16 Uhr', '14 bis 16 Uhr', '2-4 pm', '14 to 16']
      },
      {
        id: 4,
        prompt: 'Which days?',
        modelAnswer: 'Montag bis Freitag',
        acceptedAnswers: ['Montag bis Freitag', 'Monday through Friday', 'monday to friday', 'weekdays']
      },
      {
        id: 5,
        prompt: 'What is the American Citizen Services phone number?',
        modelAnswer: '(030) 832-9233',
        acceptedAnswers: ['(030) 832-9233', '030 832 9233', '832-9233', '8329233']
      },
      {
        id: 6,
        prompt: 'What is the address of the Uni Würzburg international student office? Where can you get more information?',
        modelAnswer:
          'Not printed in the excerpt we extracted from the PDF; use the map/directory pages in your printed workbook or the current international office page at uni-wuerzburg.de.',
        acknowledgeLabel:
          'I answered this using the printed workbook map/directory or the current Uni Würzburg international office website.'
      },
      {
        id: 7,
        prompt: 'Pizza delivery: address, PLZ, and phone number?',
        modelAnswer:
          'Specifics appear on the workbook map/ad page bundled with COERLL Kapitel 1; check your printed PDF packet or instructor copy.',
        acknowledgeLabel: 'I answered this using the printed workbook map or ad page (or my instructor’s copy).'
      },
      {
        id: 8,
        prompt: 'What do you think Notrufnummern means? What does Feuer mean, and who do you call with 112?',
        modelAnswer:
          'Notrufnummern = emergency numbers. Feuer = fire. 112 is the European emergency number (fire, medical, police in many EU countries).',
        keywords: ['112', 'feuer', 'emergency|notruf']
      }
    ],
    pdfNote: `Full layout: ${PDF_K1}`
  },
  {
    chapter: 1,
    id: 7,
    type: 'workbook',
    icon: 'readingtask',
    title: 'Aktivität 7. Zahlen und Nummern',
    description: 'Double/triple digits, phone numbers, and ages.',
    duration: '20 min',
    prerequisites: [],
    intro:
      'Practice saying phone numbers and ages the German way (e.g. neunzehn, not *eins neun*). Use the number table in the workbook (11–1000+).',
    links: [{ label: 'Workbook PDF', url: PDF_K1 }],
    pdfNote: 'Follow the number charts in Aktivität 7.',
    checks: {
      blocks: [
        {
          type: 'short',
          id: 'n19',
          prompt: 'How do you write the number 19 as one word in German?',
          acceptedAnswers: ['neunzehn'],
          hint: 'Not *eins neun* — one compound word.'
        },
        {
          type: 'short',
          id: 'n252',
          prompt: 'How do you say 252 in German (one standard form)?',
          acceptedAnswers: [
            'zweihundertzweiundfünfzig',
            'zwei hundert zwei und fünfzig',
            'zwei hundert zweiundfünfzig'
          ],
          hint: 'Use the pattern hundreds + zweiundfünfzig.'
        }
      ]
    }
  },
  {
    chapter: 1,
    id: 8,
    type: 'workbook',
    icon: 'groupactivity',
    title: 'Aktivität 8. Das Alter',
    description: 'Ask and report ages with Wie alt bist du?',
    duration: '10 min',
    prerequisites: [],
    tasks: [
      'Wie alt bist du? — Ich bin … Jahre alt.',
      'Report: Er/sie ist … Jahre alt.'
    ],
    links: [{ label: 'Workbook PDF', url: PDF_K1 }]
  },
  {
    chapter: 1,
    id: 9,
    type: 'workbook',
    icon: 'readingtask',
    title: 'Aktivität 9. Wie viel kostet es?',
    description: 'Read a Rechnung and write prices in words.',
    duration: '20 min',
    prerequisites: [],
    intro:
      'Identify prices for Pizza Margherita, house salad, cola, mineral water, and espresso; write totals in words following the modeled sentences in the workbook.',
    links: [{ label: 'Workbook PDF', url: PDF_K1 }]
  },
  {
    chapter: 1,
    id: 10,
    type: 'workbook',
    icon: 'videoclips',
    title: 'Aktivität 10. Sprache im Kontext: Mit dem Bus zur Uni',
    description: 'Video: Tobias — bus, ticket, student ID, campus.',
    duration: '25 min',
    prerequisites: [],
    sections: [
      {
        heading: 'A. First viewing',
        paragraphs: ['Watch the clip and note setting, people, and topic.']
      },
      {
        heading: 'B. Second viewing',
        paragraphs: ['Check off each word you hear from the vocabulary checklist in the workbook (Busticket, Universität, Bargeld, …).']
      },
      {
        heading: 'C. Third viewing',
        paragraphs: [
          'Answer the multiple-choice tasks in the workbook (which buses; what you need for the Hubland).'
        ]
      },
      {
        heading: 'D. Articles',
        paragraphs: [
          'Listen again: which articles does Tobias use with key nouns? What do they signal about gender?'
        ]
      }
    ],
    links: [
      { label: 'Kapitel 1 — Sprache im Kontext', url: DIB_K1 },
      { label: 'Grimm Grammar — sein', url: 'https://coerll.utexas.edu/gg/gr/vi_11.html' }
    ],
    pdfNote: 'QR 1.28 in the workbook points to this clip.',
    checks: {
      blocks: [
        {
          type: 'multi',
          id: 'buses',
          question: 'Aktivität 10 C — Which THREE bus lines go to die Stadt and to the Hubland? (select exactly three)',
          options: ['1', '10', '14', '40', '114', '1400'],
          correctIndices: [2, 3, 4]
        },
        {
          type: 'mc',
          id: 'hubland_need',
          question: 'What do you need to get to the Hubland campus by bus?',
          options: [
            'A bus pass bought on any bus or tram in Würzburg',
            'Cash (Bargeld); at least 10 Euro',
            'Your student ID — travel free on public transportation in Würzburg'
          ],
          correctIndex: 2
        }
      ]
    }
  },
  {
    chapter: 1,
    id: 11,
    type: 'workbook',
    icon: 'readingtask',
    title: 'Aktivität 11. Würzburg entdecken',
    description: 'Map task: addresses, phones, bus lines.',
    duration: '25 min',
    prerequisites: [],
    intro: 'Answer using the Würzburg map in your printed workbook.',
    tasks: [
      'Studentenwerk address (write PLZ digits).',
      'Jugendherberge phone number.',
      'University street and Hausnummer.',
      'From “Am Kugelfang”: which bus(es) to the university?'
    ],
    links: [{ label: 'Workbook PDF', url: PDF_K1 }]
  },
  {
    chapter: 1,
    id: 12,
    type: 'workbook',
    icon: 'readingtask',
    title: 'Aktivität 12. Und wer wohnt in Würzburg?',
    description: 'Statistics table + vocabulary matching + discussion.',
    duration: '30 min',
    prerequisites: [],
    intro:
      'Match English glosses to German row labels (Bevölkerung, Einwohner, …), then discuss the age-structure graph with classmates.',
    links: [
      { label: 'Stadt Würzburg', url: 'https://www.wuerzburg.de' },
      { label: 'Workbook PDF', url: PDF_K1 }
    ]
  },
  {
    chapter: 1,
    id: 13,
    type: 'workbook',
    icon: 'readingtask',
    title: 'Aktivität 13. Würzburg versus Deutschland',
    description: 'Compare city and national statistics; research online.',
    duration: '35 min',
    prerequisites: [],
    sections: [
      {
        heading: 'A. Compare & discuss',
        paragraphs: [
          'Use the Infobox (Einwohner, Ausländeranteil, …) and answer the reflection questions in the workbook.'
        ]
      },
      {
        heading: 'B. Nationalities',
        paragraphs: ['Complete nationality forms (Türkei/Türke/Türkin, …) and add two more countries.']
      }
    ],
    links: [
      { label: 'BIB Demografie', url: 'https://www.bib-demografie.de' },
      { label: 'Tatsachen über Deutschland', url: 'https://www.tatsachen-ueber-deutschland.de' },
      { label: 'Auswärtiges Amt', url: 'https://www.auswaertiges-amt.de' }
    ],
    checks: {
      blocks: [
        {
          type: 'short',
          id: 'ausl',
          prompt: 'In your own words: what does Ausländeranteil refer to in the Infobox?',
          acceptedAnswers: [
            'percentage of foreigners',
            'share of foreigners',
            'percent of foreign citizens',
            'proportion of foreigners',
            'foreigner share'
          ],
          hint: 'Think: percent of the population without German citizenship.'
        },
        {
          type: 'short',
          id: 'mig',
          prompt: 'What does Bevölkerung mit Migrationshintergrund mean (short phrase in English)?',
          acceptedAnswers: [
            'population with migration background',
            'people with immigrant background',
            'residents with migration background',
            'population migration background'
          ]
        }
      ]
    }
  },
  {
    chapter: 1,
    id: 14,
    type: 'workbook',
    icon: 'videoclips',
    title: 'Aktivität 14. Wer sind sie?',
    description: 'Video notes: native speakers in “Wer bin ich?”',
    duration: '30 min',
    prerequisites: [],
    intro:
      'Watch the native-speaker clips and fill a chart: Name, Herkunft, Alter, Telefonnummer, Lieblingsfarbe (+ warum). Optionally locate towns on maps.google.de.',
    links: [{ label: 'Kapitel 1 interviews', url: DIB_K1 }],
    pdfNote: 'QR 1.15, 1.18, 1.23 in workbook.'
  },
  {
    chapter: 1,
    id: 15,
    type: 'qa_matching',
    icon: 'videoclips',
    title: 'Aktivität 15. Was ist die Antwort?',
    description: "Match Berna's questions to her answers (re-listen to QR 1.15).",
    duration: '15 min',
    prerequisites: [],
    leftColumnTitle: 'Frage',
    rightColumnTitle: 'Antwort',
    matchInstruction: 'Listen again to Berna’s clip and match each question to the answer she gives.',
    matchingPairs: [
      { id: 1, left: 'Wie heißt du?', right: 'Ich heiße Berna.' },
      { id: 2, left: 'Woher kommst du?', right: 'Aus Kiel.' },
      { id: 3, left: 'Wie alt bist du?', right: '30.' },
      { id: 4, left: 'Was ist deine Telefonnummer?', right: '(512) 749-8940' },
      { id: 5, left: 'Was ist deine Lieblingsfarbe?', right: 'Rot, weil es temperamentvoll ist.' }
    ]
  },
  {
    chapter: 1,
    id: 16,
    type: 'workbook',
    icon: 'groupactivity',
    title: 'Aktivität 16. Woher kommst du und was ist deine Lieblingsfarbe?',
    description: 'Partner interview + color vocabulary.',
    duration: '25 min',
    prerequisites: [],
    intro:
      'Use Woher kommst du? / Was ist deine Lieblingsfarbe? / Warum? with two partners. Use the word bank (countries, colors, reasons) in the workbook.',
    links: [{ label: 'Grimm Grammar — noun gender', url: 'https://coerll.utexas.edu/gg/gr/no_02.html' }],
    pdfNote: 'Remember: colors as adjectives are lowercase (Das Haus ist rot.).'
  },
  {
    chapter: 1,
    id: 17,
    type: 'workbook',
    icon: 'videoclips',
    title: 'Aktivität 17. Wer sind die Amerikaner?',
    description: 'Chart the American students from “Wer bin ich?”',
    duration: '30 min',
    prerequisites: [],
    intro:
      'Watch the U.S. student clips and complete the same chart as in Aktivität 14. Reflect: which word is used for “you”? How does that differ from Harald and Peter (Sie)?',
    links: [{ label: 'Kapitel 1 interviews', url: DIB_K1 }],
    pdfNote: 'QR 1.2, 1.5, 1.7, 1.10, 1.13.'
  },
  {
    chapter: 1,
    id: 18,
    type: 'workbook',
    icon: 'readingtask',
    title: 'Aktivität 18. Kurze Beschreibungen',
    description: 'Short paragraph about one interviewee.',
    duration: '20 min',
    prerequisites: [],
    intro:
      'Choose one person from the native or non-native group. Write a short introduction including Name, Herkunft, Alter, Telefonnummer, Lieblingsfarbe.',
    links: [{ label: 'Workbook PDF', url: PDF_K1 }]
  },
  {
    chapter: 1,
    id: 19,
    type: 'workbook',
    icon: 'readingtask',
    title: 'Aktivität 19. Meine Kommilitonen',
    description: 'Paragraph introducing a classmate.',
    duration: '20 min',
    prerequisites: [],
    intro: 'Use your notes from partner work to write a paragraph about a classmate (same information categories as before).',
    links: [{ label: 'Workbook PDF', url: PDF_K1 }]
  },
  {
    chapter: 1,
    id: 20,
    type: 'workbook',
    icon: 'videoclips',
    title: 'Aktivität 20. Sprache im Kontext: Der Studentenausweis',
    description: 'Mario explains the German student ID.',
    duration: '30 min',
    prerequisites: [],
    sections: [
      {
        heading: 'A. Vocabulary check',
        paragraphs: ['Tick words you hear (Name, Universität, Studienfach, …).']
      },
      {
        heading: 'B. Purposes',
        paragraphs: ['Circle all true statements about what the card is for (workbook list).']
      },
      {
        heading: 'C. Cloze',
        paragraphs: ['Fill gaps with the word bank (Student, Ticket, Semester, Bücher, …).']
      }
    ],
    links: [{ label: 'Kapitel 1 — Sprache im Kontext', url: DIB_K1 }],
    pdfNote: 'QR 1.29.',
    checks: {
      blocks: [
        {
          type: 'sectionTitle',
          text: 'Aktivität 20 B — Which purposes apply? (select all that are true in the clip)'
        },
        {
          type: 'multi',
          id: 'sid_uses',
          question: 'Circle all that apply (per Mario’s explanation).',
          options: [
            'Proof of student status',
            'Lets students take a vacation in Germany',
            'Use of public transportation (for free, with Semesterticket)',
            'Borrowing books from the library',
            'Helps students find a course of study',
            'Shows your course of study / Studiengang'
          ],
          correctIndices: [0, 2, 3, 5]
        }
      ]
    }
  },
  {
    chapter: 1,
    id: 21,
    type: 'workbook',
    icon: 'readingtask',
    title: 'Aktivität 21. Die Uni Würzburg',
    description: 'Authentic university registration form.',
    duration: '40 min',
    prerequisites: [],
    intro:
      'Fill the Julius-Maximilians-Universität application excerpt using invented or real data. Note German date order Tag.Monat.Jahr.',
    links: [
      { label: 'Uni Würzburg faculties', url: 'https://www.uni-wuerzburg.de/ueber/fakultaeten/' },
      { label: 'Workbook PDF', url: PDF_K1 }
    ]
  },
  {
    chapter: 1,
    id: 22,
    type: 'workbook',
    icon: 'videoclips',
    title: 'Aktivität 22. Was machen sie gern?',
    description: 'Eva, Sara, Adan — Studium & Wohnen / Hobbys / Freunde',
    duration: '35 min',
    prerequisites: [],
    intro:
      'Take notes while watching the clips whose titles match the table columns. Use the word bank in the workbook to listen for key terms.',
    links: [{ label: 'Kapitel 1 interviews', url: DIB_K1 }],
    pdfNote: 'See workbook for QR list (1.16–1.25).'
  },
  {
    chapter: 1,
    id: 23,
    type: 'workbook',
    icon: 'readingtask',
    title: 'Aktivität 23. Ein bisschen Journalismus',
    description: 'Re-tell what Eva, Berna, and Jan said.',
    duration: '25 min',
    prerequisites: [],
    intro: 'Using your notes from Aktivität 22 and related clips, reconstruct short statements in German (present tense). Review regular verbs on Grimm Grammar.',
    links: [{ label: 'Grimm Grammar — present regular verbs', url: 'https://coerll.utexas.edu/gg/gr/v_02.htm' }]
  },
  {
    chapter: 1,
    id: 24,
    type: 'workbook',
    icon: 'groupactivity',
    title: 'Aktivität 24. Interview',
    description: 'Write questions, conduct a partner interview, short report.',
    duration: '35 min',
    prerequisites: [],
    sections: [
      { heading: 'A. Fragen', paragraphs: ['With classmates, draft 5–7 interview questions.'] },
      { heading: 'B. Interview', paragraphs: ['Record Frage / Antwort with a new partner.'] },
      { heading: 'C. Reportage', paragraphs: ['Write a short paragraph about your partner’s interests and background.'] }
    ],
    links: [{ label: 'Workbook PDF', url: PDF_K1 }]
  },
  {
    chapter: 1,
    id: 25,
    type: 'workbook',
    icon: 'videoclips',
    title: 'Aktivität 25. Wer macht was?',
    description: 'Hassan, Erin, Sophia — who said each line?',
    duration: '25 min',
    prerequisites: [],
    intro:
      'Watch the “Studium & Wohnen” clips for Hassan, Erin, and Sophia. Label each statement with H, E, and/or S as in the workbook.',
    links: [{ label: 'Kapitel 1 interviews', url: DIB_K1 }],
    pdfNote: 'QR 1.6, 1.8, 1.14.',
    checks: {
      blocks: [
        { type: 'sectionTitle', text: 'Who said it? (H = Hassan, E = Erin, S = Sophia)' },
        {
          type: 'who',
          id: 'w1',
          statement: 'Ich wohne in der Nähe der Universität.',
          correctLetters: ['S']
        },
        {
          type: 'who',
          id: 'w2',
          statement: 'Ich studierte Philosophie, Altgriechisch und Latein.',
          correctLetters: ['H']
        },
        {
          type: 'who',
          id: 'w3',
          statement: 'Ich wohne in der Nähe von der Autobahn.',
          correctLetters: ['H']
        },
        {
          type: 'who',
          id: 'w4',
          statement: 'Ich wohne im Europahaus 1.',
          correctLetters: ['E']
        },
        {
          type: 'who',
          id: 'w5',
          statement: 'Ich studiere Deutsch und Kunstgeschichte.',
          correctLetters: ['E']
        },
        {
          type: 'who',
          id: 'w6',
          statement: 'Jetzt wohne ich in Würzburg.',
          correctLetters: ['E', 'H', 'S']
        },
        {
          type: 'who',
          id: 'w7',
          statement: 'In der ersten Woche ist es schwer [in Deutschland] Deutsch zu verstehen.',
          correctLetters: ['E', 'H', 'S']
        },
        {
          type: 'who',
          id: 'w8',
          statement: 'Ich wohne in Austin.',
          correctLetters: ['E']
        }
      ]
    }
  },
  {
    chapter: 1,
    id: 26,
    type: 'workbook',
    icon: 'videoclips',
    title: 'Aktivität 26. Erin und Hassan — „Freunde & Weiteres“',
    description: 'True / false while viewing.',
    duration: '25 min',
    prerequisites: [],
    intro:
      'For each statement, mark R (richtig) or F (falsch) and correct the false ones, following the workbook lists for Erin and Hassan.',
    links: [{ label: 'Kapitel 1 interviews', url: DIB_K1 }],
    pdfNote: 'QR 1.9 and 1.27.',
    checks: {
      blocks: [
        { type: 'sectionTitle', text: 'Erin — Richtig oder falsch? (after watching QR 1.9)' },
        { type: 'tf', id: 'e1', statement: 'Ich habe viele deutsche Freunde.', correct: false },
        { type: 'tf', id: 'e2', statement: 'Ich habe in Würzburg ein Praktikum gemacht.', correct: false },
        { type: 'tf', id: 'e3', statement: 'In Bayern kann ich Deutsch nicht verstehen.', correct: true },
        { type: 'tf', id: 'e4', statement: 'Nach ein paar Tagen versteht man viel Deutsch.', correct: true },
        { type: 'sectionTitle', text: 'Hassan — Richtig oder falsch? (after watching QR 1.27)' },
        { type: 'tf', id: 'h1', statement: 'Ich war letzten Sommer in Würzburg.', correct: false },
        { type: 'tf', id: 'h2', statement: 'Ich habe viele Freunde getroffen.', correct: true },
        { type: 'tf', id: 'h3', statement: 'Meine Freunde heißen Alfred und Tina.', correct: false },
        { type: 'tf', id: 'h4', statement: 'Meine Freunde wollen, dass ich ihnen mit ihrem Englisch helfe.', correct: true },
        { type: 'tf', id: 'h5', statement: 'Es ist leicht in Würzburg Deutsch zu verstehen.', correct: false }
      ]
    }
  },
  {
    chapter: 1,
    id: 27,
    type: 'workbook',
    icon: 'videoclips',
    title: 'Aktivität 27. Berna',
    description: 'Short answers on two clips: Studium & Wohnen / Freunde & Weiteres',
    duration: '25 min',
    prerequisites: [],
    intro: 'Answer the guided questions in the workbook while re-watching Berna’s two themed clips.',
    links: [{ label: 'Kapitel 1 interviews', url: DIB_K1 }],
    pdfNote: 'QR 1.16 and 1.17.'
  },
  {
    chapter: 1,
    id: 28,
    type: 'workbook',
    icon: 'videoclips',
    title: 'Aktivität 28. Jan',
    description: 'Cloze summaries + reflection on studieren vs. English “study”.',
    duration: '30 min',
    prerequisites: [],
    intro:
      'Fill the blanks for Jan’s “Studium & Wohnen” and “Freunde & Weiteres” clips, then discuss Schule, Gymnasium, and the meaning of studieren.',
    links: [{ label: 'Kapitel 1 interviews', url: DIB_K1 }],
    pdfNote: 'QR 1.24 and 1.25.'
  },
  {
    chapter: 1,
    id: 29,
    type: 'workbook',
    icon: 'groupactivity',
    title: 'Aktivität 29. Fragen, Fragen, noch mehr Fragen',
    description: 'Question words + interview + class report.',
    duration: '35 min',
    prerequisites: [],
    sections: [
      {
        heading: 'A. Keywords',
        paragraphs: ['Collect keywords (Herkunft, Studium, …) and match them to question words (Wer, Wo, Woher, …).']
      },
      {
        heading: 'B & C',
        paragraphs: [
          'Generate questions, interview a classmate, write a short report, and present.'
        ]
      }
    ],
    links: [
      { label: 'Grimm Grammar — question words', url: 'https://coerll.utexas.edu/gg/gr/con_05.html' },
      { label: 'Grimm Grammar — pronouns nominative', url: 'https://coerll.utexas.edu/gg/gr/pro_02.html' }
    ]
  },
  {
    chapter: 1,
    id: 30,
    type: 'workbook',
    icon: 'videoclips',
    title: 'Aktivität 30. Sprache im Kontext: Das Handy',
    description: 'Adam — buying and using a mobile phone in Germany.',
    duration: '35 min',
    prerequisites: [],
    sections: [
      { heading: 'A–C', paragraphs: ['Summarize the clip; list words you recognize; define what a Handy is in German.'] },
      { heading: 'D', paragraphs: ['Answer detail questions (store name, offer, Konto, prices, SMS, …).'] },
      { heading: 'E', paragraphs: ['Order the purchase steps as in the workbook.'] }
    ],
    links: [{ label: 'Kapitel 1 — Sprache im Kontext', url: DIB_K1 }],
    pdfNote: 'QR 1.30.',
    checks: {
      blocks: [
        {
          type: 'order',
          id: 'handy_order',
          instruction: 'Aktivität 30 E — Order the steps for loading prepaid credit (first step at the top).',
          items: [
            { id: 1, text: 'Sie sagen: „Ich brauche 30 Euro Guthaben, bitte.”' },
            { id: 2, text: 'Sie bezahlen 30 Euro.' },
            { id: 3, text: 'Sie bekommen eine Karte mit einem PIN-Code darauf.' },
            { id: 4, text: 'Der Verkäufer kann das Geld auf Ihr Handy laden.' }
          ],
          correctOrder: [1, 2, 3, 4]
        }
      ]
    }
  },
  {
    chapter: 1,
    id: 31,
    type: 'workbook',
    icon: 'readingtask',
    title: 'Aktivität 31. Lieder & Musik',
    description: 'Annett Louisan — Drück die 1',
    duration: '20 min',
    prerequisites: [],
    intro:
      'Listen to the song and complete the separate “Lieder & Musik” PDF activities on the Deutsch im Blick website (Kapitel 1).',
    links: [
      { label: 'Deutsch im Blick — Kapitel 1', url: DIB_K1 },
      { label: 'COERLL Deutsch im Blick home', url: 'https://coerll.utexas.edu/dib/' }
    ]
  },
  {
    chapter: 1,
    id: 32,
    type: 'workbook',
    icon: 'readingtask',
    title: 'Aktivität 32. Sprechen Sie Deutsch?',
    description: 'Reading: greetings in Germany, Austria, and Switzerland.',
    duration: '30 min',
    prerequisites: [],
    intro:
      'Read the text on regional greetings and Sie vs. du. Complete the “Fragen zum Text” (tables on greetings by country, formal/informal, duzen/siezen, your own language, ask German-speaking friends).',
    sections: [
      {
        heading: 'Text (summary)',
        paragraphs: [
          'German is spoken differently in Germany, Austria, and Switzerland. Examples include Moin moin, Grüß Gott, Servus, Grüezi, Guten Tag, Tschüss, Ade, and standard Auf Wiedersehen. Formal situations use Sie; friends and family use du.'
        ]
      }
    ],
    links: [
      { label: 'Grimm Grammar — haben', url: 'https://coerll.utexas.edu/gg/gr/vi_05.htm' },
      { label: 'Workbook PDF', url: PDF_K1 }
    ],
    checks: {
      blocks: [
        {
          type: 'short',
          id: 'duzen',
          prompt: 'According to the text: what does duzen mean, and with whom do Germans typically duzen? (A few English or German words are enough.)',
          keywords: ['du', 'friend|freund'],
          hint: 'Mention informal *du* and people such as friends / *Freunde* (or family).'
        },
        {
          type: 'short',
          id: 'siezen',
          prompt: 'What does siezen mean, and with whom is *Sie* typically used?',
          keywords: ['sie', 'formal'],
          hint: 'Mention formal *Sie* and people you do not know / strangers.'
        },
        {
          type: 'mc',
          id: 'gruetzi',
          question: 'Which country is *Grüezi* most associated with in the text?',
          options: ['Germany', 'Austria', 'Switzerland'],
          correctIndex: 2
        }
      ]
    }
  },
  {
    chapter: 1,
    id: 33,
    type: 'workbook',
    icon: 'groupactivity',
    title: 'Aktivität 33. Kennenlernspiel',
    description: 'Find someone who … (class mingle).',
    duration: '30 min',
    prerequisites: [],
    intro:
      'Write three yes/no questions (verb-first, e.g. Reist du in die Schweiz?). Then mingle and find classmates for each “Finde mindestens eine Person, die …” line in the workbook.',
    tasks: [
      'Examples from the packet: reist in die Schweiz; liebt kaltes Wetter; hat eine Katze; macht Yoga; trinkt keinen Kaffee; mag Schokolade; kommt aus Austin; spielt Tennis; mag kein Fleisch; fährt Ski; liebt warmes Wetter; ist 21 Jahre alt; hat Gelb als Lieblingsfarbe; mag Hunde; spricht mehr als drei Sprachen; hat Allergien.'
    ],
    links: [{ label: 'Workbook PDF', url: PDF_K1 }]
  }
];

const allActivities = [...activities, ...chapter2Activities];
fs.writeFileSync(out, JSON.stringify({ activities: allActivities }, null, 2), 'utf8');
console.log('Wrote', out, allActivities.length, 'activities (Kapitel 1:', activities.length, '+ Kapitel 2:', chapter2Activities.length + ')');
