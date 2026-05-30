const { getAiSettingsForService } = require('./ai-settings-store');
const { gradeWithProvider, chatWithProvider, providerError } = require('./ai-providers');
const { logAiEvent } = require('./ai-logger');

/** @type {Map<string, AbortController>} */
const activeRequests = new Map();

function makeRequestId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function registerRequest(requestId) {
  const id = requestId || makeRequestId('ai');
  const controller = new AbortController();
  activeRequests.set(id, controller);
  return { id, signal: controller.signal };
}

function releaseRequest(requestId) {
  if (requestId) activeRequests.delete(requestId);
}

function cancelRequest(requestId) {
  const controller = activeRequests.get(requestId);
  if (controller) {
    controller.abort();
    return true;
  }
  return false;
}

function assertAiEnabled() {
  const settings = getAiSettingsForService();
  if (!settings.aiEnabled) {
    const err = new Error('AI assistant is disabled in Settings.');
    err.code = 'AI_DISABLED';
    throw err;
  }
  return settings;
}

function assertRemoteAllowed(settings) {
  if (!settings.enableRemote) {
    const err = new Error('Remote model calls are disabled. Enable them in Settings.');
    err.code = 'REMOTE_DISABLED';
    throw err;
  }
  if (!String(settings.apiKey ?? '').trim()) {
    const err = new Error('Remote provider requires an API key in Settings.');
    err.code = 'MISSING_API_KEY';
    throw err;
  }
}

function mockGradeAnswer(payload = {}) {
  const answer = String(payload.studentAnswer ?? '').trim();
  const prompt = String(payload.prompt ?? '').trim();
  const hasContent = answer.length >= 8;

  if (!answer) {
    return {
      correct: false,
      score: 0,
      feedback: '[Mock] Write an answer first, then check again.',
      corrections: [],
      canComplete: false,
      source: 'mock'
    };
  }

  return {
    correct: hasContent,
    score: hasContent ? 0.78 : 0.25,
    feedback: hasContent
      ? `[Mock] Thanks for your answer${prompt ? ` to “${prompt.slice(0, 60)}${prompt.length > 60 ? '…' : ''}”` : ''}. Switch to Local or Remote provider in Settings for real AI feedback.`
      : '[Mock] Your answer is very short. Try adding a complete sentence.',
    corrections: hasContent
      ? []
      : [{ original: answer, suggested: '(Expand into a full sentence.)' }],
    canComplete: hasContent,
    source: 'mock'
  };
}

function mockChat(payload = {}) {
  const persona = payload.persona === 'peer' ? 'peer' : 'teacher';
  const label = persona === 'peer' ? 'Mock peer' : 'Mock teacher';
  const userMessage = String(payload.message ?? '').trim();
  const brief = String(payload.activityBrief ?? '').trim();
  const role = payload.peerScenario?.role;
  const briefPreview = brief
    ? `\n\n(Current activity context)\n${brief.split('\n').slice(0, 6).join('\n')}`
    : '';

  const peerLead = persona === 'peer' && role
    ? `[${label} as ${role}] `
    : `[${label}] `;

  return {
    content: `${peerLead}You said: “${userMessage.slice(0, 240)}${userMessage.length > 240 ? '…' : ''}”\n\nThis is a mock reply. Choose Local or Remote provider in Settings for a real assistant.${briefPreview}`,
    source: 'mock'
  };
}

async function mockChatStream(payload, { onChunk, signal } = {}) {
  const result = mockChat(payload);
  const parts = result.content.match(/\S+\s*|\s+/g) || [result.content];
  let full = '';

  for (const part of parts) {
    if (signal?.aborted) {
      throw providerError('Request cancelled.', 'ABORTED');
    }
    full += part;
    onChunk?.(part);
    await new Promise((resolve) => setTimeout(resolve, 16));
  }

  return { content: full.trim(), source: 'mock' };
}

async function runWithProvider(settings, fn) {
  const provider = settings.provider || 'mock';

  if (provider === 'mock') {
    return null;
  }
  if (provider === 'remote') {
    assertRemoteAllowed(settings);
  }
  if (provider !== 'local' && provider !== 'remote') {
    return null;
  }

  return fn(provider);
}

function logRequestMeta(event, settings, payload, extra = {}) {
  logAiEvent(event, {
    provider: settings.provider,
    activityKey: payload?.activityKey || payload?.meta?.activityKey || null,
    pageId: payload?.pageId || payload?.meta?.pageId || null,
    fieldId: payload?.fieldId || null,
    persona: payload?.persona || null,
    ...extra
  });
}

/** AI semantic grading only — automatic/rule-based grading runs in the renderer. */
async function gradeAnswer(payload, { requestId } = {}) {
  const settings = assertAiEnabled();
  const slot = registerRequest(requestId);
  const started = Date.now();

  try {
    const real = await runWithProvider(settings, (provider) =>
      gradeWithProvider(settings, provider, payload, { signal: slot.signal })
    );

    const result = real ? { ...real, source: settings.provider } : mockGradeAnswer(payload);
    logRequestMeta('grade_complete', settings, payload, {
      requestId: slot.id,
      durationMs: Date.now() - started,
      source: result.source,
      cancelled: false
    });
    return result;
  } catch (err) {
    if (err.code === 'ABORTED') {
      logRequestMeta('grade_cancelled', settings, payload, {
        requestId: slot.id,
        durationMs: Date.now() - started
      });
      throw err;
    }
    logRequestMeta('grade_error', settings, payload, {
      requestId: slot.id,
      durationMs: Date.now() - started,
      code: err.code || 'GRADE_ERROR'
    });
    throw err;
  } finally {
    releaseRequest(slot.id);
  }
}

async function chat(payload) {
  const settings = assertAiEnabled();
  const started = Date.now();

  const mockResult = mockChat(payload);
  const real = await runWithProvider(settings, (provider) =>
    chatWithProvider(settings, provider, payload)
  );

  const result = real ? { ...real, source: settings.provider } : mockResult;
  logRequestMeta('chat_complete', settings, payload, {
    durationMs: Date.now() - started,
    source: result.source
  });
  return result;
}

async function chatStream(payload, { requestId, onChunk, signal } = {}) {
  const settings = assertAiEnabled();
  const slot = registerRequest(requestId);
  const started = Date.now();

  try {
    const real = await runWithProvider(settings, (provider) =>
      chatWithProvider(settings, provider, payload, {
        stream: true,
        onChunk,
        signal: slot.signal
      })
    );

    if (real) {
      const result = { ...real, source: settings.provider };
      logRequestMeta('chat_stream_complete', settings, payload, {
        requestId: slot.id,
        durationMs: Date.now() - started,
        source: result.source
      });
      return result;
    }

    const mockResult = await mockChatStream(payload, { onChunk, signal: slot.signal });
    logRequestMeta('chat_stream_complete', settings, payload, {
      requestId: slot.id,
      durationMs: Date.now() - started,
      source: mockResult.source
    });
    return mockResult;
  } catch (err) {
    if (err.code === 'ABORTED') {
      logRequestMeta('chat_stream_cancelled', settings, payload, {
        requestId: slot.id,
        durationMs: Date.now() - started
      });
      throw err;
    }
    logRequestMeta('chat_stream_error', settings, payload, {
      requestId: slot.id,
      durationMs: Date.now() - started,
      code: err.code || 'CHAT_ERROR'
    });
    throw err;
  } finally {
    releaseRequest(slot.id);
  }
}

module.exports = {
  gradeAnswer,
  chat,
  chatStream,
  cancelRequest,
  makeRequestId
};
