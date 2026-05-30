function hasPersistenceApi() {
  return typeof window !== 'undefined' && typeof window.api?.loadChatHistory === 'function';
}

function mapDbChatMessage(row) {
  return {
    id: String(row.id),
    at: row.created_at,
    role: row.role,
    content: row.content,
    meta: {
      activityKey: row.activity_key ?? undefined,
      pageId: row.page_id ?? undefined,
      fieldId: row.field_id ?? undefined
    }
  };
}

export async function loadChatHistory(userId, persona) {
  if (!hasPersistenceApi()) return [];
  const rows = await window.api.loadChatHistory(userId, persona);
  return (rows || []).map(mapDbChatMessage);
}

export async function appendChatMessage(userId, message) {
  if (!hasPersistenceApi()) {
    return {
      id: `local-${Date.now()}`,
      at: new Date().toISOString(),
      role: message.role,
      content: message.content
    };
  }
  const row = await window.api.appendChatMessage(userId, message);
  return mapDbChatMessage(row);
}

export async function loadActivityAttempts(userId, chapter, activityId) {
  if (!hasPersistenceApi()) return [];
  return window.api.loadActivityAttempts(userId, chapter, activityId);
}

export async function saveActivityAttempt(userId, attempt) {
  if (!hasPersistenceApi()) return { ok: false };
  return window.api.saveActivityAttempt(userId, attempt);
}

export async function loadActivityCompletions(userId) {
  if (!hasPersistenceApi()) return [];
  return window.api.loadActivityCompletions(userId);
}

export async function markActivityComplete(userId, chapter, activityId, summary) {
  if (!hasPersistenceApi()) return { ok: false };
  const summaryJson = summary != null ? JSON.stringify(summary) : null;
  return window.api.markActivityComplete(userId, chapter, activityId, summaryJson);
}

export { hasPersistenceApi };
