import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  Link,
  TextField,
  LinearProgress
} from '@mui/material';
import { useOptionalActivitySession } from '../context/ActivitySessionContext';
import { useOptionalChatHistory } from '../context/ChatHistoryContext';
import {
  countPeerUserMessages,
  getPagePeerScenario,
  MIN_PEER_USER_MESSAGES,
  peerSummaryFieldId
} from '../utils/peerScenario';

/**
 * PromptActivity
 * Classroom / oral activities with instructions only (no auto-graded blocks).
 * When ai.peerScenario is configured, partners practice in peer chat before completing.
 */
const PromptActivity = ({ activityData, onComplete }) => {
  const {
    title,
    intro,
    tasks = [],
    sections = [],
    links = [],
    pdfNote
  } = activityData;

  const session = useOptionalActivitySession();
  const chatHistory = useOptionalChatHistory();
  const currentPageId = session?.currentPageId ?? activityData.id ?? 'main';
  const activityKey = session?.activityKey ?? `${activityData.chapter}-${activityData.id}`;

  const peerScenario = useMemo(() => {
    const act = session?.activity ?? activityData;
    return getPagePeerScenario(act, currentPageId);
  }, [session?.activity, activityData, currentPageId]);

  const peerUserCount = useMemo(() => {
    if (!peerScenario || !chatHistory) return 0;
    return countPeerUserMessages(chatHistory.chatsByPersona?.peer ?? [], activityKey);
  }, [peerScenario, chatHistory, activityKey]);

  const summaryFieldId = peerSummaryFieldId(currentPageId);
  const setSessionInput = session?.setInput;

  const [done, setDone] = useState(false);
  const [summary, setSummary] = useState('');

  useEffect(() => {
    if (!session?.inputs || !session.hydrationToken) return;
    const value = session.inputs[summaryFieldId];
    if (value != null) setSummary(value);
  }, [session?.hydrationToken, session?.activityKey, session?.inputs, summaryFieldId]);

  const peerReady = !peerScenario || peerUserCount >= MIN_PEER_USER_MESSAGES;
  const canComplete = peerReady;

  const handleComplete = () => {
    if (!canComplete) return;
    setDone(true);
    onComplete?.({
      correct: true,
      peerExchanges: peerUserCount,
      summary: summary.trim() || undefined
    });
  };

  return (
    <Box sx={{ p: 2, maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h4" color="text.primary" align="center" gutterBottom sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      {intro && (
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
          {intro}
        </Typography>
      )}

      {peerScenario && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            border: 1,
            borderColor: 'primary.light',
            borderRadius: 2,
            bgcolor: 'action.hover'
          }}
        >
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Partner practice (Peer mode)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Use the assistant panel in <strong>Peer</strong> mode to practice with your partner
            {peerScenario.role ? ` (${peerScenario.role})` : ''}. Your partner will start the conversation.
          </Typography>
          <Box sx={{ mb: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Your messages: {peerUserCount} / {MIN_PEER_USER_MESSAGES} required
            </Typography>
            <LinearProgress
              variant="determinate"
              value={Math.min(100, (peerUserCount / MIN_PEER_USER_MESSAGES) * 100)}
              sx={{ mt: 0.5, height: 6, borderRadius: 1 }}
            />
          </Box>
          {!peerReady && (
            <Typography variant="caption" color="text.secondary">
              Send at least {MIN_PEER_USER_MESSAGES} messages in the peer chat before marking complete.
            </Typography>
          )}
        </Paper>
      )}

      {tasks.length > 0 && (
        <Paper elevation={0} sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
            Tasks
          </Typography>
          <List dense disablePadding>
            {tasks.map((task, idx) => (
              <ListItem key={idx} disableGutters sx={{ alignItems: 'flex-start' }}>
                <ListItemText primary={typeof task === 'string' ? task : task.text} />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {sections.map((section, idx) => (
        <Paper key={idx} elevation={0} sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          {section.heading && (
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
              {section.heading}
            </Typography>
          )}
          {(section.paragraphs || []).map((paragraph, pIdx) => (
            <Typography key={pIdx} variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {paragraph}
            </Typography>
          ))}
          {(section.list || []).length > 0 && (
            <List dense disablePadding>
              {section.list.map((item, lIdx) => (
                <ListItem key={lIdx} disableGutters sx={{ py: 0.25 }}>
                  <ListItemText primary={item} primaryTypographyProps={{ variant: 'body2' }} />
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
      ))}

      {peerScenario && (
        <Paper elevation={0} sx={{ p: 2, mb: 3, border: 1, borderColor: 'divider', borderRadius: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
            Report back (optional notes)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            After your partner conversation, jot down a short summary for yourself — e.g. who you spoke with and what you practiced.
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={3}
            size="small"
            placeholder="e.g. Alex heißt … Er kommt aus …"
            value={summary}
            onChange={(e) => {
              const value = e.target.value;
              setSummary(value);
              if (setSessionInput) {
                setSessionInput(summaryFieldId, value);
              }
            }}
          />
        </Paper>
      )}

      {links.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
            Resources
          </Typography>
          {links.map((link, idx) => (
            <Link key={idx} href={link.url} target="_blank" rel="noopener noreferrer" display="block" sx={{ mb: 0.5 }}>
              {link.label}
            </Link>
          ))}
        </Box>
      )}

      {pdfNote && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3, textAlign: 'center' }}>
          {pdfNote}
        </Typography>
      )}

      {!done ? (
        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleComplete}
            disabled={!canComplete}
            sx={{ px: 6 }}
          >
            Mark activity complete
          </Button>
          {peerScenario && !peerReady && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              Complete your peer conversation first.
            </Typography>
          )}
        </Box>
      ) : (
        <Typography variant="body1" color="success.main" sx={{ textAlign: 'center' }}>
          Activity complete.
        </Typography>
      )}
    </Box>
  );
};

export default PromptActivity;
