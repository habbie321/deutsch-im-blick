/**
 * Extract short "Aktivität n." headings from COERLL k_0N.pdf text dumps
 * (see scripts/pdf-extracts/k_0N.txt).
 */

const EN_START =
  /^(Watch|Listen|Read|Review|Describe|Ask|Select|Shortly|Complete|One of|Another|Think|Did you|Fill|Circle|Match|Write|Underline|Visit|Using|What|How|Look|If you|You |Your |They |Young |Before |Complete|A\. |B\. |C\. |D\. |E\. |In Grimm|In the |In this|Another |Go to|Tommy |Wie viel |Wie oft |Ihre Freunde|Sie geben|Sie die|Beispiel|Christine|Strandtücher|Digitalkamera)/i;

/** Next line clearly continues a German heading (PDF line wrap). */
const GER_HEAD_CONT =
  /^(Reise|Partnerin\??|nur |Land |Pflaster\??|sonn|Mitbringsel|Partner|Partnerin|Bilderreihe)/;

function normalizeHyphens(s) {
  return s
    .replace(/fei-\s*ern/gi, 'feiern')
    .replace(/Fei-\s*ertage/gi, 'Feiertage')
    .replace(/unser-\s*em/gi, 'unserem')
    .replace(/Um-\s*welt/gi, 'Umwelt')
    .replace(/Ge-\s*schichte/gi, 'Geschichte')
    .replace(/unterne-\s*hmen/gi, 'unternehmen')
    .replace(/Gegen-\s*seitiges/gi, 'Gegenseitiges')
    .replace(/her-\s*um/gi, 'herum')
    .replace(/weni-\s*ger/gi, 'weniger')
    .replace(/Engergie/gi, 'Energie')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * @param {string} text full PDF extract
 * @returns {string[]}
 */
export function parseActivityTitles(text) {
  const lines = text.split(/\r?\n/);
  const titles = [];
  let i = 0;
  while (i < lines.length) {
    const m = lines[i].match(/^Aktivität (\d+)\.\s*(.*)$/);
    if (!m) {
      i++;
      continue;
    }
    let title = m[2].trim();
    i++;
    while (i < lines.length) {
      const nextTrim = lines[i].trim();
      if (!nextTrim) {
        i++;
        continue;
      }
      if (/^Aktivität \d+\./.test(lines[i])) break;
      if (EN_START.test(nextTrim)) break;
      if (nextTrim.startsWith('-') && nextTrim.length < 180) {
        title = (title + ' ' + nextTrim.slice(1)).replace(/\s+/g, ' ').trim();
        i++;
        continue;
      }
      if (title.match(/-\s*$/) || title.match(/[a-zäöü]-\s*$/i)) {
        title = (title + ' ' + nextTrim).replace(/\s+/g, ' ').trim();
        i++;
        continue;
      }
      if (GER_HEAD_CONT.test(nextTrim) && nextTrim.length < 120) {
        title = (title + ' ' + nextTrim).replace(/\s+/g, ' ').trim();
        i++;
        continue;
      }
      if (!/[.?!…]$/.test(title) && nextTrim.length < 90 && (/^[a-zäöüß]/.test(nextTrim) || nextTrim.startsWith('-'))) {
        title = (title + ' ' + nextTrim).replace(/\s+/g, ' ').trim();
        i++;
        continue;
      }
      if (/\b(deine|ideale|goldene|neuen)$/.test(title) && nextTrim.length < 100 && !EN_START.test(nextTrim)) {
        title = (title + ' ' + nextTrim).replace(/\s+/g, ' ').trim();
        i++;
        continue;
      }
      if (/\bfür\s*$/.test(title) && nextTrim.length < 100 && !EN_START.test(nextTrim)) {
        title = (title + ' ' + nextTrim).replace(/\s+/g, ' ').trim();
        i++;
        continue;
      }
      if (/Sprache im Kontext:\s*$/.test(title) && nextTrim.length < 120 && !EN_START.test(nextTrim)) {
        title = (title + ' ' + nextTrim).replace(/\s+/g, ' ').trim();
        i++;
        continue;
      }
      break;
    }
    titles.push(normalizeHyphens(title));
  }
  return titles;
}
