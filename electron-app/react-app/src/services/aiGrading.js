import {
  checkAutomaticAnswer,
  checkAutomaticAnswerByMode,
  hasAutomaticKeys
} from '../utils/answerMatch';
import { isGradableAiMode } from '../utils/aiActivityConfig';
import { formatGradeFeedback, isGradeSuccess } from '../utils/aiContracts';

export function cancelGradeRequest(requestId) {
  return typeof window !== 'undefined' ? window.api?.cancelAiRequest?.(requestId) : undefined;
}

function getGradeApi() {
  return typeof window !== 'undefined' ? window.api?.gradeAnswer : null;
}

function resolveGradingMode(request) {
  if (request.aiGrading) return request.aiGrading;
  if (hasAutomaticKeys(request)) {
    return request.keywords?.length ? 'keywords' : 'exact';
  }
  return 'semantic';
}

function automaticGradeResult({
  studentAnswer,
  acceptedAnswers,
  keywords,
  modelAnswer,
  gradingMode = 'keywords'
}) {
  const answer = String(studentAnswer ?? '').trim();

  if (!answer) {
    return {
      ok: true,
      correct: false,
      score: 0,
      feedback: 'Write an answer first, then check again.',
      corrections: [],
      canComplete: false,
      source: 'automatic',
      gradingMode: 'automatic'
    };
  }

  const pass =
    gradingMode === 'exact'
      ? checkAutomaticAnswerByMode(answer, { acceptedAnswers, mode: 'exact' })
      : gradingMode === 'keywords'
        ? checkAutomaticAnswerByMode(answer, { keywords, mode: 'keywords' })
        : checkAutomaticAnswer(answer, { acceptedAnswers, keywords });

  if (pass === null) {
    const missing =
      gradingMode === 'exact'
        ? 'This field is configured for exact matching but has no acceptedAnswers.'
        : 'This field is configured for keyword matching but has no keywords.';
    return {
      ok: true,
      correct: false,
      score: 0,
      feedback: missing,
      corrections: [],
      canComplete: false,
      source: 'automatic',
      gradingMode: 'automatic'
    };
  }

  if (pass) {
    return {
      ok: true,
      correct: true,
      score: 1,
      feedback: 'Correct!',
      corrections: [],
      canComplete: true,
      source: 'automatic',
      gradingMode: 'automatic'
    };
  }

  let feedback =
    gradingMode === 'exact' && acceptedAnswers?.length
      ? 'Not quite. Compare your answer with the expected form and try again. Ask the teacher in chat if you want help understanding why.'
      : 'Some required words or ideas are missing. Ask the teacher in chat if you want help understanding what to include.';

  if (modelAnswer) {
    feedback += `\n\nModel answer: ${modelAnswer}`;
  }

  return {
    ok: true,
    correct: false,
    score: 0,
    feedback,
    corrections: [],
    canComplete: false,
    source: 'automatic',
    gradingMode: 'automatic'
  };
}

/**
 * AI semantic grading for freeform fields only. Requires AI enabled in Settings.
 * @param {import('../utils/aiContracts').GradeAnswerRequest} request
 * @returns {Promise<import('../utils/aiContracts').GradeAnswerResult>}
 */
export async function gradeFieldWithAi(request) {
  const answer = String(request.studentAnswer ?? '').trim();

  if (!answer) {
    return {
      ok: true,
      correct: false,
      score: 0,
      feedback: 'Write an answer first, then check again.',
      corrections: [],
      canComplete: false,
      source: 'ai',
      gradingMode: 'ai'
    };
  }

  const gradeAnswer = getGradeApi();
  if (!gradeAnswer) {
    return {
      ok: true,
      correct: answer.length >= 8,
      score: answer.length >= 8 ? 0.7 : 0.2,
      feedback:
        '[Browser fallback] Electron IPC is not available. Run the desktop app for AI grading.',
      corrections: [],
      canComplete: answer.length >= 8,
      source: 'browser-fallback',
      gradingMode: 'ai'
    };
  }

  const result = await gradeAnswer({
    persona: request.persona || 'teacher',
    activityKey: request.activityKey,
    pageId: request.pageId,
    fieldId: request.fieldId,
    prompt: request.prompt,
    studentAnswer: answer,
    rubric: request.rubric,
    modelAnswer: request.modelAnswer,
    language: request.language || 'de',
    requestId: request.requestId
  });

  if (result?.cancelled) {
    return {
      ok: false,
      cancelled: true,
      code: 'ABORTED',
      gradingMode: 'ai'
    };
  }

  if (!result?.ok) {
    return {
      ok: false,
      error: result?.error || 'AI grading failed.',
      code: result?.code,
      gradingMode: 'ai'
    };
  }

  const canComplete = request.requirePass ? result.correct === true : result.correct !== false;

  return { ...result, canComplete, gradingMode: 'ai' };
}

/**
 * Check one field using configured ai.grading mode.
 * @param {import('../utils/aiContracts').GradeAnswerRequest & { aiEnabled?: boolean, aiGrading?: string, requirePass?: boolean }} request
 */
export async function gradeField(request) {
  const mode = resolveGradingMode(request);

  if (mode === 'none' || mode === 'honor') {
    return {
      ok: true,
      correct: false,
      score: 0,
      feedback: 'This field uses honor-system completion — mark the activity complete when you are finished.',
      corrections: [],
      canComplete: !request.requirePass,
      source: 'none',
      gradingMode: mode
    };
  }

  if (mode === 'exact' || mode === 'keywords') {
    return automaticGradeResult({
      studentAnswer: request.studentAnswer,
      acceptedAnswers: request.acceptedAnswers,
      keywords: request.keywords,
      modelAnswer: request.modelAnswer,
      gradingMode: mode
    });
  }

  if (!request.aiEnabled) {
    return {
      ok: true,
      correct: false,
      score: 0,
      feedback:
        'This is a freeform answer — automatic checking is not available. Enable AI in Settings to get AI feedback, or ask the teacher in chat for help.',
      corrections: [],
      canComplete: !request.requirePass,
      source: 'none',
      gradingMode: 'freeform'
    };
  }

  return gradeFieldWithAi(request);
}

/**
 * @param {{
 *   fields: Record<string, { prompt?: string, rubric?: string, modelAnswer?: string, acceptedAnswers?: string[], keywords?: string[], aiGrading?: string, requirePass?: boolean }>,
 *   inputs: Record<string, string>,
 *   activityKey?: string,
 *   pageId?: string,
 *   persona?: string,
 *   aiEnabled?: boolean
 * }} params
 */
export async function gradeSessionFields({
  fields,
  inputs,
  activityKey,
  pageId,
  persona = 'teacher',
  aiEnabled = false,
  requestId
}) {
  const fieldIds = Object.keys(fields);
  const targets = fieldIds.filter((id) => {
    const meta = fields[id] || {};
    const mode = resolveGradingMode(meta);
    if (!isGradableAiMode(mode)) return false;
    return String(inputs[id] ?? '').trim();
  });

  if (targets.length === 0) {
    return {
      byField: {},
      summary: 'Write an answer in at least one gradable field before checking.',
      allCorrect: false
    };
  }

  const byField = {};
  const parts = [];

  for (const fieldId of targets) {
    const meta = fields[fieldId] || {};
    const result = await gradeField({
      persona,
      activityKey,
      pageId,
      fieldId,
      prompt: meta.prompt,
      studentAnswer: inputs[fieldId],
      rubric: meta.rubric,
      modelAnswer: meta.modelAnswer,
      acceptedAnswers: meta.acceptedAnswers,
      keywords: meta.keywords,
      aiGrading: meta.aiGrading,
      requirePass: meta.requirePass,
      aiEnabled,
      requestId
    });

    if (result?.cancelled) {
      return {
        byField,
        summary: 'Answer check cancelled.',
        allCorrect: false,
        cancelled: true
      };
    }

    byField[fieldId] = result;

    if (isGradeSuccess(result)) {
      const label = meta.prompt
        ? meta.prompt.slice(0, 80) + (meta.prompt.length > 80 ? '…' : '')
        : fieldId;
      const modeNote =
        result.gradingMode === 'automatic'
          ? '(automatic check)'
          : result.gradingMode === 'ai'
            ? '(AI check)'
            : '';
      parts.push(`${modeNote} **${label}**\n${formatGradeFeedback(result)}`.trim());
    } else {
      parts.push(formatGradeFeedback(result));
    }
  }

  const allCorrect = targets.every((id) => byField[id]?.correct);

  return {
    byField,
    summary: parts.join('\n\n'),
    allCorrect
  };
}
