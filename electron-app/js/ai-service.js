const { getAiSettingsForService } = require('./ai-settings-store');
const { gradeWithProvider, chatWithProvider } = require('./ai-providers');

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
  const briefPreview = brief
    ? `\n\n(Current activity context)\n${brief.split('\n').slice(0, 6).join('\n')}`
    : '';

  return {
    content: `[${label}] You said: “${userMessage.slice(0, 240)}${userMessage.length > 240 ? '…' : ''}”\n\nThis is a mock reply. Choose Local or Remote provider in Settings for a real assistant.${briefPreview}`,
    source: 'mock'
  };
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

/** AI semantic grading only — automatic/rule-based grading runs in the renderer. */
async function gradeAnswer(payload) {
  const settings = assertAiEnabled();

  const mockResult = mockGradeAnswer(payload);
  const real = await runWithProvider(settings, (provider) =>
    gradeWithProvider(settings, provider, payload)
  );

  if (real) {
    return { ...real, source: settings.provider };
  }

  return mockResult;
}

async function chat(payload) {
  const settings = assertAiEnabled();

  const mockResult = mockChat(payload);
  const real = await runWithProvider(settings, (provider) =>
    chatWithProvider(settings, provider, payload)
  );

  if (real) {
    return { ...real, source: settings.provider };
  }

  return mockResult;
}

module.exports = {
  gradeAnswer,
  chat
};
