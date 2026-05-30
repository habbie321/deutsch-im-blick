import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import { createEmptyChats, isChatPersona } from '../utils/aiPersona';
import { appendChatMessage, loadChatHistory } from '../services/persistence';

const ChatHistoryContext = createContext(null);

function appendLocalMessage(thread, message) {
  return [
    ...thread,
    {
      id: message.id || `${Date.now()}-${thread.length}`,
      at: message.at || new Date().toISOString(),
      role: message.role,
      content: message.content,
      meta: message.meta
    }
  ];
}

/** Account-scoped global chat (teacher / peer threads). */
export function ChatHistoryProvider({ userId, children }) {
  const [chatsByPersona, setChatsByPersona] = useState(createEmptyChats);
  const [chatPersona, setChatPersona] = useState('teacher');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    if (!userId) {
      setChatsByPersona(createEmptyChats());
      setLoaded(true);
      return undefined;
    }

    setLoaded(false);
    Promise.all([
      loadChatHistory(userId, 'teacher'),
      loadChatHistory(userId, 'peer')
    ])
      .then(([teacher, peer]) => {
        if (!active) return;
        setChatsByPersona({
          teacher: teacher ?? [],
          peer: peer ?? []
        });
        setLoaded(true);
      })
      .catch((err) => {
        console.error('Failed to load chat history:', err);
        if (active) {
          setChatsByPersona(createEmptyChats());
          setLoaded(true);
        }
      });

    return () => {
      active = false;
    };
  }, [userId]);

  const setPersona = useCallback((next) => {
    if (next === 'teacher' || next === 'peer') {
      setChatPersona(next);
    }
  }, []);

  /**
   * @param {{ role: string, content: string, meta?: object }} message
   * @param {'teacher'|'peer'} [threadPersona]
   * @param {{ activityKey?: string, pageId?: string, fieldId?: string }} [meta]
   */
  const addChatMessage = useCallback(
    async (message, threadPersona = chatPersona, meta = {}) => {
      if (!isChatPersona(threadPersona)) return null;

      const tempId = `pending-${Date.now()}`;
      const optimistic = {
        id: tempId,
        at: new Date().toISOString(),
        role: message.role,
        content: message.content,
        meta: message.meta ?? meta
      };

      setChatsByPersona((prev) => ({
        ...prev,
        [threadPersona]: appendLocalMessage(prev[threadPersona] ?? [], optimistic)
      }));

      if (!userId) return optimistic;

      try {
        const saved = await appendChatMessage(userId, {
          persona: threadPersona,
          role: message.role,
          content: message.content,
          activityKey: meta.activityKey,
          pageId: meta.pageId,
          fieldId: meta.fieldId
        });

        setChatsByPersona((prev) => ({
          ...prev,
          [threadPersona]: (prev[threadPersona] ?? []).map((msg) =>
            msg.id === tempId ? saved : msg
          )
        }));

        return saved;
      } catch (err) {
        console.error('Failed to persist chat message:', err);
        return optimistic;
      }
    },
    [chatPersona, userId]
  );

  const chat = chatsByPersona[chatPersona] ?? [];

  const value = useMemo(
    () => ({
      userId,
      loaded,
      chatPersona,
      setPersona,
      chat,
      chatsByPersona,
      addChatMessage
    }),
    [userId, loaded, chatPersona, setPersona, chat, chatsByPersona, addChatMessage]
  );

  return (
    <ChatHistoryContext.Provider value={value}>{children}</ChatHistoryContext.Provider>
  );
}

export function useChatHistory() {
  const ctx = useContext(ChatHistoryContext);
  if (!ctx) {
    throw new Error('useChatHistory must be used within ChatHistoryProvider');
  }
  return ctx;
}

export function useOptionalChatHistory() {
  return useContext(ChatHistoryContext);
}
