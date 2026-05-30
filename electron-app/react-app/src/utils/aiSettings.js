import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'dib.aiEnabled';
const CHANGE_EVENT = 'dib-ai-settings-change';

export function getAiEnabled() {
  if (typeof window === 'undefined') return true;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === null) return true;
  return stored === 'true';
}

export function setAiEnabled(enabled) {
  window.localStorage.setItem(STORAGE_KEY, String(Boolean(enabled)));
  window.dispatchEvent(
    new CustomEvent(CHANGE_EVENT, { detail: { enabled: Boolean(enabled) } })
  );
}

/** Global AI on/off preference (Settings). Phase 2 will move to Electron userData. */
export function useAiSettings() {
  const [aiEnabled, setEnabledState] = useState(getAiEnabled);

  useEffect(() => {
    const handler = (event) => {
      setEnabledState(event.detail.enabled);
    };
    window.addEventListener(CHANGE_EVENT, handler);
    return () => window.removeEventListener(CHANGE_EVENT, handler);
  }, []);

  const updateAiEnabled = useCallback((enabled) => {
    setAiEnabled(enabled);
    setEnabledState(Boolean(enabled));
  }, []);

  return { aiEnabled, setAiEnabled: updateAiEnabled };
}
