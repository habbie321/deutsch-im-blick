import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import StopIcon from '@mui/icons-material/Stop';
import { isGradableAiMode } from '../utils/aiActivityConfig';
import { useActivitySession } from '../context/ActivitySessionContext';
import { isAiActive, PERSONA_LABELS } from '../utils/aiPersona';
import { isChatSuccess, streamChatMessage, cancelChatRequest } from '../services/aiChat';
import { getPagePeerScenario } from '../utils/peerScenario';
import { useAiSettings } from '../utils/aiSettings';

const AI_DISABLED_HINT =
  'AI assistant is turned off in Settings. Enable it there to use chat and answer checking.';

const EMPTY_DRAFTS = { teacher: '', peer: '' };

const STREAM_CHUNK_SX = {
  display: 'inline',
  animation: 'dibStreamFadeIn 0.32s ease-out both'
};

function StreamingMessageText({ chunks }) {
  return (
    <Typography variant="body2" component="div" sx={{ whiteSpace: 'pre-wrap' }}>
      {chunks.map(({ id, text }) => (
        <Box key={id} component="span" sx={STREAM_CHUNK_SX}>
          {text}
        </Box>
      ))}
    </Typography>
  );
}

function providerStatusMessage(provider, enableRemote) {
  if (provider === 'local') {
    return 'Local model only — answers stay on this device. Cloud models are not used.';
  }
  if (provider === 'remote' && !enableRemote) {
    return 'Remote model is selected but cloud calls are disabled in Settings. Using mock responses until you enable remote calls.';
  }
  if (provider === 'mock') {
    return 'Mock provider — no real model is called. Choose Local or Remote in Settings for live AI.';
  }
  return null;
}

/**
 * Right-side chat panel for teacher / peer assistance.
 * Persona `off` is settings-driven only — not a panel toggle.
 * Teacher and peer maintain separate chat threads.
 */
export function AssistantPanel({ onClose }) {
  const {
    activity,
    activityKey,
    aiEnabled,
    currentPageId,
    chatPersona,
    persona,
    setPersona,
    chat,
    chatsByPersona,
    addChatMessage,
    checkMyAnswer,
    cancelActiveRequest,
    getActivityBrief,
    fields,
    status
  } = useActivitySession();

  const { provider, enableRemote } = useAiSettings();

  const [drafts, setDrafts] = useState(EMPTY_DRAFTS);
  const [sending, setSending] = useState(false);
  const [streaming, setStreaming] = useState(null);
  const chatAbortRef = useRef(null);
  const chatRequestRef = useRef(null);
  const chunkIdRef = useRef(0);
  const pendingChunkRef = useRef('');
  const chunkRafRef = useRef(null);
  const listRef = useRef(null);
  const aiActive = isAiActive(persona);
  const draft = drafts[chatPersona] ?? '';
  const busy = sending || status === 'grading';
  const checkAvailable = Object.values(fields).some((field) =>
    isGradableAiMode(field?.aiGrading ?? 'semantic')
  );
  const statusBanner = aiEnabled ? providerStatusMessage(provider, enableRemote) : null;

  const peerScenario = getPagePeerScenario(activity, currentPageId);
  const peerChatPayload = peerScenario
    ? { role: peerScenario.role, opening: peerScenario.opening }
    : undefined;

  useEffect(() => {
    setDrafts(EMPTY_DRAFTS);
  }, [activity?.chapter, activity?.id]);

  useEffect(() => {
    const el = listRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [chat, chatPersona, busy, streaming?.chunks]);

  const flushPendingChunk = useCallback((persona) => {
    const text = pendingChunkRef.current;
    pendingChunkRef.current = '';
    chunkRafRef.current = null;
    if (!text) return;

    const id = chunkIdRef.current;
    chunkIdRef.current += 1;
    setStreaming((prev) =>
      prev?.persona === persona ? { ...prev, chunks: [...prev.chunks, { id, text }] } : prev
    );
  }, []);

  const appendStreamChunk = useCallback(
    (persona, chunk) => {
      pendingChunkRef.current += chunk;
      if (!chunkRafRef.current) {
        chunkRafRef.current = requestAnimationFrame(() => flushPendingChunk(persona));
      }
    },
    [flushPendingChunk]
  );

  const resetStreamBuffers = useCallback(() => {
    pendingChunkRef.current = '';
    if (chunkRafRef.current) {
      cancelAnimationFrame(chunkRafRef.current);
      chunkRafRef.current = null;
    }
    chunkIdRef.current = 0;
  }, []);

  useEffect(() => {
    return () => {
      chatAbortRef.current?.abort();
      if (chatRequestRef.current) {
        cancelChatRequest(chatRequestRef.current);
      }
      if (chunkRafRef.current) {
        cancelAnimationFrame(chunkRafRef.current);
      }
    };
  }, []);

  const setDraft = (value) => {
    setDrafts((prev) => ({ ...prev, [chatPersona]: value }));
  };

  const handleCancel = () => {
    if (sending) {
      chatAbortRef.current?.abort();
      if (chatRequestRef.current) {
        cancelChatRequest(chatRequestRef.current);
      }
      resetStreamBuffers();
      setStreaming(null);
      setSending(false);
    }
    if (status === 'grading') {
      cancelActiveRequest();
    }
  };

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || !aiActive || busy) return;

    const threadPersona = chatPersona;
    const priorThread = chatsByPersona[threadPersona] ?? [];
    const msgMeta = { activityKey, pageId: currentPageId };

    await addChatMessage({ role: 'user', content: text }, threadPersona, msgMeta);
    setDraft('');
    setSending(true);
    resetStreamBuffers();
    setStreaming({ persona: threadPersona, chunks: [] });

    const abortController = new AbortController();
    chatAbortRef.current = abortController;
    const requestId = `chat-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    chatRequestRef.current = requestId;

    try {
      const result = await streamChatMessage({
        requestId,
        signal: abortController.signal,
        persona: threadPersona,
        message: text,
        activityBrief: getActivityBrief(),
        peerScenario: threadPersona === 'peer' ? peerChatPayload : undefined,
        messages: [...priorThread, { role: 'user', content: text }]
          .filter((msg) => msg.role === 'user' || msg.role === 'assistant')
          .slice(-12)
          .map((msg) => ({
            role: msg.role,
            content: msg.content
          })),
        meta: msgMeta,
        onChunk: (chunk) => appendStreamChunk(threadPersona, chunk)
      });

      flushPendingChunk(threadPersona);

      if (result?.cancelled || abortController.signal.aborted) {
        return;
      }

      if (isChatSuccess(result)) {
        await addChatMessage({ role: 'assistant', content: result.content }, threadPersona, msgMeta);
      } else {
        await addChatMessage(
          { role: 'system', content: result.error || 'Could not send message.' },
          threadPersona,
          msgMeta
        );
      }
    } catch (err) {
      if (!abortController.signal.aborted) {
        await addChatMessage(
          { role: 'system', content: err?.message || 'Could not send message.' },
          threadPersona,
          msgMeta
        );
      }
    } finally {
      chatAbortRef.current = null;
      chatRequestRef.current = null;
      resetStreamBuffers();
      setStreaming(null);
      setSending(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const displayMessages = [...chat];
  const showStreamingBubble =
    streaming && streaming.persona === chatPersona && streaming.chunks.length > 0;
  if (showStreamingBubble) {
    displayMessages.push({
      id: 'streaming-assistant',
      role: 'assistant',
      streaming: true,
      chunks: streaming.chunks
    });
  }

  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 0,
        display: 'grid',
        gridTemplateRows: 'auto auto auto 1fr auto auto',
        bgcolor: 'background.paper'
      }}
    >
      <Box
        sx={{
          px: 1.5,
          py: 1.25,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          borderBottom: 1,
          borderColor: 'divider'
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {PERSONA_LABELS[chatPersona]}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {activity?.title || 'No activity selected'}
          </Typography>
        </Box>
        {onClose && (
          <IconButton size="small" onClick={onClose} aria-label="Close assistant">
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      {statusBanner && (
        <Alert severity="info" sx={{ borderRadius: 0, py: 0.5, px: 1.5 }}>
          <Typography variant="caption">{statusBanner}</Typography>
        </Alert>
      )}

      <Box sx={{ px: 1.5, py: 1 }}>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={chatPersona}
          onChange={(_, value) => value && setPersona(value)}
          fullWidth
          disabled={!aiActive || busy}
        >
          <ToggleButton value="teacher">{PERSONA_LABELS.teacher}</ToggleButton>
          <ToggleButton value="peer">{PERSONA_LABELS.peer}</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Divider />

      <Box
        ref={listRef}
        sx={{
          minHeight: 0,
          overflowY: 'auto',
          px: 1.5,
          py: 1.5,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          '@keyframes dibStreamFadeIn': {
            from: { opacity: 0.2 },
            to: { opacity: 1 }
          }
        }}
      >
        {!aiActive ? (
          <Typography variant="body2" color="text.secondary">
            {AI_DISABLED_HINT}
          </Typography>
        ) : displayMessages.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {chatPersona === 'peer'
              ? peerScenario
                ? `Your partner (${peerScenario.role}) will greet you here. Reply in German to practice.`
                : 'Peer mode: practice partner conversations here.'
              : 'Ask the teacher for help, or use “Check my answer” (automatic where JSON defines keys, AI for freeform).'}
          </Typography>
        ) : (
          displayMessages.map((msg) => (
            <Box
              key={msg.id}
              sx={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '92%',
                px: 1.25,
                py: 1,
                borderRadius: 2,
                bgcolor:
                  msg.role === 'user'
                    ? 'primary.main'
                    : msg.role === 'system'
                      ? 'action.selected'
                      : 'action.hover',
                color: msg.role === 'user' ? 'primary.contrastText' : 'text.primary'
              }}
            >
              <Typography variant="caption" sx={{ display: 'block', opacity: 0.8, mb: 0.25 }}>
                {msg.role === 'user' ? 'You' : msg.role === 'system' ? 'Note' : PERSONA_LABELS[chatPersona]}
              </Typography>
              {msg.streaming ? (
                <StreamingMessageText chunks={msg.chunks} />
              ) : (
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {msg.content}
                </Typography>
              )}
            </Box>
          ))
        )}
        {busy && !showStreamingBubble && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
            <CircularProgress size={16} />
            <Typography variant="caption" color="text.secondary">
              {status === 'grading' ? 'Checking answer…' : 'Thinking…'}
            </Typography>
          </Box>
        )}
      </Box>

      <Divider />

      <Box sx={{ p: 1.5, display: 'grid', gap: 1 }}>
        {chatPersona === 'teacher' && checkAvailable && (
          <Button
            variant="outlined"
            size="small"
            onClick={checkMyAnswer}
            disabled={busy}
          >
            Check my answer
          </Button>
        )}
        <TextField
          multiline
          minRows={2}
          maxRows={5}
          size="small"
          placeholder={aiActive ? 'Type a message…' : 'Enable AI in Settings to chat…'}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={!aiActive || busy}
        />
        {busy ? (
          <Button
            variant="outlined"
            color="warning"
            startIcon={<StopIcon />}
            onClick={handleCancel}
          >
            Cancel
          </Button>
        ) : (
          <Button
            variant="contained"
            endIcon={<SendIcon />}
            onClick={handleSend}
            disabled={!aiActive || !draft.trim()}
          >
            Send
          </Button>
        )}
      </Box>
    </Box>
  );
}

export default AssistantPanel;
