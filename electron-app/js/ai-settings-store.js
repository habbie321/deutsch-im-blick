const { app } = require('electron');
const fs = require('fs');
const path = require('path');

const SETTINGS_FILE = 'ai-settings.json';

const DEFAULTS = {
  aiEnabled: true,
  provider: 'mock',
  model: '',
  baseUrl: 'http://localhost:11434',
  apiKey: '',
  enableRemote: false
};

const PROVIDERS = new Set(['mock', 'local', 'remote']);

/** Migrate legacy provider ids from earlier builds. */
function normalizeProvider(provider) {
  if (provider === 'ollama') return 'local';
  if (provider === 'openai') return 'remote';
  return provider;
}

function getSettingsPath() {
  return path.join(app.getPath('userData'), SETTINGS_FILE);
}

function loadSettingsRaw() {
  const filePath = getSettingsPath();
  try {
    if (fs.existsSync(filePath)) {
      const parsed = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const merged = { ...DEFAULTS, ...parsed };
      merged.provider = normalizeProvider(merged.provider);
      if (merged.enableCloud != null && merged.enableRemote == null) {
        merged.enableRemote = Boolean(merged.enableCloud);
      }
      return merged;
    }
  } catch (err) {
    console.error('Failed to load AI settings:', err.message);
  }
  return { ...DEFAULTS };
}

function saveSettingsRaw(settings) {
  const filePath = getSettingsPath();
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(settings, null, 2), 'utf-8');
}

/** Safe copy for renderer — never includes raw apiKey. */
function getAiSettingsForRenderer() {
  const settings = loadSettingsRaw();
  return {
    aiEnabled: Boolean(settings.aiEnabled),
    provider: settings.provider,
    model: settings.model || '',
    baseUrl: settings.baseUrl || DEFAULTS.baseUrl,
    enableRemote: Boolean(settings.enableRemote),
    hasApiKey: Boolean(settings.apiKey)
  };
}

function getAiSettingsForService() {
  return loadSettingsRaw();
}

function updateAiSettings(patch = {}) {
  const current = loadSettingsRaw();
  const next = { ...current };

  if (typeof patch.aiEnabled === 'boolean') next.aiEnabled = patch.aiEnabled;
  if (typeof patch.enableRemote === 'boolean') next.enableRemote = patch.enableRemote;
  if (typeof patch.enableCloud === 'boolean') next.enableRemote = patch.enableCloud;
  if (typeof patch.model === 'string') next.model = patch.model.trim();
  if (typeof patch.baseUrl === 'string') next.baseUrl = patch.baseUrl.trim() || DEFAULTS.baseUrl;

  if (typeof patch.provider === 'string') {
    const normalized = normalizeProvider(patch.provider);
    if (PROVIDERS.has(normalized)) {
      next.provider = normalized;
    }
  }

  if (typeof patch.apiKey === 'string') {
    const key = patch.apiKey.trim();
    if (key && key !== '••••••') {
      next.apiKey = key;
    }
  }

  saveSettingsRaw(next);
  return getAiSettingsForRenderer();
}

module.exports = {
  DEFAULTS,
  getAiSettingsForRenderer,
  getAiSettingsForService,
  updateAiSettings
};
