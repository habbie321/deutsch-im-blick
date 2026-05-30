import { isChatSuccess } from '../utils/aiContracts';

function getChatApi() {
  return typeof window !== 'undefined' ? window.api : null;
}

function makeRequestId() {
  return `chat-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * @param {import('../utils/aiContracts').ChatRequest} request
 * @returns {Promise<import('../utils/aiContracts').ChatResult>}
 */
export async function sendChatMessage(request) {
  const message = String(request.message ?? '').trim();
  if (!message) {
    return { ok: false, error: 'Message is empty.', code: 'EMPTY_MESSAGE' };
  }

  const api = getChatApi();
  if (!api?.chat) {
    return {
      ok: true,
      content:
        '[Browser fallback] Electron IPC is not available. Run the desktop app to use the mock assistant.',
      source: 'browser-fallback'
    };
  }

  return api.chat({
    persona: request.persona,
    message,
    activityBrief: request.activityBrief,
    peerScenario: request.peerScenario,
    messages: request.messages,
    meta: request.meta
  });
}

/**
 * Stream a chat reply; calls onChunk for each token delta.
 * @param {import('../utils/aiContracts').ChatRequest & {
 *   requestId?: string,
 *   onChunk?: (chunk: string) => void,
 *   signal?: AbortSignal
 * }} request
 */
export async function streamChatMessage(request) {
  const message = String(request.message ?? '').trim();
  if (!message) {
    return { ok: false, error: 'Message is empty.', code: 'EMPTY_MESSAGE' };
  }

  const api = getChatApi();
  if (!api?.chatStream) {
    const fallback = await sendChatMessage(request);
    if (fallback.ok && fallback.content) {
      request.onChunk?.(fallback.content);
    }
    return fallback;
  }

  const requestId = request.requestId || makeRequestId();
  let unsubscribe = null;

  if (request.onChunk && api.onAiStreamChunk) {
    unsubscribe = api.onAiStreamChunk(({ requestId: chunkId, chunk }) => {
      if (chunkId === requestId) {
        request.onChunk(chunk);
      }
    });
  }

  const abortListener = () => {
    api.cancelAiRequest?.(requestId);
  };
  request.signal?.addEventListener('abort', abortListener, { once: true });

  try {
    const result = await api.chatStream({
      requestId,
      persona: request.persona,
      message,
      activityBrief: request.activityBrief,
      peerScenario: request.peerScenario,
      messages: request.messages,
      meta: request.meta
    });

    if (result?.cancelled) {
      return { ok: false, cancelled: true, code: 'ABORTED', requestId };
    }

    return { ...result, requestId };
  } finally {
    unsubscribe?.();
    request.signal?.removeEventListener('abort', abortListener);
  }
}

export function cancelChatRequest(requestId) {
  getChatApi()?.cancelAiRequest?.(requestId);
}

export { isChatSuccess };
