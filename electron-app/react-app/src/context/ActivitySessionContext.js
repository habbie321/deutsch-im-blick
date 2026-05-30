import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { buildActivityBrief } from '../utils/buildActivityBrief';
import { resolvePersona } from '../utils/aiPersona';
import { useAiSettings } from '../utils/aiSettings';
import { useChatHistory } from './ChatHistoryContext';
import { gradeSessionFields, cancelGradeRequest } from '../services/aiGrading';
import { loadActivityAttempts, saveActivityAttempt } from '../services/persistence';
import { getPagePeerScenario, hasPeerOpeningForActivity } from '../utils/peerScenario';
import { collectPageSessionFields } from '../utils/collectPageSessionFields';

const ActivitySessionContext = createContext(null);

function activityKey(activity) {
  if (!activity) return null;
  return `${activity.chapter}-${activity.id}`;
}

export function ActivitySessionProvider({ activity, userId, children }) {
  const key = activityKey(activity);
  const { aiEnabled } = useAiSettings();
  const {
    chatPersona,
    setPersona,
    chat,
    chatsByPersona,
    addChatMessage,
    loaded: chatLoaded
  } = useChatHistory();

  const [currentPageId, setCurrentPageId] = useState(null);
  const [inputs, setInputsState] = useState({});
  const [fields, setFields] = useState({});
  const [attempts, setAttempts] = useState([]);
  const [grading, setGrading] = useState({});
  const [status, setStatus] = useState('idle');
  const [hydrationToken, setHydrationToken] = useState(0);
  const [fieldRegistryToken, setFieldRegistryToken] = useState(0);
  const saveTimersRef = useRef({});
  const seededPeerRef = useRef(new Set());
  const peerAutoSwitchRef = useRef(null);
  const activeRequestRef = useRef(null);

  const persona = resolvePersona(aiEnabled, chatPersona);

  // Reset synchronously before child useEffects register fields (avoids child-then-parent wipe race).
  useLayoutEffect(() => {
    setCurrentPageId(activity?.pages?.[0]?.id ?? null);
    setFields({});
    setGrading({});
    setStatus('idle');
    setInputsState({});
    peerAutoSwitchRef.current = null;
    setFieldRegistryToken((t) => t + 1);

    Object.values(saveTimersRef.current).forEach(clearTimeout);
    saveTimersRef.current = {};
  }, [key, activity]);

  useEffect(() => {
    if (!userId || !activity) {
      setHydrationToken((t) => t + 1);
      return undefined;
    }

    let cancelled = false;

    loadActivityAttempts(userId, activity.chapter, activity.id)
      .then((rows) => {
        if (cancelled) return;
        const nextInputs = {};
        const nextGrading = {};
        for (const row of rows || []) {
          nextInputs[row.field_id] = row.answer ?? '';
          if (row.grading_json) {
            try {
              nextGrading[row.field_id] = JSON.parse(row.grading_json);
            } catch {
              /* ignore invalid cache */
            }
          }
        }
        setInputsState(nextInputs);
        setGrading(nextGrading);
        setHydrationToken((t) => t + 1);
      })
      .catch((err) => {
        console.error('Failed to load activity attempts:', err);
        if (!cancelled) setHydrationToken((t) => t + 1);
      });

    return () => {
      cancelled = true;
    };
  }, [key, activity, userId]);

  // Derive gradable fields from activity JSON (runs after layout reset, replaces per-component registration).
  useEffect(() => {
    if (!activity) {
      setFields({});
      return;
    }
    setFields(collectPageSessionFields(activity, currentPageId));
  }, [activity, currentPageId, fieldRegistryToken]);

  useEffect(() => {
    if (!chatLoaded || !aiEnabled || !activity || !key) return;

    const scenario = getPagePeerScenario(activity, currentPageId);
    if (!scenario?.opening) return;

    const switchKey = `${key}:${scenario.pageId ?? currentPageId ?? 'main'}`;
    if (peerAutoSwitchRef.current !== switchKey) {
      peerAutoSwitchRef.current = switchKey;
      setPersona('peer');
    }

    const peerThread = chatsByPersona.peer ?? [];
    const seedKey = switchKey;

    if (
      hasPeerOpeningForActivity(peerThread, key, scenario.pageId) ||
      seededPeerRef.current.has(seedKey)
    ) {
      return;
    }

    seededPeerRef.current.add(seedKey);
    addChatMessage(
      { role: 'assistant', content: scenario.opening },
      'peer',
      { activityKey: key, pageId: scenario.pageId ?? currentPageId ?? undefined }
    ).catch((err) => {
      console.error('Failed to seed peer opening:', err);
      seededPeerRef.current.delete(seedKey);
    });
  }, [
    chatLoaded,
    aiEnabled,
    activity,
    key,
    currentPageId,
    chatsByPersona.peer,
    setPersona,
    addChatMessage
  ]);

  const persistAttempt = useCallback(
    (fieldId, answer, gradingJson) => {
      if (!userId || !activity) return Promise.resolve();
      return saveActivityAttempt(userId, {
        chapter: activity.chapter,
        activityId: activity.id,
        pageId: currentPageId ?? '',
        fieldId,
        answer: answer ?? '',
        gradingJson: gradingJson ?? null
      });
    },
    [userId, activity, currentPageId]
  );

  const setInput = useCallback(
    (fieldId, value) => {
      setInputsState((prev) => ({ ...prev, [fieldId]: value }));

      if (!userId || !activity) return;

      if (saveTimersRef.current[fieldId]) {
        clearTimeout(saveTimersRef.current[fieldId]);
      }

      saveTimersRef.current[fieldId] = setTimeout(() => {
        persistAttempt(fieldId, value, null).catch((err) => {
          console.error('Failed to save activity attempt:', err);
        });
      }, 400);
    },
    [userId, activity, persistAttempt]
  );

  const registerField = useCallback((fieldId, meta = {}) => {
    setFields((prev) => ({
      ...prev,
      [fieldId]: { ...prev[fieldId], ...meta }
    }));
  }, []);

  const resetSession = useCallback(() => {
    setCurrentPageId(activity?.pages?.[0]?.id ?? null);
    setInputsState({});
    setFields({});
    setAttempts([]);
    setGrading({});
    setStatus('idle');
    setHydrationToken((t) => t + 1);
  }, [activity]);

  const getActivityBrief = useCallback(() => {
    return buildActivityBrief({ activity, currentPageId, inputs, fields });
  }, [activity, currentPageId, inputs, fields]);

  const checkMyAnswer = useCallback(async () => {
    setPersona('teacher');
    setStatus('grading');
    const meta = { activityKey: key, pageId: currentPageId };
    const requestId = `grade-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    activeRequestRef.current = requestId;

    try {
      const { byField, summary, cancelled } = await gradeSessionFields({
        fields,
        inputs,
        activityKey: key,
        pageId: currentPageId,
        persona: 'teacher',
        aiEnabled,
        requestId
      });

      if (cancelled) return;

      setGrading((prev) => ({ ...prev, ...byField }));

      await Promise.all(
        Object.entries(byField).map(([fieldId, result]) =>
          persistAttempt(fieldId, inputs[fieldId], JSON.stringify(result))
        )
      );

      await addChatMessage({ role: 'system', content: summary }, 'teacher', meta);
    } catch (err) {
      await addChatMessage(
        {
          role: 'system',
          content: err?.message || 'Could not check your answer.'
        },
        'teacher',
        meta
      );
    } finally {
      activeRequestRef.current = null;
      setStatus('idle');
    }
  }, [
    addChatMessage,
    aiEnabled,
    fields,
    inputs,
    key,
    currentPageId,
    persistAttempt,
    setPersona
  ]);

  const cancelActiveRequest = useCallback(() => {
    const requestId = activeRequestRef.current;
    if (requestId) {
      cancelGradeRequest(requestId);
      activeRequestRef.current = null;
      setStatus('idle');
    }
  }, []);

  const value = useMemo(
    () => ({
      activity,
      activityKey: key,
      userId,
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
      hydrationToken,
      fieldRegistryToken,
      resetSession,
      getActivityBrief,
      checkMyAnswer,
      cancelActiveRequest
    }),
    [
      activity,
      key,
      userId,
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
      hydrationToken,
      fieldRegistryToken,
      resetSession,
      getActivityBrief,
      checkMyAnswer,
      cancelActiveRequest
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
