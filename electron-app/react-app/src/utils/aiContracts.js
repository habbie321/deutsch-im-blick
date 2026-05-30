/** @typedef {'teacher'|'peer'|'off'} Persona */

/**
 * @typedef {Object} GradeAnswerRequest
 * @property {Persona} [persona]
 * @property {string} [activityKey]
 * @property {string} [pageId]
 * @property {string} fieldId
 * @property {string} [prompt]
 * @property {string} studentAnswer
 * @property {string} [rubric]
 * @property {string} [modelAnswer]
 * @property {string[]} [acceptedAnswers]
 * @property {string[]} [keywords]
 * @property {string} [language]
 */

/**
 * @typedef {Object} GradeAnswerResult
 * @property {boolean} ok
 * @property {boolean} [correct]
 * @property {number} [score]
 * @property {string} [feedback]
 * @property {{ original: string, suggested: string }[]} [corrections]
 * @property {boolean} [canComplete]
 * @property {string} [source]
 * @property {'automatic'|'ai'|'freeform'} [gradingMode]
 * @property {string} [error]
 * @property {string} [code]
 */

/**
 * @typedef {Object} ChatMessageMeta
 * @property {string} [activityKey]
 * @property {string} [pageId]
 * @property {string} [fieldId]
 */

/**
 * @typedef {Object} ChatTurn
 * @property {'user'|'assistant'|'system'} role
 * @property {string} content
 * @property {ChatMessageMeta} [meta]
 */

/**
 * @typedef {Object} ChatRequest
 * @property {Persona} persona
 * @property {string} message
 * @property {string} [activityBrief]
 * @property {{ role?: string, opening?: string }} [peerScenario]
 * @property {ChatTurn[]} [messages]
 * @property {ChatMessageMeta} [meta]
 */

/**
 * @typedef {Object} ChatResult
 * @property {boolean} ok
 * @property {string} [content]
 * @property {string} [source]
 * @property {string} [error]
 * @property {string} [code]
 */

/**
 * @typedef {Object} AiSettings
 * @property {boolean} aiEnabled
 * @property {'mock'|'local'|'remote'} provider
 * @property {string} model
 * @property {string} baseUrl
 * @property {boolean} enableRemote
 * @property {boolean} hasApiKey
 */

export const AI_PROVIDERS = [
  { id: 'mock', label: 'Mock (development)' },
  { id: 'local', label: 'Local model' },
  { id: 'remote', label: 'Remote model' }
];

export const DEFAULT_AI_SETTINGS = {
  aiEnabled: true,
  provider: 'mock',
  model: '',
  baseUrl: 'http://localhost:11434',
  enableRemote: false,
  hasApiKey: false
};

/** @param {unknown} result */
export function isGradeSuccess(result) {
  return Boolean(result && typeof result === 'object' && result.ok && result.feedback != null);
}

/** @param {unknown} result */
export function isChatSuccess(result) {
  return Boolean(result && typeof result === 'object' && result.ok && result.content);
}

/** @param {GradeAnswerResult} result */
export function formatGradeFeedback(result) {
  if (!result?.ok) {
    return result?.error || 'Could not grade your answer.';
  }

  let text = result.feedback || '';
  if (result.corrections?.length) {
    const lines = result.corrections.map(
      (c) => `• ${c.original} → ${c.suggested}`
    );
    text = `${text}\n\nSuggestions:\n${lines.join('\n')}`;
  }
  if (typeof result.score === 'number') {
    text = `${text}\n\nScore: ${Math.round(result.score * 100)}%`;
  }
  return text.trim();
}
