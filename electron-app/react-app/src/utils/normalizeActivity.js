/**
 * Activity shape: envelope + pages[] (exercises), or text (blurbs).
 * Top-level `type` is not used — infer from `pages` vs `text`.
 */

import { resolvePageAi } from './aiActivityConfig';

export const ENVELOPE_KEYS = new Set([
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
  'links',
  'pdfNote',
  'mediaCards',
  'pages',
  'ai'
]);

export const PAGE_TYPES = new Set([
  'multiple_choice',
  'matching_activity',
  'reading_self_check',
  'workbook',
  'prompt',
  'writing',
  'classification_grid',
  'cloze'
]);

/** @deprecated Legacy build scripts may still emit leaf types at the envelope. */
export const LEAF_ACTIVITY_TYPES = PAGE_TYPES;

/**
 * @param {object} activity
 * @returns {boolean}
 */
export function isBlurb(activity) {
  return Boolean(
    activity &&
    typeof activity.text === 'string' &&
    activity.text.trim().length > 0 &&
    !activity.pages?.length
  );
}

/**
 * @param {object} activity
 * @returns {boolean}
 */
export function isExercise(activity) {
  return Boolean(activity?.pages?.length);
}

function stripEnvelopeType(activity) {
  if (!activity || typeof activity !== 'object' || !('type' in activity)) {
    return activity;
  }
  const { type, ...rest } = activity;
  return rest;
}

/**
 * @param {object} activity
 * @returns {object}
 */
export function normalizeActivity(activity) {
  if (!activity || typeof activity !== 'object') {
    return activity;
  }

  if (isBlurb(activity)) {
    return stripEnvelopeType(activity);
  }

  if (isExercise(activity)) {
    return stripEnvelopeType(activity);
  }

  if (activity.type && PAGE_TYPES.has(activity.type)) {
    const leafType = activity.type;
    const envelope = {};
    const pagePayload = {};

    for (const [key, value] of Object.entries(activity)) {
      if (ENVELOPE_KEYS.has(key) && key !== 'type') {
        envelope[key] = value;
      } else if (key !== 'type') {
        pagePayload[key] = value;
      }
    }

    return {
      ...envelope,
      pages: [
        {
          id: 'main',
          type: leafType,
          ...pagePayload
        }
      ]
    };
  }

  return stripEnvelopeType(activity);
}

/**
 * @param {object[]} activities
 * @returns {object[]}
 */
export function normalizeActivities(activities) {
  return (activities || []).map(normalizeActivity);
}

/**
 * Merge envelope fields into a page for rendering (shared intro, media, etc.).
 * @param {object} activityData — exercise envelope with pages[]
 * @param {object} page
 * @returns {object}
 */
export function mergePageActivity(activityData, page) {
  if (!page) return null;

  const pages = activityData?.pages || [];
  const singlePage = pages.length === 1;

  return {
    ...page,
    chapter: activityData.chapter,
    title: page.title ?? (singlePage ? activityData.title : undefined),
    intro: page.intro ?? activityData.intro,
    links: page.links ?? activityData.links,
    pdfNote: page.pdfNote ?? activityData.pdfNote,
    mediaCards: page.mediaCards?.length ? page.mediaCards : activityData.mediaCards || [],
    ai: resolvePageAi(activityData, page)
  };
}
