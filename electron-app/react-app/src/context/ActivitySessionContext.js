import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import { buildActivityBrief } from '../utils/buildActivityBrief';
import { isAiActive, resolvePersona } from '../utils/aiPersona';
import { useAiSettings } from '../utils/aiSettings';

const ActivitySessionContext = createContext(null);

function activityKey(activity) {
  if (!activity) return null;
  return `${activity.chapter}-${activity.id}`;
}

export function ActivitySessionProvider({ activity, children }) {
  const key = activityKey(activity);
  const { aiEnabled } = useAiSettings();

  const [currentPageId, setCurrentPageId] = useState(null);
  const [chatPersona, setChatPersona] = useState('teacher');
  const [inputs, setInputsState] = useState({});
  const [fields, setFields] = useState({});
  const [attempts, setAttempts] = useState([]);
  const [chat, setChat] = useState([]);
  const [grading, setGrading] = useState({});
  const [status, setStatus] = useState('idle');

  const persona = resolvePersona(aiEnabled, chatPersona);

  useEffect(() => {
    setCurrentPageId(activity?.pages?.[0]?.id ?? null);
    setChatPersona('teacher');
    setInputsState({});
    setFields({});
    setAttempts([]);
    setChat([]);
    setGrading({});
    setStatus('idle');
  }, [key, activity]);

  const setPersona = useCallback((next) => {
    if (next === 'teacher' || next === 'peer') {
      setChatPersona(next);
    }
  }, []);

  const setInput = useCallback((fieldId, value) => {
    setInputsState((prev) => ({ ...prev, [fieldId]: value }));
  }, []);

  const registerField = useCallback((fieldId, meta = {}) => {
    setFields((prev) => ({
      ...prev,
      [fieldId]: { ...prev[fieldId], ...meta }
    }));
  }, []);

  const addChatMessage = useCallback((message) => {
    setChat((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${prev.length}`,
        at: new Date().toISOString(),
        role: message.role,
        content: message.content
      }
    ]);
  }, []);

  const resetSession = useCallback(() => {
    setCurrentPageId(activity?.pages?.[0]?.id ?? null);
    setChatPersona('teacher');
    setInputsState({});
    setFields({});
    setAttempts([]);
    setChat([]);
    setGrading({});
    setStatus('idle');
  }, [activity]);

  const getActivityBrief = useCallback(() => {
    return buildActivityBrief({ activity, currentPageId, inputs, fields });
  }, [activity, currentPageId, inputs, fields]);

  const checkMyAnswer = useCallback(() => {
    if (!isAiActive(persona)) return;

    setStatus('idle');
    addChatMessage({
      role: 'system',
      content:
        'AI answer checking is not configured yet. Add your API settings in Phase 2 to enable teacher feedback.'
    });
  }, [addChatMessage, persona]);

  const value = useMemo(
    () => ({
      activity,
      activityKey: key,
      currentPageId,
      setCurrentPageId,
      aiEnabled,
      chatPersona,
      persona,
      setPersona,
      inputs,
      setInput,
      fields,
      registerField,
      attempts,
      setAttempts,
      chat,
      addChatMessage,
      grading,
      setGrading,
      status,
      setStatus,
      resetSession,
      getActivityBrief,
      checkMyAnswer
    }),
    [
      activity,
      key,
      currentPageId,
      aiEnabled,
      chatPersona,
      persona,
      setPersona,
      inputs,
      setInput,
      fields,
      registerField,
      attempts,
      chat,
      addChatMessage,
      grading,
      status,
      resetSession,
      getActivityBrief,
      checkMyAnswer
    ]
  );

  return (
    <ActivitySessionContext.Provider value={value}>
      {children}
    </ActivitySessionContext.Provider>
  );
}

export function useActivitySession() {
  const ctx = useContext(ActivitySessionContext);
  if (!ctx) {
    throw new Error('useActivitySession must be used within ActivitySessionProvider');
  }
  return ctx;
}

/** Returns null when no session provider is mounted (legacy / standalone usage). */
export function useOptionalActivitySession() {
  return useContext(ActivitySessionContext);
}
