import {
  defaultAiForPageType,
  isGradableAiMode,
  resolveReadingItemAi,
  resolveWritingTaskAi
} from './aiActivityConfig';
import { mergePageActivity } from './normalizeActivity';
import {
  clozeFieldId,
  collectWorkbookGradableFields,
  resolveClozeLineAi
} from './workbookFields';

export function writingFieldId(pageId, suffix) {
  const pagePart = pageId ? `${pageId}_` : '';
  return `writing_${pagePart}${suffix}`;
}

export function readingFieldId(pageId, itemId) {
  const pagePart = pageId ? `${pageId}_` : '';
  return `reading_${pagePart}${itemId}`;
}

function resolveMergedPage(activity, currentPageId) {
  if (!activity) return null;

  if (activity.pages?.length) {
    const page =
      activity.pages.find((p) => p.id === currentPageId) ?? activity.pages[0];
    return mergePageActivity(activity, page);
  }

  if (activity.type) {
    return activity;
  }

  return null;
}

/**
 * Derive gradable session fields from activity JSON for the active page.
 * Single source of truth — avoids per-component registration races.
 * @param {object} activity — exercise envelope
 * @param {string|null|undefined} currentPageId
 * @returns {Record<string, object>}
 */
export function collectPageSessionFields(activity, currentPageId) {
  const pageActivity = resolveMergedPage(activity, currentPageId);
  if (!pageActivity?.type) return {};

  const pageId = currentPageId ?? pageActivity.id ?? 'main';
  const pageAi = pageActivity.ai ?? defaultAiForPageType(pageActivity.type, pageActivity);
  const fields = {};

  switch (pageActivity.type) {
    case 'writing': {
      const { tasks = [], speakers = [] } = pageActivity;

      if (speakers.length > 0) {
        speakers.forEach((speaker) => {
          speaker.questions?.forEach((question, qIdx) => {
            const taskAi = resolveWritingTaskAi(pageAi, { ai: speaker.ai });
            if (!isGradableAiMode(taskAi.grading)) return;

            const fieldId = writingFieldId(pageId, `${speaker.id}_${qIdx}`);
            fields[fieldId] = {
              type: 'writing',
              prompt: question,
              aiGrading: taskAi.grading,
              requirePass: taskAi.requirePass,
              rubric: taskAi.rubric
            };
          });
        });
        break;
      }

      tasks.forEach((task, idx) => {
        const taskObj = typeof task === 'object' && task !== null ? task : { text: String(task) };
        const taskAi = resolveWritingTaskAi(pageAi, taskObj);
        if (!isGradableAiMode(taskAi.grading)) return;

        const fieldId = writingFieldId(pageId, `task_${idx}`);
        fields[fieldId] = {
          type: 'writing',
          prompt: taskObj.text || '',
          aiGrading: taskAi.grading,
          requirePass: taskAi.requirePass,
          rubric: taskAi.rubric
        };
      });
      break;
    }

    case 'reading_self_check': {
      (pageActivity.readingItems || []).forEach((item) => {
        if (item.acknowledgeLabel) return;

        const itemAi = resolveReadingItemAi(pageAi, item);
        if (!isGradableAiMode(itemAi.grading)) return;

        const fieldId = readingFieldId(pageId, item.id);
        fields[fieldId] = {
          type: 'reading',
          prompt: item.prompt,
          modelAnswer: item.modelAnswer,
          acceptedAnswers: item.acceptedAnswers,
          keywords: item.keywords,
          aiGrading: itemAi.grading,
          requirePass: itemAi.requirePass,
          rubric: itemAi.rubric
        };
      });
      break;
    }

    case 'cloze': {
      (pageActivity.lines || []).forEach((line, index) => {
        const lineAi = resolveClozeLineAi(pageAi, line);
        if (!isGradableAiMode(lineAi.grading)) return;

        const promptParts = [line.prefix, line.suffix].filter(Boolean);
        const prompt =
          promptParts.length > 0
            ? `${line.prefix || ''} ___ ${line.suffix || ''}`.trim()
            : `Blank ${index + 1}`;

        const fieldId = clozeFieldId(pageId, index);
        fields[fieldId] = {
          type: 'cloze',
          prompt,
          modelAnswer: line.modelAnswer,
          acceptedAnswers: line.acceptedAnswers,
          keywords: line.keywords,
          aiGrading: lineAi.grading,
          requirePass: lineAi.requirePass,
          rubric: lineAi.rubric
        };
      });
      break;
    }

    case 'workbook': {
      const gradable = collectWorkbookGradableFields(
        pageActivity.checks?.blocks || [],
        pageId,
        pageAi
      );
      gradable.forEach((field) => {
        fields[field.fieldId] = {
          type: field.kind === 'cloze' ? 'workbook_cloze' : 'workbook_text',
          prompt: field.prompt,
          modelAnswer: field.modelAnswer,
          acceptedAnswers: field.acceptedAnswers,
          keywords: field.keywords,
          aiGrading: field.aiGrading,
          requirePass: field.requirePass,
          rubric: field.rubric
        };
      });
      break;
    }

    default:
      break;
  }

  return fields;
}
