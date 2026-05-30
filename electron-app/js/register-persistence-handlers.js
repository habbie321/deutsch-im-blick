const { ipcMain } = require('electron');
const {
  appendChatMessage,
  loadChatHistory,
  saveActivityAttempt,
  loadActivityAttempts,
  markActivityComplete,
  loadActivityCompletions
} = require('./database');

let registered = false;

function requireUserId(userId) {
  const id = Number(userId);
  if (!Number.isFinite(id) || id <= 0) {
    throw new Error('Valid userId is required.');
  }
  return id;
}

function registerPersistenceHandlers() {
  if (registered) return;
  registered = true;

  ipcMain.handle('append-chat-message', async (_event, userId, message) => {
    const id = requireUserId(userId);
    if (!message?.persona || !message?.role || message.content == null) {
      throw new Error('Invalid chat message payload.');
    }
    return appendChatMessage(id, message);
  });

  ipcMain.handle('load-chat-history', async (_event, userId, persona) => {
    const id = requireUserId(userId);
    if (persona !== 'teacher' && persona !== 'peer') {
      throw new Error('Invalid chat persona.');
    }
    return loadChatHistory(id, persona);
  });

  ipcMain.handle('save-activity-attempt', async (_event, userId, attempt) => {
    const id = requireUserId(userId);
    if (!attempt?.chapter || !attempt?.activityId || !attempt?.fieldId) {
      throw new Error('Invalid activity attempt payload.');
    }
    return saveActivityAttempt(id, attempt);
  });

  ipcMain.handle('load-activity-attempts', async (_event, userId, chapter, activityId) => {
    const id = requireUserId(userId);
    return loadActivityAttempts(id, Number(chapter), Number(activityId));
  });

  ipcMain.handle('mark-activity-complete', async (_event, userId, chapter, activityId, summaryJson) => {
    const id = requireUserId(userId);
    return markActivityComplete(id, Number(chapter), Number(activityId), summaryJson ?? null);
  });

  ipcMain.handle('load-activity-completions', async (_event, userId) => {
    const id = requireUserId(userId);
    return loadActivityCompletions(id);
  });
}

module.exports = { registerPersistenceHandlers };
