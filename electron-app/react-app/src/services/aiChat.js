import { isChatSuccess } from '../utils/aiContracts';

function getChatApi() {
  return typeof window !== 'undefined' ? window.api?.chat : null;
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

  const chat = getChatApi();
  if (!chat) {
    return {
      ok: true,
      content:
        '[Browser fallback] Electron IPC is not available. Run the desktop app to use the mock assistant.',
      source: 'browser-fallback'
    };
  }

  return chat({
    persona: request.persona,
    message,
    activityBrief: request.activityBrief,
    messages: request.messages,
    meta: request.meta
  });
}

export { isChatSuccess };
