/**
 * COERLL Deutsch im Blick — Kapitel 2 (k_02.pdf)
 * Merge via build-chapter1-json.mjs → activites.json
 */

const PDF_K2 = 'https://coerll.utexas.edu/dib/pdfs/k_02.pdf';
const DIB_K2 = 'https://coerll.utexas.edu/dib/toc.php?k=2';
const VOC2 = 'https://coerll.utexas.edu/dib/voc.php?k=2';

function wb2(id, title, description, icon = 'groupactivity', extra = {}) {
  return {
    chapter: 2,
    id,
    type: 'workbook',
    icon,
    title: `Aktivität ${id}. ${title}`,
    description,
    duration: 'varies',
    prerequisites: [],
    pdfNote: `COERLL Kapitel 2 workbook: ${PDF_K2}`,
    links: [
      { label: 'Kapitel 2 · Videos & Übersicht', url: DIB_K2 },
      { label: 'Kapitel 2 · Wortschatz', url: VOC2 }
    ],
    ...extra
  };
}

export default [
  wb2(1, 'Was studieren Sie?', 'Brainstorm: Welche Wörter gehören zu „das Studium“? (QR 2.2)', 'videoclips'),
  wb2(2, 'Evas Studium', 'Eva „Mein Studium“: check all correct answers per question (QR 2.3).', 'videoclips'),
  wb2(3, 'Wer studiert was?', 'Adan, Sara, Sophia — connect photos to info bubbles (QR 2.4–2.6).', 'videoclips'),
  {
    chapter: 2,
    id: 4,
    type: 'matching_activity',
    icon: 'videoclips',
    title: 'Aktivität 4. Berna und Jan: Mein Studium',
    description: 'Watch Berna & Jan (QR 2.7, 2.9), take notes (Teil A), then match phrases (Teil B).',
    duration: '30 min',
    prerequisites: [],
    leftColumnTitle: 'Deutsch',
    rightColumnTitle: 'English',
    matchInstruction:
      'Listen first, then match each German sentence with its English meaning (workbook Teil B).',
    matchingPairs: [
      { id: 1, german: 'Es ist schon manchmal sehr viel Arbeit.', english: "Sometimes it's a lot of work." },
      { id: 2, german: 'Ich mag mein Studium sehr.', english: 'I really like my studies.' },
      { id: 3, german: 'Ich bin sehr zufrieden damit.', english: "I'm quite happy with it (my studies)." },
      { id: 4, german: 'Ich studiere an der Universität von...', english: 'I am studying at the University of...' }
    ],
    links: [
      { label: 'Kapitel 2', url: DIB_K2 },
      { label: 'Grimm Grammar · conjunctions', url: 'https://coerll.utexas.edu/gg/gr/con_03.html' }
    ],
    pdfNote: PDF_K2
  },
  {
    ...wb2(5, 'Hassans Studium', 'Hassan „Mein Studium“: circle the correct answers (QR 2.10).', 'videoclips'),
    checks: {
      blocks: [
        {
          type: 'mc',
          id: 'h5a',
          question: 'Was studiert Hassan an UT?',
          options: ['Philosophie', 'Psychologie', 'Philharmonie'],
          correctIndex: 0
        },
        {
          type: 'mc',
          id: 'h5b',
          question: 'Was studiert Hassan nächstes Jahr?',
          options: ['Flora', 'Matura', 'Jura', 'Algebra'],
          correctIndex: 2
        },
        {
          type: 'mc',
          id: 'h5c',
          question: 'Wo studiert Hassan nächstes Jahr?',
          options: ['in New York', 'in York', 'in New Jersey', 'in Nürnberg'],
          correctIndex: 1
        },
        {
          type: 'mc',
          id: 'h5d',
          question: 'Was war Hassans Lieblingskurs?',
          options: ['Quatsch', 'Französisch', 'Deutsch'],
          correctIndex: 2
        },
        {
          type: 'mc',
          id: 'h5e',
          question: 'Warum will Hassan Jura studieren?',
          options: ['Geld', 'Ansehen', 'Menschen helfen'],
          correctIndex: 2
        }
      ]
    }
  },
  wb2(6, 'Haralds Studium', 'Harald „Mein Studium“: Stimmung, details, Unileben (QR 2.8).', 'videoclips', {
    sections: [
      {
        heading: 'Grimm Grammar',
        list: ['Coordinating conjunctions: coerll.utexas.edu/gg/gr/con_03.html']
      }
    ]
  }),
  wb2(7, 'Ihr Studium', 'Compare your university habits with Harald’s narrative; partner work.', 'groupactivity'),
  wb2(8, 'Meine Lieblingskurse', 'Sophia „Lieblingskurse“ — circle all that apply (QR 2.11).', 'videoclips'),
  wb2(
    9,
    'Weitere Lieblingskurse … oder auch nicht',
    'Berna, Eva, Jan, Adan, Erin, Sara — favorite / least favorite courses (QR 2.12–2.18).',
    'videoclips'
  ),
  wb2(10, 'Positiv/Negativ', 'Sort expressions; describe your own courses this semester.', 'readingtask'),
  wb2(11, 'Ein kleines Interview', 'Partner interview: Lieblingskurs / Kurs den man nicht mag.', 'groupactivity', {
    sections: [{ heading: 'Preview', paragraphs: ['Modalverb mögen — see workbook box.'] }]
  }),
  wb2(12, 'Wann haben sie Unterricht?', 'Hassan, Eva, Jan — „Im Unterricht“ listening (QR 2.19, 2.21, 2.22).', 'videoclips', {
    sections: [
      {
        heading: 'Grammar',
        list: [
          'Telling time: coerll.utexas.edu/gg/gr/cas_04.html',
          'Days of the week: coerll.utexas.edu/gg/gr/cas_05.html'
        ]
      }
    ]
  }),
  {
    ...wb2(13, 'Sara', 'Sara „Im Unterricht“ in Würzburg — richtig / falsch (QR 2.23).', 'videoclips'),
    checks: {
      blocks: [
        { type: 'tf', id: 's13a', statement: 'Sara hat jeden Tag Unterricht.', correct: false },
        { type: 'tf', id: 's13b', statement: 'Sara hat nur zwei Tage pro Woche Unterricht.', correct: false },
        {
          type: 'tf',
          id: 's13c',
          statement: 'Sara hat am Dienstag, am Mittwoch und am Donnerstag Unterricht.',
          correct: true
        },
        { type: 'tf', id: 's13d', statement: 'Ihre Kurse beginnen um acht Uhr.', correct: false },
        { type: 'tf', id: 's13e', statement: 'Am Dienstag hat Sara einen Ökonomiekurs.', correct: false },
        { type: 'tf', id: 's13f', statement: 'Am Donnerstag hat Sara einen Deutschkurs.', correct: true }
      ]
    }
  },
  wb2(14, 'Ihr Studium', 'Stundenplan: your schedule and a partner’s (Wann haben Sie Unterricht?).', 'groupactivity', {
    sections: [
      {
        heading: 'Grammar',
        list: ['Accusative case: coerll.utexas.edu/gg/gr/cas_03.html']
      }
    ]
  }),
  wb2(15, 'Eine Verabredung', 'Find a 3-hour slot for a German film + report — dialog / skit.', 'groupactivity'),
  {
    ...wb2(
      16,
      'Sprache im Kontext: Katrins Studiengang',
      'Course types in Germany: Grundstudium, Hauptstudium, Vorlesung, Anwesenheit (QR 2.17).',
      'videoclips'
    ),
    checks: {
      blocks: [
        { type: 'sectionTitle', text: 'Teil D — Richtig oder falsch?' },
        {
          type: 'tf',
          id: 'k16a',
          statement: 'Katrin ist Professorin für Amerikanistik an der Uni Würzburg.',
          correct: false
        },
        {
          type: 'tf',
          id: 'k16b',
          statement: 'Sie spricht über den Aufbau des Studiums an der Uni Würzburg.',
          correct: true
        },
        {
          type: 'tf',
          id: 'k16c',
          statement: 'Das Studium hat zwei Teile: Grund- und Hauptstudium.',
          correct: true
        },
        {
          type: 'tf',
          id: 'k16d',
          statement: 'Im Grundstudium belegen die Studenten nur Vorlesungen.',
          correct: false
        },
        {
          type: 'tf',
          id: 'k16e',
          statement: 'Im Hauptstudium belegen die Studenten Haupt- und Oberseminare.',
          correct: true
        },
        {
          type: 'tf',
          id: 'k16f',
          statement: 'Bei Vorlesungen müssen alle Studenten anwesend sein.',
          correct: false
        },
        {
          type: 'tf',
          id: 'k16g',
          statement: 'Am Ende des Studiums machen alle Studenten das gleiche Examen.',
          correct: false
        },
        {
          type: 'tf',
          id: 'k16h',
          statement: 'Das Staatsexamen ist eine Prüfung für zukünftige Lehrer.',
          correct: true
        }
      ]
    }
  },
  wb2(17, 'Studieren in Deutschland: Vorlesungsverzeichnis', 'Uni Würzburg course catalog online — pick two courses.', 'readingtask', {
    links: [
      { label: 'Vorlesungsverzeichnis Würzburg', url: 'https://www.uni-wuerzburg.de/fuer/studierende/vorlesungsverzeichnis/' },
      { label: 'Kapitel 2', url: DIB_K2 }
    ]
  }),
  wb2(18, 'Berna und Jan: Anforderungen', 'Assignments: Klausur, Referat, Seminararbeit … (QR 2.25, 2.26).', 'videoclips'),
  wb2(
    19,
    'Guido erklärt alles …',
    'Read Guido’s e-mail (CH) on Examen, Prüfung, Klausur, Semesterarbeit.',
    'readingtask'
  ),
  {
    ...wb2(
      20,
      'Ihre Anforderungen und die Anforderungen von Ihren Mitstudenten',
      'Mind maps, partner interview, journalism; reflect on Guido’s e-mail + Katrin clip.',
      'groupactivity'
    ),
    checks: {
      blocks: [
        { type: 'sectionTitle', text: 'Guidos E-Mail — richtig oder falsch?' },
        { type: 'tf', id: 'g20a', statement: 'Für Guido besteht kein Unterschied zwischen Examen und Prüfung.', correct: true },
        {
          type: 'tf',
          id: 'g20b',
          statement: 'Eine Abschlussprüfung / ein Abschlussexamen ist die letzte Prüfung vor dem Abschluss.',
          correct: true
        },
        { type: 'tf', id: 'g20c', statement: 'Eine Seminararbeit ist eine Arbeit, die man für einen Kurs am Ende des Semesters schreibt.', correct: true },
        { type: 'tf', id: 'g20d', statement: 'An deutschen Unis haben viele Kurse „Quizze“ wie in den USA.', correct: false },
        {
          type: 'tf',
          id: 'g20e',
          statement: 'Führerschein: Fahrprüfung; Optiker: Sehtest (nicht „Sehexamen“).',
          correct: true
        }
      ]
    },
    sections: [
      {
        heading: 'Katrin „Anforderungen“',
        paragraphs: ['Watch the Sprache-im-Kontext clip and sort Anforderungen by Einführungskurse vs. Seminare (workbook).']
      }
    ]
  },
  wb2(21, 'Erfahrungsbericht', 'Interview classmates; write an e-mail to a prospective exchange student.', 'groupactivity', {
    sections: [
      {
        heading: 'Noten',
        paragraphs: ['Reflect on German 1–6 grading vs. your system (workbook Zum Nachdenken).']
      }
    ]
  }),
  wb2(
    22,
    'Sprache im Kontext: Katrin und Vanessa — Im Ausland studieren',
    'Listening + richtig/falsch + short answers (QR 2.27, 2.28).',
    'videoclips'
  ),
  wb2(23, 'Ein kleines Interview', 'Ausland, Fremdsprachen, Karriere — partner questions.', 'groupactivity'),
  wb2(24, 'Das schwarze Brett', 'Campus ads: verkaufen/suchen; phrases; write your own Anzeige.', 'readingtask'),
  wb2(25, 'Im Studentenwohnheim', 'Read Anke’s message to Jackie; Wohnheim, Meldepflicht, Haushaltspaket.', 'readingtask', {
    links: [
      { label: 'studentenwerk.de', url: 'https://www.studentenwerk.de' },
      { label: 'Würzburg Meldewesen', url: 'https://www.wuerzburg.de/de/buerger/buergerbuero/meldewesen/index.html' }
    ]
  }),
  wb2(26, 'Im Studentenwohnheim', 'Label rooms and furniture with accusative articles (host-family picture).', 'readingtask', {
    sections: [
      {
        heading: 'Grammar',
        list: ['Accusative: coerll.utexas.edu/gg/gr/cas_03.html', 'haben: coerll.utexas.edu/gg/gr/vi_05.htm']
      }
    ]
  }),
  wb2(27, 'Sprache im Kontext: Bernas Wohnung', 'Rooms, items in Berna’s room, where she shops (QR 2.29).', 'videoclips'),
  wb2(28, 'Sprache im Kontext: Was hat Sara in ihrer Wohnung?', 'Saras Küche, Bad, Schlafzimmer (QR 2.30).', 'videoclips', {
    sections: [{ heading: 'Grammar', list: ['Negation kein: see workbook box.'] }]
  }),
  wb2(29, 'Viel Spaß in der Wohnung!', 'Word search with bedroom vocabulary from Aktivität 28.', 'readingtask'),
  wb2(30, 'Mein Zimmer', 'haben / brauchen / möchten + accusative; optional IKEA budget task.', 'groupactivity', {
    links: [{ label: 'IKEA Deutschland', url: 'https://www.ikea.com/de/de/' }]
  }),
  wb2(31, 'Mein Traumhaus', 'Draw and label your dream house (15–20 items, accusative).', 'groupactivity'),
  wb2(32, 'Geschmäcker sind verschieden', 'Describe furniture; Wie findest du den Sessel? + accusative adjectives.', 'groupactivity'),
  wb2(33, 'Sprache im Kontext: Tobe — Der Computer', 'Computer parts and matching (QR 2.35).', 'videoclips'),
  wb2(34, 'Interviews: E-Mails schreiben: ja oder nein?', 'Harald on e-mail — circle all that apply (QR 2.34).', 'videoclips'),
  wb2(35, 'Eine Internet-Umfrage', 'Ja/Nein self-survey + class poll.', 'groupactivity'),
  wb2(36, 'Ein Interview', 'Partner interview: Technik, Computer, Handy, Fernsehen, Facebook.', 'groupactivity'),
  wb2(37, 'Das Technoleben', 'Group short story / skit on technology in daily life.', 'groupactivity')
];
