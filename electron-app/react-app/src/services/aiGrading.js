import { checkAutomaticAnswer, hasAutomaticKeys } from '../utils/answerMatch';
import { formatGradeFeedback, isGradeSuccess } from '../utils/aiContracts';

function getGradeApi() {
  return typeof window !== 'undefined' ? window.api?.gradeAnswer : null;
}

function automaticGradeResult({ studentAnswer, acceptedAnswers, keywords, modelAnswer }) {
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

  const pass = checkAutomaticAnswer(answer, { acceptedAnswers, keywords });

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
    acceptedAnswers?.length
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
    language: request.language || 'de'
  });

  if (!result?.ok) {
    return {
      ok: false,
      error: result?.error || 'AI grading failed.',
      code: result?.code,
      gradingMode: 'ai'
    };
  }

  return { ...result, gradingMode: 'ai' };
}

/**
 * Check one field: JSON keys first, else AI if enabled, else freeform message.
 * @param {import('../utils/aiContracts').GradeAnswerRequest & { aiEnabled?: boolean }} request
 */
export async function gradeField(request) {
  const fieldMeta = {
    acceptedAnswers: request.acceptedAnswers,
    keywords: request.keywords
  };

  if (hasAutomaticKeys(fieldMeta)) {
    return automaticGradeResult({
      studentAnswer: request.studentAnswer,
      acceptedAnswers: request.acceptedAnswers,
      keywords: request.keywords,
      modelAnswer: request.modelAnswer
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
      canComplete: false,
      source: 'none',
      gradingMode: 'freeform'
    };
  }

  return gradeFieldWithAi(request);
}

/**
 * @param {{
 *   fields: Record<string, { prompt?: string, rubric?: string, modelAnswer?: string, acceptedAnswers?: string[], keywords?: string[] }>,
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
  aiEnabled = false
}) {
  const fieldIds = Object.keys(fields);
  const targets = fieldIds.filter((id) => String(inputs[id] ?? '').trim());

  if (targets.length === 0) {
    return {
      byField: {},
      summary: 'Write an answer in at least one field before checking.',
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
      aiEnabled
    });

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
