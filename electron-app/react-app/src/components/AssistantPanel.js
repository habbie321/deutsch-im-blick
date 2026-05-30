import React, { useEffect, useRef, useState } from 'react';
import {
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
import { useActivitySession } from '../context/ActivitySessionContext';
import { isAiActive, PERSONA_LABELS } from '../utils/aiPersona';
import { isChatSuccess, sendChatMessage } from '../services/aiChat';

const AI_DISABLED_HINT =
  'AI assistant is turned off in Settings. Enable it there to use chat and answer checking.';

const EMPTY_DRAFTS = { teacher: '', peer: '' };

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
    getActivityBrief,
    fields,
    status
  } = useActivitySession();

  const [drafts, setDrafts] = useState(EMPTY_DRAFTS);
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);
  const aiActive = isAiActive(persona);
  const draft = drafts[chatPersona] ?? '';
  const busy = sending || status === 'grading';
  const checkAvailable = Object.keys(fields).length > 0;

  useEffect(() => {
    setDrafts(EMPTY_DRAFTS);
  }, [activity?.chapter, activity?.id]);

  useEffect(() => {
    const el = listRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [chat, chatPersona, busy]);

  const setDraft = (value) => {
    setDrafts((prev) => ({ ...prev, [chatPersona]: value }));
  };

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || !aiActive || busy) return;

    const threadPersona = chatPersona;
    const priorThread = chatsByPersona[threadPersona] ?? [];
    addChatMessage({ role: 'user', content: text }, threadPersona);
    setDraft('');
    setSending(true);

    try {
      const result = await sendChatMessage({
        persona: threadPersona,
        message: text,
        activityBrief: getActivityBrief(),
        messages: [...priorThread, { role: 'user', content: text }]
          .filter((msg) => msg.role === 'user' || msg.role === 'assistant')
          .slice(-12)
          .map((msg) => ({
            role: msg.role,
            content: msg.content
          })),
        meta: {
          activityKey,
          pageId: currentPageId
        }
      });

      if (isChatSuccess(result)) {
        addChatMessage({ role: 'assistant', content: result.content }, threadPersona);
      } else {
        addChatMessage(
          { role: 'system', content: result.error || 'Could not send message.' },
          threadPersona
        );
      }
    } catch (err) {
      addChatMessage(
        { role: 'system', content: err?.message || 'Could not send message.' },
        threadPersona
      );
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 0,
        display: 'grid',
        gridTemplateRows: 'auto auto 1fr auto auto',
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
          gap: 1
        }}
      >
        {!aiActive ? (
          <Typography variant="body2" color="text.secondary">
            {AI_DISABLED_HINT}
          </Typography>
        ) : chat.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {chatPersona === 'peer'
              ? 'Peer mode: practice partner conversations here.'
              : 'Ask the teacher for help, or use “Check my answer” (automatic where JSON defines keys, AI for freeform).'}
          </Typography>
        ) : (
          chat.map((msg) => (
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
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {msg.content}
              </Typography>
            </Box>
          ))
        )}
        {busy && (
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
        <Button
          variant="contained"
          endIcon={sending ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
          onClick={handleSend}
          disabled={!aiActive || busy || !draft.trim()}
        >
          Send
        </Button>
      </Box>
    </Box>
  );
}

export default AssistantPanel;
