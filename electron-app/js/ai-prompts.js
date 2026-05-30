const GRADE_JSON_SCHEMA = `{
  "correct": boolean,
  "score": number between 0 and 1,
  "feedback": string (concise, encouraging, in English unless the exercise asks for German),
  "corrections": [{ "original": string, "suggested": string }],
  "canComplete": boolean
}`;

const TEACHER_SYSTEM = `You are a supportive German language instructor helping a university-level learner using the Deutsch im Blick textbook.

Guidelines:
- Be concise and encouraging; explain grammar or vocabulary briefly when relevant.
- For grading, respond ONLY with valid JSON matching the required schema — no markdown fences or extra text.
- Accept reasonable paraphrases; focus on meaning and key facts, not word-for-word matching.
- When a model answer is provided, use it as the reference standard but allow equivalent wording.
- Suggest concrete improvements in corrections when the student made errors.`;

const PEER_SYSTEM = `You are a friendly German conversation partner (peer mode) for a university-level learner.

Guidelines:
- Keep replies short and conversational; use German when appropriate for practice, but explain in English if the student seems stuck.
- Do not lecture at length — prompt the student to speak or write more.
- You are not the official grader; give hints and practice, not final scores.`;

function buildGradeUserPrompt(payload = {}) {
  const lines = ['Grade the student answer for this exercise field.', ''];

  if (payload.prompt) {
    lines.push(`Question / prompt:\n${payload.prompt}`, '');
  }
  if (payload.rubric) {
    lines.push(`Rubric:\n${payload.rubric}`, '');
  }
  if (payload.modelAnswer) {
    lines.push(`Model answer (reference):\n${payload.modelAnswer}`, '');
  }
  if (payload.language) {
    lines.push(`Expected response language hint: ${payload.language}`, '');
  }

  lines.push(`Student answer:\n${payload.studentAnswer ?? ''}`, '');
  lines.push(
    'Respond with JSON only:',
    GRADE_JSON_SCHEMA,
    '',
    'Set canComplete to true only when the answer is substantially correct (score >= 0.7).'
  );

  return lines.join('\n');
}

function buildChatSystemPrompt(persona, activityBrief) {
  const base = persona === 'peer' ? PEER_SYSTEM : TEACHER_SYSTEM;
  const brief = String(activityBrief ?? '').trim();
  if (!brief) return base;
  return `${base}\n\n--- Current activity context ---\n${brief}`;
}

function buildGradeMessages(payload = {}) {
  return [
    { role: 'system', content: TEACHER_SYSTEM },
    { role: 'user', content: buildGradeUserPrompt(payload) }
  ];
}

function buildChatMessages(payload = {}) {
  const persona = payload.persona === 'peer' ? 'peer' : 'teacher';
  const system = buildChatSystemPrompt(persona, payload.activityBrief);
  const history = Array.isArray(payload.messages) ? payload.messages : [];
  const turns = history
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && m.content)
    .slice(-12)
    .map((m) => ({ role: m.role, content: String(m.content) }));

  const userMessage = String(payload.message ?? '').trim();
  const messages = [{ role: 'system', content: system }, ...turns];
  if (userMessage) {
    messages.push({ role: 'user', content: userMessage });
  }
  return messages;
}

module.exports = {
  GRADE_JSON_SCHEMA,
  TEACHER_SYSTEM,
  PEER_SYSTEM,
  buildGradeUserPrompt,
  buildGradeMessages,
  buildChatMessages
};
