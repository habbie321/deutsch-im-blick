const { ipcMain } = require('electron');
const { gradeAnswer, chat, chatStream, cancelRequest, makeRequestId } = require('./ai-service');
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
    const requestId = payload?.requestId || makeRequestId('grade');
    try {
      const result = await gradeAnswer(payload || {}, { requestId });
      return { ok: true, requestId, ...result };
    } catch (err) {
      if (err.code === 'ABORTED') {
        return { ok: false, cancelled: true, requestId, code: 'ABORTED' };
      }
      return {
        ok: false,
        requestId,
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

  ipcMain.handle('ai:chat-stream', async (event, payload) => {
    const requestId = payload?.requestId || makeRequestId('chat');
    const sender = event.sender;

    try {
      const result = await chatStream(payload || {}, {
        requestId,
        onChunk: (chunk) => {
          if (!sender.isDestroyed()) {
            sender.send('ai:stream-chunk', { requestId, chunk });
          }
        }
      });
      return { ok: true, requestId, ...result };
    } catch (err) {
      if (err.code === 'ABORTED') {
        return { ok: false, cancelled: true, requestId, code: 'ABORTED' };
      }
      return {
        ok: false,
        requestId,
        error: err.message,
        code: err.code || 'CHAT_ERROR'
      };
    }
  });

  ipcMain.handle('ai:cancel', async (_event, requestId) => {
    if (!requestId) return { ok: false, error: 'Missing requestId' };
    cancelRequest(requestId);
    return { ok: true };
  });
}

module.exports = { registerAiHandlers };
