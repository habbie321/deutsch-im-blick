import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Divider,
  Collapse
} from '@mui/material';
import { ExpandMore, ExpandLess, EditNote } from '@mui/icons-material';

/**
 * WritingActivity
 * A component for free-form text writing exercises.
 * Features a single multiline input for paragraphs, a collapsible example, 
 * and a vocabulary hint section.
 */
const WritingActivity = ({ activityData, onComplete }) => {
  const { 
    title, 
    intro, 
    tasks = [], 
    example, 
    helpfulExpressions = [], 
    pdfNote
  } = activityData;

  // Initialize responses as an object: { 0: '', 1: '', ... }
  const [responses, setResponses] = useState(() => 
    tasks.reduce((acc, _, idx) => ({ ...acc, [idx]: '' }), {})
  );
  const [showExample, setShowExample] = useState(false);
  const [done, setDone] = useState(false);

  const isParagraphMode = tasks.length <= 1;

  const handleComplete = () => {
    const values = Object.values(responses);
    const totalLength = values.join('').trim().length;
    
    // Paragraph mode needs 20 chars; Multi-input needs every box to have something.
    const isValid = isParagraphMode 
      ? totalLength >= 20 
      : (values.every(v => v.trim().length > 0));

    if (!isValid) return;
    
    setDone(true);
    if (onComplete) {
      onComplete({ 
        correct: true, 
        response: isParagraphMode ? responses[0] : values.join('\n'),
        responses: responses 
      });
    }
  };

  return (
    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', maxWidth: 800, mx: 'auto', width: '100%', p: 1 }}>
      <Typography variant="h4" component="h2" align="center" gutterBottom color="primary">
        {title}
      </Typography>
      
      {intro && (
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
          {intro}
        </Typography>
      )}

      {/* Task Instructions */}
      {isParagraphMode && tasks.length > 0 && (
        <Box sx={{ mb: 3 }}>
          {tasks.map((task, idx) => (
            <Typography key={idx} variant="body1" sx={{ fontWeight: 'medium', mb: 1 }}>
              &bull; {task}
            </Typography>
          ))}
        </Box>
      )}

      {/* Toggleable Example Block */}
      {example && (
        <Box sx={{ mb: 3 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => setShowExample(!showExample)}
            endIcon={showExample ? <ExpandLess /> : <ExpandMore />}
            sx={{ textTransform: 'none' }}
          >
            {example.label || "Beispiel ansehen"}
          </Button>
          <Collapse in={showExample}>
            <Paper variant="outlined" sx={{ p: 2, mt: 1, bgcolor: 'action.hover', borderStyle: 'dashed', borderRadius: 2 }}>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontStyle: 'italic' }}>
                {example.text}
              </Typography>
            </Paper>
          </Collapse>
        </Box>
      )}

      {/* Helpful Expressions Word Bank */}
      {helpfulExpressions.length > 0 && (
        <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: '#f8f9fa', borderLeft: 5, borderColor: 'primary.main' }}>
          <Typography variant="subtitle2" color="primary" sx={{ mb: 1, fontWeight: 'bold', fontSize: '0.75rem', textTransform: 'uppercase' }}>
            Helpful Expressions:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {helpfulExpressions.map((expr, idx) => (
              <Typography key={idx} variant="caption" sx={{ bgcolor: 'white', px: 1, py: 0.5, borderRadius: 1, border: 1, borderColor: 'divider' }}>
                {expr}
              </Typography>
            ))}
          </Box>
        </Paper>
      )}

      <Divider sx={{ mb: 3 }} />

      {/* Main Writing Input(s) */}
      {!isParagraphMode ? (
        <Box sx={{ mb: 2 }}>
          {tasks.map((task, idx) => (
            <Box key={idx} sx={{ mb: 3 }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                {idx + 1}. {task}
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder="Ihre Antwort..."
                value={responses[idx] || ''}
                onChange={(e) => setResponses(prev => ({ ...prev, [idx]: e.target.value }))}
                disabled={done}
                sx={{ bgcolor: 'background.paper' }}
              />
            </Box>
          ))}
        </Box>
      ) : (
        <TextField
          multiline
          rows={10}
          fullWidth
          variant="outlined"
          placeholder="Schreiben Sie hier..."
          value={responses[0] || ''}
          onChange={(e) => setResponses(prev => ({ ...prev, 0: e.target.value }))}
          disabled={done}
          sx={{ mb: 4, bgcolor: 'background.paper', borderRadius: 1 }}
        />
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
        {!done ? (
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<EditNote />}
            onClick={handleComplete}
            disabled={isParagraphMode ? (responses[0] || '').trim().length < 20 : !Object.values(responses).every(v => v.trim().length > 0)}
            sx={{ px: 4, borderRadius: 2 }}
          >
            Mark activity complete
          </Button>
        ) : (
          <Typography variant="h6" color="success.main" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
            ✓ Activity Complete!
          </Typography>
        )}
      </Box>

      {pdfNote && <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>{pdfNote}</Typography>}
    </Box>
  );
};

export default WritingActivity;