import {
  defaultAiForPageType,
  isGradableAiMode,
  mergeAiConfig,
  resolveWritingTaskAi
} from './aiActivityConfig';

/** @param {string} [pageId] @param {string|number} blockId @param {string} suffix */
export function workbookFieldId(pageId, blockId, suffix) {
  const pagePart = pageId ? `${pageId}_` : '';
  return `workbook_${pagePart}${blockId}_${suffix}`;
}

/** @param {string} [pageId] @param {number} lineIndex */
export function clozeFieldId(pageId, lineIndex) {
  const pagePart = pageId ? `${pageId}_` : '';
  return `cloze_${pagePart}line_${lineIndex}`;
}

/**
 * @param {import('./aiActivityConfig').AiConfig} pageAi
 * @param {object} block
 */
export function resolveWorkbookBlockAi(pageAi, block) {
  const typeDefault =
    block?.type === 'text' || block?.type === 'cloze'
      ? { grading: 'semantic', requirePass: false }
      : { grading: 'none', requirePass: false };
  return mergeAiConfig(pageAi, mergeAiConfig(typeDefault, block?.ai));
}

/**
 * @param {import('./aiActivityConfig').AiConfig} pageAi
 * @param {object} line
 */
export function resolveClozeLineAi(pageAi, line) {
  const hasKeys = line?.acceptedAnswers?.length || line?.keywords?.length;
  const defaultGrading = hasKeys
    ? line?.acceptedAnswers?.length
      ? 'exact'
      : 'keywords'
    : 'semantic';
  return mergeAiConfig(pageAi, mergeAiConfig({ grading: defaultGrading }, line?.ai));
}

/**
 * @param {object[]} blocks
 * @param {string} pageId
 * @param {import('./aiActivityConfig').AiConfig} pageAi
 */
export function collectWorkbookGradableFields(blocks, pageId, pageAi) {
  const resolvedPageAi = pageAi ?? defaultAiForPageType('workbook');
  const fields = [];

  for (const block of blocks || []) {
    if (block.type === 'text') {
      const blockAi = resolveWorkbookBlockAi(resolvedPageAi, block);
      const prompts = (block.prompts || []).map((prompt) =>
        typeof prompt === 'string' ? { text: prompt } : prompt
      );

      prompts.forEach((prompt, index) => {
        const promptAi = resolveWritingTaskAi(blockAi, prompt);
        if (!isGradableAiMode(promptAi.grading)) return;

        fields.push({
          fieldId: workbookFieldId(pageId, block.id, `p${index}`),
          blockId: block.id,
          kind: 'text',
          index,
          prompt: prompt.text || '',
          modelAnswer: prompt.modelAnswer,
          acceptedAnswers: prompt.acceptedAnswers,
          keywords: prompt.keywords,
          aiGrading: promptAi.grading,
          requirePass: promptAi.requirePass,
          rubric: promptAi.rubric
        });
      });
    }

    if (block.type === 'cloze') {
      const blockAi = resolveWorkbookBlockAi(resolvedPageAi, block);
      (block.lines || []).forEach((line, index) => {
        const lineAi = resolveClozeLineAi(blockAi, line);
        if (!isGradableAiMode(lineAi.grading)) return;

        const promptParts = [line.prefix, line.suffix].filter(Boolean);
        const prompt =
          promptParts.length > 0
            ? `${line.prefix || ''} ___ ${line.suffix || ''}`.trim()
            : block.prompt || `Blank ${index + 1}`;

        fields.push({
          fieldId: workbookFieldId(pageId, block.id, `l${index}`),
          blockId: block.id,
          kind: 'cloze',
          index,
          prompt,
          modelAnswer: line.modelAnswer,
          acceptedAnswers: line.acceptedAnswers,
          keywords: line.keywords,
          aiGrading: lineAi.grading,
          requirePass: lineAi.requirePass,
          rubric: lineAi.rubric
        });
      });
    }
  }

  return fields;
}

/**
 * Score deterministic workbook blocks (tf, mc, who, multi, order).
 * @returns {Record<string, { answered: boolean, correct: boolean|null, feedback?: string }>}
 */
export function scoreDeterministicBlocks(blocks, answers) {
  const results = {};

  for (const block of blocks || []) {
    switch (block.type) {
      case 'tf': {
        const value = answers.tf?.[block.id];
        if (value === undefined) {
          results[block.id] = { answered: false, correct: null };
          break;
        }
        if (typeof block.correct !== 'boolean') {
          results[block.id] = { answered: true, correct: null };
          break;
        }
        results[block.id] = {
          answered: true,
          correct: value === block.correct,
          feedback: value === block.correct ? 'Correct!' : 'Incorrect.'
        };
        break;
      }
      case 'mc':
      case 'who': {
        const value = answers.mc?.[block.id];
        if (value === undefined) {
          results[block.id] = { answered: false, correct: null };
          break;
        }
        if (typeof block.correctAnswer !== 'number') {
          results[block.id] = { answered: true, correct: null };
          break;
        }
        results[block.id] = {
          answered: true,
          correct: value === block.correctAnswer,
          feedback: value === block.correctAnswer ? 'Correct!' : 'Incorrect.'
        };
        break;
      }
      case 'multi': {
        const selected = answers.multi?.[block.id] || [];
        if (!selected.length) {
          results[block.id] = { answered: false, correct: null };
          break;
        }
        const expected = block.correctIndices;
        if (!Array.isArray(expected) || expected.length === 0) {
          results[block.id] = { answered: true, correct: null };
          break;
        }
        const expectedSet = new Set(expected);
        const selectedSet = new Set(selected);
        const correct =
          expectedSet.size === selectedSet.size &&
          [...expectedSet].every((idx) => selectedSet.has(idx));
        results[block.id] = {
          answered: true,
          correct,
          feedback: correct ? 'Correct!' : 'Some selections are wrong.'
        };
        break;
      }
      case 'order': {
        const items = answers.order?.[block.id] || block.items || [];
        if (!Array.isArray(block.correctOrder) || block.correctOrder.length === 0) {
          results[block.id] = { answered: true, correct: null };
          break;
        }
        const orderIds = items.map((item) => item.id);
        const correct =
          orderIds.length === block.correctOrder.length &&
          orderIds.every((id, i) => id === block.correctOrder[i]);
        results[block.id] = {
          answered: true,
          correct,
          feedback: correct ? 'Correct order!' : 'Order is not correct yet.'
        };
        break;
      }
      default:
        break;
    }
  }

  return results;
}

/**
 * @param {Record<string, { answered: boolean, correct: boolean|null }>} scores
 */
export function summarizeDeterministicScores(scores) {
  const entries = Object.values(scores);
  const graded = entries.filter((s) => s.correct != null);
  if (graded.length === 0) return null;

  const correctCount = graded.filter((s) => s.correct).length;
  return `${correctCount} of ${graded.length} auto-graded items correct.`;
}
