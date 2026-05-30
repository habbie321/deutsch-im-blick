import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import { buildActivityBrief } from '../utils/buildActivityBrief';
import { createEmptyChats, isAiActive, isChatPersona, resolvePersona } from '../utils/aiPersona';
import { useAiSettings } from '../utils/aiSettings';
import { gradeSessionFields } from '../services/aiGrading';

const ActivitySessionContext = createContext(null);

function activityKey(activity) {
  if (!activity) return null;
  return `${activity.chapter}-${activity.id}`;
}

function appendMessage(thread, message) {
  return [
    ...thread,
    {
      id: `${Date.now()}-${thread.length}`,
      at: new Date().toISOString(),
      role: message.role,
      content: message.content
    }
  ];
}

export function ActivitySessionProvider({ activity, children }) {
  const key = activityKey(activity);
  const { aiEnabled } = useAiSettings();

  const [currentPageId, setCurrentPageId] = useState(null);
  const [chatPersona, setChatPersona] = useState('teacher');
  const [inputs, setInputsState] = useState({});
  const [fields, setFields] = useState({});
  const [attempts, setAttempts] = useState([]);
  const [chatsByPersona, setChatsByPersona] = useState(createEmptyChats);
  const [grading, setGrading] = useState({});
  const [status, setStatus] = useState('idle');

  const persona = resolvePersona(aiEnabled, chatPersona);
  const chat = chatsByPersona[chatPersona] ?? [];

  useEffect(() => {
    setCurrentPageId(activity?.pages?.[0]?.id ?? null);
    setChatPersona('teacher');
    setInputsState({});
    setFields({});
    setAttempts([]);
    setChatsByPersona(createEmptyChats());
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

  /** @param {{ role: string, content: string }} message @param {'teacher'|'peer'} [threadPersona] */
  const addChatMessage = useCallback((message, threadPersona = chatPersona) => {
    if (!isChatPersona(threadPersona)) return;

    setChatsByPersona((prev) => ({
      ...prev,
      [threadPersona]: appendMessage(prev[threadPersona] ?? [], message)
    }));
  }, [chatPersona]);

  const resetSession = useCallback(() => {
    setCurrentPageId(activity?.pages?.[0]?.id ?? null);
    setChatPersona('teacher');
    setInputsState({});
    setFields({});
    setAttempts([]);
    setChatsByPersona(createEmptyChats());
    setGrading({});
    setStatus('idle');
  }, [activity]);

  const getActivityBrief = useCallback(() => {
    return buildActivityBrief({ activity, currentPageId, inputs, fields });
  }, [activity, currentPageId, inputs, fields]);

  const checkMyAnswer = useCallback(async () => {
    setStatus('grading');
    try {
      const { byField, summary } = await gradeSessionFields({
        fields,
        inputs,
        activityKey: key,
        pageId: currentPageId,
        persona: 'teacher',
        aiEnabled
      });

      setGrading((prev) => ({ ...prev, ...byField }));
      addChatMessage({ role: 'system', content: summary }, 'teacher');
    } catch (err) {
      addChatMessage(
        {
          role: 'system',
          content: err?.message || 'Could not check your answer.'
        },
        'teacher'
      );
    } finally {
      setStatus('idle');
    }
  }, [addChatMessage, aiEnabled, fields, inputs, key, currentPageId]);

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
      chatsByPersona,
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
      chatsByPersona,
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
