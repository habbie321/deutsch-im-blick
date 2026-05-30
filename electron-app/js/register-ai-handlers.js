const { ipcMain } = require('electron');
const { gradeAnswer, chat } = require('./ai-service');
const { getAiSettingsForRenderer, updateAiSettings } = require('./ai-settings-store');

let registered = false;

function registerAiHandlers() {
  if (registered) return;
  registered = true;

  ipcMain.handle('ai:get-settings', async () => getAiSettingsForRenderer());

  ipcMain.handle('ai:update-settings', async (_event, patch) => {
    if (!patch || typeof patch !== 'object') {
      throw new Error('Invalid AI settings payload');
    }
    return updateAiSettings(patch);
  });

  ipcMain.handle('ai:grade', async (_event, payload) => {
    try {
      const result = await gradeAnswer(payload || {});
      return { ok: true, ...result };
    } catch (err) {
      return {
        ok: false,
        error: err.message,
        code: err.code || 'GRADE_ERROR'
      };
    }
  });

  ipcMain.handle('ai:chat', async (_event, payload) => {
    try {
      const result = await chat(payload || {});
      return { ok: true, ...result };
    } catch (err) {
      return {
        ok: false,
        error: err.message,
        code: err.code || 'CHAT_ERROR'
      };
    }
  });
}

module.exports = { registerAiHandlers };
