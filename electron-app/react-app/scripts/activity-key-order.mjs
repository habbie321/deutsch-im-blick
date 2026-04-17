/**
 * Canonical key order for activity objects in activites.json (matches hand-edited style).
 * chapter → id → type → icon → … → links → pdfNote
 */
export const ACTIVITY_KEY_ORDER = [
  'chapter',
  'id',
  'type',
  'icon',
  'title',
  'text',
  'description',
  'duration',
  'prerequisites',
  'intro',
  'tasks',
  'videos',
  'wordBank',
  'speakers',
  'example',
  'helpfulExpressions',
  'image',
  'notaBene',
  'questionSets',
  'readingItems',
  'sections',
  'grid',
  'lines',
  'leftColumnTitle',
  'rightColumnTitle',
  'matchInstruction',
  'matchingPairs',
  'checks',
  'links',
  'pdfNote'
];

const ORDER_SET = new Set(ACTIVITY_KEY_ORDER);

/**
 * @param {Record<string, unknown>} activity
 * @returns {Record<string, unknown>}
 */
export function reorderActivityKeys(activity) {
  const ordered = {};
  for (const k of ACTIVITY_KEY_ORDER) {
    if (Object.prototype.hasOwnProperty.call(activity, k)) {
      ordered[k] = activity[k];
    }
  }
  const rest = Object.keys(activity).filter((k) => !ORDER_SET.has(k));
  rest.sort();
  for (const k of rest) {
    ordered[k] = activity[k];
  }
  return ordered;
}
