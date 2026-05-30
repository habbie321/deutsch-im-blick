import React, { useRef, useState } from 'react';
import {
  Box,
  Button,
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

const STUB_REPLY =
  'AI assistant is not connected yet. Configure your API in Settings (coming in Phase 2). I can see your current activity context once connected.';

const AI_DISABLED_HINT =
  'AI assistant is turned off in Settings. Enable it there to use chat and answer checking.';

/**
 * Right-side chat panel for teacher / peer assistance (Phase 1 stub).
 * Persona `off` is settings-driven only — not a panel toggle.
 */
export function AssistantPanel({ onClose }) {
  const {
    activity,
    aiEnabled,
    chatPersona,
    persona,
    setPersona,
    chat,
    addChatMessage,
    checkMyAnswer,
    fields
  } = useActivitySession();

  const [draft, setDraft] = useState('');
  const listRef = useRef(null);
  const aiActive = isAiActive(persona);

  const handleSend = () => {
    const text = draft.trim();
    if (!text || !aiActive) return;

    addChatMessage({ role: 'user', content: text });
    setDraft('');

    window.setTimeout(() => {
      addChatMessage({ role: 'assistant', content: STUB_REPLY });
    }, 300);
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
            Assistant
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
          disabled={!aiEnabled}
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
              ? 'Peer mode: practice partner conversations here (AI coming in Phase 6).'
              : 'Ask questions about this activity or use “Check my answer” for feedback.'}
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
                {msg.role === 'user' ? 'You' : msg.role === 'system' ? 'Note' : PERSONA_LABELS[persona] || 'Assistant'}
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {msg.content}
              </Typography>
            </Box>
          ))
        )}
      </Box>

      <Divider />

      <Box sx={{ p: 1.5, display: 'grid', gap: 1 }}>
        {Object.keys(fields).length > 0 && (
          <Button variant="outlined" size="small" onClick={checkMyAnswer} disabled={!aiActive}>
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
          disabled={!aiActive}
        />
        <Button
          variant="contained"
          endIcon={<SendIcon />}
          onClick={handleSend}
          disabled={!aiActive || !draft.trim()}
        >
          Send
        </Button>
      </Box>
    </Box>
  );
}

export default AssistantPanel;
