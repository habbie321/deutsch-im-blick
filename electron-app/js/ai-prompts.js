const GRADE_JSON_SCHEMA = `{
  "correct": boolean,
  "score": number between 0 and 1,
  "feedback": string (concise, encouraging, in English unless the exercise asks for German),
  "corrections": [{ "original": string, "suggested": string }],
  "canComplete": boolean
}`;

/** Chat (Send) — conversational plain text, not JSON. */
const TEACHER_CHAT_SYSTEM = `You are a supportive German language instructor helping a university-level learner using the Deutsch im Blick textbook.

Guidelines:
- Be concise and encouraging; explain grammar or vocabulary briefly when relevant.
- Answer in plain text (not JSON). Use German examples when helpful; explain in English if the student is stuck.
- Help with the current activity when context is provided, but do not simply give away full exercise answers unless the student has tried first.
- Suggest concrete improvements when the student shares their writing.`;

/** Grading (Check my answer) — structured JSON for the app to parse. */
const TEACHER_GRADE_SYSTEM = `You are a supportive German language instructor grading a student exercise answer.

Guidelines:
- Respond ONLY with valid JSON matching the required schema — no markdown fences or extra text.
- Accept reasonable paraphrases; focus on meaning and key facts, not word-for-word matching.
- When a model answer is provided, use it as the reference standard but allow equivalent wording.
- Suggest concrete improvements in corrections when the student made errors.`;

const PEER_SYSTEM = `You are a friendly German conversation partner (peer mode) for a university-level beginner learner in Deutsch im Blick.

Guidelines:
- Stay in character as the assigned role — you are a classmate, not a teacher.
- Use B1-level German: short, natural sentences; introduce new words only in context.
- Keep replies brief (1–3 sentences). Ask follow-up questions to keep the conversation going.
- If the student writes in English or seems stuck, reply with a mix of simple German and a brief English hint.
- Do not lecture, grade, or give long grammar explanations — prompt the student to speak or write more.
- You are not the official grader; give practice and encouragement, not scores.`;

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

function buildChatSystemPrompt(persona, activityBrief, peerScenario) {
  let base = persona === 'peer' ? PEER_SYSTEM : TEACHER_CHAT_SYSTEM;

  if (persona === 'peer' && peerScenario?.role) {
    base += `\n\nYour character for this activity: ${peerScenario.role}. Stay in this role throughout the conversation.`;
  }

  const brief = String(activityBrief ?? '').trim();
  if (!brief) return base;
  return `${base}\n\n--- Current activity context ---\n${brief}`;
}

function normalizeChatMessages(messages) {
  const out = [];
  for (const msg of messages) {
    if (!msg?.content) continue;
    const role =
      msg.role === 'assistant' ? 'assistant' : msg.role === 'system' ? 'system' : 'user';
    const content = String(msg.content).trim();
    if (!content) continue;

    const last = out[out.length - 1];
    if (last && last.role === role && role !== 'system') {
      last.content = `${last.content}\n\n${content}`;
      continue;
    }
    out.push({ role, content });
  }
  return out;
}

function buildGradeMessages(payload = {}) {
  return [
    { role: 'system', content: TEACHER_GRADE_SYSTEM },
    { role: 'user', content: buildGradeUserPrompt(payload) }
  ];
}

function buildChatMessages(payload = {}) {
  const persona = payload.persona === 'peer' ? 'peer' : 'teacher';
  const system = buildChatSystemPrompt(persona, payload.activityBrief, payload.peerScenario);
  const history = Array.isArray(payload.messages) ? payload.messages : [];
  const userMessage = String(payload.message ?? '').trim();

  const turns = history
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && m.content)
    .slice(-12)
    .map((m) => ({ role: m.role, content: String(m.content) }));

  const lastTurn = turns[turns.length - 1];
  if (userMessage && !(lastTurn?.role === 'user' && lastTurn.content === userMessage)) {
    turns.push({ role: 'user', content: userMessage });
  }

  return normalizeChatMessages([{ role: 'system', content: system }, ...turns]);
}

module.exports = {
  GRADE_JSON_SCHEMA,
  TEACHER_CHAT_SYSTEM,
  TEACHER_GRADE_SYSTEM,
  PEER_SYSTEM,
  buildGradeUserPrompt,
  buildGradeMessages,
  buildChatMessages,
  normalizeChatMessages
};
