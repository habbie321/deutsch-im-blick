import { resolvePageAi } from './aiActivityConfig';

/** Minimum user messages in peer thread before partner activity can be marked complete. */
export const MIN_PEER_USER_MESSAGES = 2;

export function getCurrentPage(activity, currentPageId) {
  if (!activity?.pages?.length) return null;
  return activity.pages.find((p) => p.id === currentPageId) ?? activity.pages[0];
}

/**
 * Resolved peer scenario for the active page, or null when none configured.
 * Accepts either a full activity envelope or a merged single-page activity object.
 * @param {object} activity
 * @param {string|null} currentPageId
 */
export function getPagePeerScenario(activity, currentPageId) {
  if (!activity) return null;

  const directScenario = activity.ai?.peerScenario;
  const directOpening = directScenario?.opening?.trim();
  if (directOpening) {
    return {
      role: directScenario.role?.trim() || 'classmate',
      opening: directOpening,
      pageAi: activity.ai,
      pageId: activity.id ?? currentPageId ?? 'main'
    };
  }

  const page = getCurrentPage(activity, currentPageId);
  if (!page) return null;

  const pageAi = resolvePageAi(activity, page);
  const scenario = pageAi?.peerScenario;
  const opening = scenario?.opening?.trim();
  if (!opening) return null;

  return {
    role: scenario.role?.trim() || 'classmate',
    opening,
    pageAi,
    pageId: page.id
  };
}

/**
 * @param {Array<{ role?: string, meta?: { activityKey?: string, pageId?: string } }>} thread
 * @param {string} activityKey
 * @param {string} [pageId]
 */
export function hasPeerOpeningForActivity(thread, activityKey, pageId) {
  return (thread ?? []).some((msg) => {
    if (msg.role !== 'assistant' || msg.meta?.activityKey !== activityKey) return false;
    if (pageId && msg.meta?.pageId && msg.meta.pageId !== pageId) return false;
    return true;
  });
}

/**
 * @param {Array<{ role?: string, meta?: { activityKey?: string } }>} thread
 * @param {string} activityKey
 */
export function countPeerUserMessages(thread, activityKey) {
  return (thread ?? []).filter(
    (msg) => msg.role === 'user' && msg.meta?.activityKey === activityKey
  ).length;
}

export function peerSummaryFieldId(pageId) {
  return `peer_summary_${pageId || 'main'}`;
}
