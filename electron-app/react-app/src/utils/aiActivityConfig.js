/** @typedef {'exact' | 'keywords' | 'semantic' | 'honor' | 'none'} AiGradingMode */

/** @typedef {{ role?: string, opening?: string }} PeerScenario */

/**
 * @typedef {Object} AiConfig
 * @property {AiGradingMode} grading
 * @property {boolean} requirePass
 * @property {string} [rubric]
 * @property {number|null} [allowHints]
 * @property {PeerScenario|null} [peerScenario]
 */

export const AI_GRADING_MODES = ['exact', 'keywords', 'semantic', 'honor', 'none'];

export const DEFAULT_AI = {
  grading: 'semantic',
  requirePass: false,
  rubric: '',
  allowHints: null,
  peerScenario: null
};

/**
 * @param {Partial<AiConfig>|null|undefined} base
 * @param {Partial<AiConfig>|null|undefined} override
 * @returns {AiConfig}
 */
export function mergeAiConfig(base, override) {
  const merged = {
    ...DEFAULT_AI,
    ...(base || {}),
    ...(override || {})
  };

  const basePeer = base?.peerScenario;
  const overridePeer = override?.peerScenario;
  if (basePeer || overridePeer) {
    merged.peerScenario = { ...(basePeer || {}), ...(overridePeer || {}) };
  } else {
    merged.peerScenario = null;
  }

  if (merged.rubric == null) merged.rubric = '';
  if (merged.allowHints == null) merged.allowHints = null;

  return merged;
}

/**
 * @param {string} type — page type
 * @param {object} [page]
 * @returns {AiConfig}
 */
export function defaultAiForPageType(type, page = {}) {
  switch (type) {
    case 'writing':
      return mergeAiConfig(null, { grading: 'semantic', requirePass: false });
    case 'reading_self_check': {
      const hasKeys = (page.readingItems || []).some(
        (it) => it?.acceptedAnswers?.length || it?.keywords?.length
      );
      return mergeAiConfig(null, {
        grading: hasKeys ? 'keywords' : 'semantic',
        requirePass: false
      });
    }
    case 'prompt':
      return mergeAiConfig(null, { grading: 'honor', requirePass: false });
    case 'multiple_choice':
    case 'matching_activity':
    case 'classification_grid':
      return mergeAiConfig(null, { grading: 'none', requirePass: false });
    case 'workbook':
    case 'cloze':
      return mergeAiConfig(null, { grading: 'semantic', requirePass: false });
    default:
      return { ...DEFAULT_AI };
  }
}

/**
 * @param {object} envelope
 * @param {object} page
 * @returns {AiConfig}
 */
export function resolvePageAi(envelope, page) {
  const defaults = defaultAiForPageType(page?.type, page);
  return mergeAiConfig(mergeAiConfig(defaults, envelope?.ai), page?.ai);
}

/**
 * @param {AiConfig} pageAi
 * @param {object} item
 * @returns {AiConfig}
 */
export function resolveReadingItemAi(pageAi, item) {
  return mergeAiConfig(pageAi, item?.ai);
}

/**
 * @param {AiConfig} pageAi
 * @param {string|object} task
 * @returns {AiConfig}
 */
export function resolveWritingTaskAi(pageAi, task) {
  const taskObj = typeof task === 'object' && task !== null ? task : {};
  return mergeAiConfig(pageAi, taskObj.ai);
}

/** @param {AiGradingMode|string|undefined} mode */
export function isGradableAiMode(mode) {
  return mode !== 'none' && mode !== 'honor';
}
