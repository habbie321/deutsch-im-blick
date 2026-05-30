const DEFAULT_LOCAL_MODEL = 'llama3.2';
const DEFAULT_REMOTE_MODEL = 'gpt-4o-mini';
const DEFAULT_REMOTE_BASE = 'https://api.openai.com/v1';
const REQUEST_TIMEOUT_MS = 90_000;

function resolveModel(settings, provider) {
  const trimmed = String(settings.model ?? '').trim();
  if (trimmed) return trimmed;
  if (provider === 'local') return DEFAULT_LOCAL_MODEL;
  if (provider === 'remote') return DEFAULT_REMOTE_MODEL;
  return '';
}

function resolveRemoteBaseUrl(settings) {
  const url = String(settings.baseUrl ?? '').trim().replace(/\/+$/, '');
  if (url && !url.includes('11434')) return url;
  return DEFAULT_REMOTE_BASE;
}

function resolveLocalBaseUrl(settings) {
  const url = String(settings.baseUrl ?? '').trim().replace(/\/+$/, '');
  return url || 'http://localhost:11434';
}

function providerError(message, code, cause) {
  const err = new Error(message);
  err.code = code;
  if (cause) err.cause = cause;
  return err;
}

function mapHttpError(status, bodyText) {
  const lower = bodyText.toLowerCase();
  if (status === 429 || lower.includes('rate limit')) {
    return providerError('The model provider rate-limited this request. Wait a moment and try again.', 'RATE_LIMIT');
  }
  if (status === 401 || status === 403) {
    return providerError('Authentication failed. Check your API key in Settings.', 'AUTH_ERROR');
  }
  if (status === 404) {
    return providerError('Model or endpoint not found. Check the model name and base URL in Settings.', 'NOT_FOUND');
  }
  const preview = bodyText.slice(0, 200);
  return providerError(
    `Provider request failed (${status})${preview ? `: ${preview}` : '.'}`,
    'PROVIDER_ERROR'
  );
}

async function fetchWithTimeout(url, options, timeoutMs = REQUEST_TIMEOUT_MS, externalSignal) {
  const controller = new AbortController();
  const onExternalAbort = () => controller.abort();
  if (externalSignal) {
    if (externalSignal.aborted) {
      controller.abort();
    } else {
      externalSignal.addEventListener('abort', onExternalAbort, { once: true });
    }
  }
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (err) {
    if (err.name === 'AbortError') {
      if (externalSignal?.aborted) {
        throw providerError('Request cancelled.', 'ABORTED');
      }
      throw providerError('The model took too long to respond. Try again or use a smaller model.', 'TIMEOUT');
    }
    throw providerError(
      `Could not reach the model server: ${err.message}`,
      'NETWORK_ERROR',
      err
    );
  } finally {
    clearTimeout(timer);
    if (externalSignal) {
      externalSignal.removeEventListener('abort', onExternalAbort);
    }
  }
}

function extractAssistantText(data) {
  if (!data) return '';
  if (typeof data.message?.content === 'string') return data.message.content;
  if (typeof data.response === 'string') return data.response;
  const choice = data.choices?.[0];
  if (typeof choice?.message?.content === 'string') return choice.message.content;
  if (typeof choice?.text === 'string') return choice.text;
  return '';
}

function stripJsonFence(text) {
  const raw = String(text ?? '').trim();
  const fenced = raw.match(/^```(?:json)?\s*([\s\S]*?)```$/i);
  if (fenced) return fenced[1].trim();
  const inline = raw.match(/```json\s*([\s\S]*?)```/i);
  if (inline) return inline[1].trim();
  return raw;
}

function parseGradeJson(text) {
  const cleaned = stripJsonFence(text);
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1));
      } catch {
        /* fall through */
      }
    }
    throw providerError(
      'The model returned an invalid grading response. Try again or switch provider.',
      'INVALID_JSON'
    );
  }
}

function normalizeGradePayload(parsed) {
  const scoreRaw = Number(parsed.score);
  const score = Number.isFinite(scoreRaw) ? Math.min(1, Math.max(0, scoreRaw)) : 0;
  const correct = Boolean(parsed.correct);
  const feedback = String(parsed.feedback ?? '').trim() || 'No feedback returned.';
  const corrections = Array.isArray(parsed.corrections)
    ? parsed.corrections
        .filter((c) => c && (c.original || c.suggested))
        .map((c) => ({
          original: String(c.original ?? ''),
          suggested: String(c.suggested ?? '')
        }))
    : [];
  const canComplete =
    typeof parsed.canComplete === 'boolean' ? parsed.canComplete : correct && score >= 0.7;

  return {
    correct,
    score,
    feedback,
    corrections,
    canComplete
  };
}

async function readOllamaStream(res, onChunk) {
  const reader = res.body?.getReader();
  if (!reader) {
    throw providerError('Streaming is not supported by the local model server.', 'PROVIDER_ERROR');
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let full = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      let data;
      try {
        data = JSON.parse(trimmed);
      } catch {
        continue;
      }
      const delta = data.message?.content;
      if (delta) {
        full += delta;
        onChunk?.(delta);
      }
    }
  }

  return full.trim();
}

async function readOpenAiStream(res, onChunk) {
  const reader = res.body?.getReader();
  if (!reader) {
    throw providerError('Streaming is not supported by the remote model API.', 'PROVIDER_ERROR');
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let full = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const payload = trimmed.slice(5).trim();
      if (payload === '[DONE]') continue;
      let data;
      try {
        data = JSON.parse(payload);
      } catch {
        continue;
      }
      const delta = data.choices?.[0]?.delta?.content;
      if (delta) {
        full += delta;
        onChunk?.(delta);
      }
    }
  }

  return full.trim();
}

async function callOllamaChat(settings, messages, { jsonMode = false, stream = false, onChunk, signal } = {}) {
  const model = resolveModel(settings, 'local');
  const baseUrl = resolveLocalBaseUrl(settings);
  const body = {
    model,
    messages,
    stream
  };
  if (jsonMode) body.format = 'json';

  const res = await fetchWithTimeout(
    `${baseUrl}/api/chat`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    },
    REQUEST_TIMEOUT_MS,
    signal
  );

  if (!res.ok) {
    const text = await res.text();
    throw mapHttpError(res.status, text);
  }

  if (!stream) {
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw providerError('Invalid response from local model server.', 'PROVIDER_ERROR');
    }
    return extractAssistantText(data);
  }

  return readOllamaStream(res, onChunk);
}

async function callOpenAiCompatibleChat(
  settings,
  messages,
  { jsonMode = false, stream = false, onChunk, signal } = {}
) {
  const model = resolveModel(settings, 'remote');
  const baseUrl = resolveRemoteBaseUrl(settings);
  const apiKey = String(settings.apiKey ?? '').trim();
  if (!apiKey) {
    throw providerError('Remote provider requires an API key in Settings.', 'MISSING_API_KEY');
  }

  const body = {
    model,
    messages,
    temperature: 0.3,
    stream
  };
  if (jsonMode) body.response_format = { type: 'json_object' };

  const res = await fetchWithTimeout(
    `${baseUrl}/chat/completions`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(body)
    },
    REQUEST_TIMEOUT_MS,
    signal
  );

  if (!res.ok) {
    const text = await res.text();
    throw mapHttpError(res.status, text);
  }

  if (!stream) {
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw providerError('Invalid response from remote model API.', 'PROVIDER_ERROR');
    }
    return extractAssistantText(data);
  }

  return readOpenAiStream(res, onChunk);
}

async function completeChat(settings, provider, messages, options = {}) {
  if (provider === 'local') {
    return callOllamaChat(settings, messages, options);
  }
  if (provider === 'remote') {
    return callOpenAiCompatibleChat(settings, messages, options);
  }
  throw providerError(`Unknown provider: ${provider}`, 'PROVIDER_ERROR');
}

async function gradeWithProvider(settings, provider, payload, options = {}) {
  const { buildGradeMessages } = require('./ai-prompts');
  const messages = buildGradeMessages(payload);
  const raw = await completeChat(settings, provider, messages, { jsonMode: true, ...options });
  const parsed = parseGradeJson(raw);
  return normalizeGradePayload(parsed);
}

async function chatWithProvider(settings, provider, payload, options = {}) {
  const { buildChatMessages } = require('./ai-prompts');
  const messages = buildChatMessages(payload);
  const content = await completeChat(settings, provider, messages, { jsonMode: false, ...options });
  if (!String(content).trim()) {
    throw providerError('The model returned an empty reply.', 'PROVIDER_ERROR');
  }
  return { content: String(content).trim() };
}

module.exports = {
  DEFAULT_LOCAL_MODEL,
  DEFAULT_REMOTE_MODEL,
  gradeWithProvider,
  chatWithProvider,
  resolveModel,
  parseGradeJson,
  normalizeGradePayload,
  providerError
};
