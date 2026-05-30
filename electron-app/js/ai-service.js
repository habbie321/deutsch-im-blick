const { getAiSettingsForService } = require('./ai-settings-store');

function assertAiEnabled() {
  const settings = getAiSettingsForService();
  if (!settings.aiEnabled) {
    const err = new Error('AI assistant is disabled in Settings.');
    err.code = 'AI_DISABLED';
    throw err;
  }
  return settings;
}

function mockGradeAnswer(payload = {}) {
  const answer = String(payload.studentAnswer ?? '').trim();
  const prompt = String(payload.prompt ?? '').trim();
  const hasContent = answer.length >= 8;

  if (!answer) {
    return {
      correct: false,
      score: 0,
      feedback: '[Mock AI] Write an answer first, then check again.',
      corrections: [],
      canComplete: false,
      source: 'mock'
    };
  }

  return {
    correct: hasContent,
    score: hasContent ? 0.78 : 0.25,
    feedback: hasContent
      ? `[Mock AI] Thanks for your answer${prompt ? ` to “${prompt.slice(0, 60)}${prompt.length > 60 ? '…' : ''}”` : ''}. This is mock AI feedback — Phase 3 will use a real model via your local or remote provider.`
      : '[Mock AI] Your answer is very short. Try adding a complete sentence in German.',
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
    content: `[${label}] You said: “${userMessage.slice(0, 240)}${userMessage.length > 240 ? '…' : ''}”\n\nThis is a mock reply through Electron IPC. Connect a local or remote provider in Settings in Phase 3.${briefPreview}`,
    source: 'mock'
  };
}

function providerNotReady(provider) {
  throw Object.assign(
    new Error(`Provider “${provider}” is not implemented yet (Phase 3).`),
    { code: 'PROVIDER_NOT_READY' }
  );
}

/** AI semantic grading only — automatic/rule-based grading runs in the renderer. */
async function gradeAnswer(payload) {
  assertAiEnabled();
  const settings = getAiSettingsForService();

  switch (settings.provider) {
    case 'mock':
      return mockGradeAnswer(payload);
    case 'local':
    case 'remote':
      return providerNotReady(settings.provider);
    default:
      return mockGradeAnswer(payload);
  }
}

async function chat(payload) {
  assertAiEnabled();
  const settings = getAiSettingsForService();

  switch (settings.provider) {
    case 'mock':
      return mockChat(payload);
    case 'local':
    case 'remote':
      return providerNotReady(settings.provider);
    default:
      return mockChat(payload);
  }
}

module.exports = {
  gradeAnswer,
  chat
};
