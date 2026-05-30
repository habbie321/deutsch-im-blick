/**
 * Compact activity context for AI chat / grading (Phase 1+).
 * @param {{ activity?: object, currentPageId?: string|null, inputs?: Record<string, string>, fields?: Record<string, object> }} params
 * @returns {string}
 */
export function buildActivityBrief({ activity, currentPageId, inputs = {}, fields = {} }) {
  if (!activity) return '';

  const lines = [
    `Activity: ${activity.title} (Chapter ${activity.chapter}, id ${activity.id})`
  ];

  if (activity.description) {
    lines.push(`Description: ${activity.description}`);
  }
  if (activity.intro) {
    lines.push(`Intro: ${activity.intro}`);
  }
  if (currentPageId) {
    lines.push(`Current page: ${currentPageId}`);
  }

  const fieldEntries = Object.entries(fields);
  if (fieldEntries.length > 0) {
    lines.push('Fields:');
    fieldEntries.forEach(([fieldId, meta]) => {
      const prompt = meta?.prompt || meta?.label || fieldId;
      const value = (inputs[fieldId] ?? '').trim();
      const preview = value ? value.slice(0, 120) + (value.length > 120 ? '…' : '') : '(empty)';
      lines.push(`- ${fieldId}: ${prompt}`);
      lines.push(`  Student answer: ${preview}`);
    });
  }

  return lines.join('\n');
}
