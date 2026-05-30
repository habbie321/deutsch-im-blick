import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_AI_SETTINGS } from './aiContracts';

const STORAGE_KEY = 'dib.aiEnabled';
const CHANGE_EVENT = 'dib-ai-settings-change';

function hasElectronAiSettings() {
  return typeof window !== 'undefined' && typeof window.api?.getAiSettings === 'function';
}

function readLocalAiEnabled() {
  if (typeof window === 'undefined') return DEFAULT_AI_SETTINGS.aiEnabled;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === null) return DEFAULT_AI_SETTINGS.aiEnabled;
  return stored === 'true';
}

function writeLocalAiEnabled(enabled) {
  window.localStorage.setItem(STORAGE_KEY, String(Boolean(enabled)));
}

export async function fetchAiSettings() {
  if (hasElectronAiSettings()) {
    return window.api.getAiSettings();
  }
  return {
    ...DEFAULT_AI_SETTINGS,
    aiEnabled: readLocalAiEnabled()
  };
}

function notifySettingsChange(settings) {
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: settings }));
}

/** Global AI settings (Electron userData when available). */
export function useAiSettings() {
  const [settings, setSettings] = useState(DEFAULT_AI_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    fetchAiSettings()
      .then((next) => {
        if (active) {
          setSettings({ ...DEFAULT_AI_SETTINGS, ...next });
          setLoaded(true);
        }
      })
      .catch((err) => {
        console.error('Failed to load AI settings:', err);
        if (active) {
          setSettings({
            ...DEFAULT_AI_SETTINGS,
            aiEnabled: readLocalAiEnabled()
          });
          setLoaded(true);
        }
      });

    const handler = (event) => {
      setSettings({ ...DEFAULT_AI_SETTINGS, ...event.detail });
    };
    window.addEventListener(CHANGE_EVENT, handler);
    return () => {
      active = false;
      window.removeEventListener(CHANGE_EVENT, handler);
    };
  }, []);

  const updateSettings = useCallback(async (patch) => {
    let next;

    if (hasElectronAiSettings()) {
      next = await window.api.updateAiSettings(patch);
    } else {
      next = {
        ...settings,
        ...patch,
        hasApiKey: settings.hasApiKey
      };
      if (typeof patch.aiEnabled === 'boolean') {
        writeLocalAiEnabled(patch.aiEnabled);
        next.aiEnabled = patch.aiEnabled;
      }
    }

    const merged = { ...DEFAULT_AI_SETTINGS, ...next };
    setSettings(merged);
    notifySettingsChange(merged);
    return merged;
  }, [settings]);

  const setAiEnabled = useCallback(
    (enabled) => updateSettings({ aiEnabled: Boolean(enabled) }),
    [updateSettings]
  );

  return {
    ...settings,
    loaded,
    setAiEnabled,
    updateSettings
  };
}

/** @deprecated use useAiSettings().aiEnabled */
export function getAiEnabled() {
  return readLocalAiEnabled();
}

/** @deprecated use useAiSettings().setAiEnabled */
export function setAiEnabled(enabled) {
  writeLocalAiEnabled(enabled);
  notifySettingsChange({
    ...DEFAULT_AI_SETTINGS,
    aiEnabled: Boolean(enabled)
  });
}
