/** @returns {{ teacher: [], peer: [] }} */
export function createEmptyChats() {
  return { teacher: [], peer: [] };
}

/** User-selectable assistant modes in the chat panel. */
export const CHAT_PERSONAS = ['teacher', 'peer'];

/** Effective persona when AI is disabled globally (Settings). Not a panel toggle. */
export const PERSONA_OFF = 'off';

export const PERSONA_LABELS = {
  teacher: 'Teacher',
  peer: 'Peer',
  [PERSONA_OFF]: 'Off'
};

export function isChatPersona(persona) {
  return CHAT_PERSONAS.includes(persona);
}

/** Whether outbound AI calls (chat, grading) are allowed for this persona. */
export function isAiActive(persona) {
  return persona !== PERSONA_OFF;
}

/** @param {boolean} aiEnabled — from Settings */
export function resolvePersona(aiEnabled, chatPersona) {
  if (!aiEnabled) return PERSONA_OFF;
  return isChatPersona(chatPersona) ? chatPersona : 'teacher';
}
