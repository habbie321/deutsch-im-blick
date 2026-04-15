import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Divider,
  Collapse,
  Stepper,
  Step,
  StepLabel,
  MobileStepper
} from '@mui/material';
import { ExpandMore, ExpandLess, EditNote, KeyboardArrowLeft, KeyboardArrowRight, CheckCircle } from '@mui/icons-material';
import VideoPlayer from './VideoPlayer';

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
    pdfNote,
    speakers = [],
    wordBank = [],
    chapter,
    image,
    notaBene
  } = activityData;

  const isMultiSpeaker = speakers.length > 0;
  const isParagraphMode = !isMultiSpeaker && tasks.length <= 1;

  // State
  const [showExample, setShowExample] = useState(false);
  const [done, setDone] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [responses, setResponses] = useState(() => {
    if (isMultiSpeaker) {
      const init = {};
      speakers.forEach(s => s.questions.forEach((_, qIdx) => {
        init[`${s.id}_${qIdx}`] = '';
      }));
      return init;
    }
    return tasks.reduce((acc, _, idx) => ({ ...acc, [idx]: '' }), {});
  });

  // Computed helpers for Multi-Speaker mode
  const currentSpeaker = isMultiSpeaker ? speakers[activeStep] : null;
  const totalSteps = speakers.length;

  const isStepComplete = (stepIdx) => {
    const s = speakers[stepIdx];
    return s.questions.every((_, qIdx) => (responses[`${s.id}_${qIdx}`] || '').trim().length > 0);
  };

  const allSpeakersDone = isMultiSpeaker ? speakers.every((_, idx) => isStepComplete(idx)) : true;

  const handleComplete = () => {
    const values = Object.values(responses);
    const totalLength = values.join('').trim().length;
    
    let isValid = false;
    if (isMultiSpeaker) {
      isValid = allSpeakersDone;
    } else if (isParagraphMode) {
      isValid = totalLength >= 20;
    } else {
      isValid = values.every(v => v.trim().length > 0);
    }

    if (!isValid) return;
    
    setDone(true);
    if (onComplete) {
      onComplete({ 
        correct: true, 
        response: isParagraphMode ? responses[0] : JSON.stringify(responses),
        responses: responses 
      });
    }
  };

  // Shared logic for vocabulary/word banks
  const vocabList = wordBank.length > 0 ? wordBank : helpfulExpressions;
  const vocabLabel = wordBank.length > 0 ? "Word Bank" : "Helpful Expressions";

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

      {/* Image Display */}
      {image && (
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <img 
            src={`app://${image}`} 
            alt="Activity content" 
            style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
          />
        </Box>
      )}
      {/* Task Instructions */}
      {!isMultiSpeaker && isParagraphMode && tasks.length > 0 && (
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

      {/* Nota Bene Block */}
      {notaBene && (
        <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: '#fff9c4', borderLeft: 5, borderColor: '#fbc02d', borderRadius: '0 8px 8px 0' }}>
          <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 'bold', fontSize: '0.72rem', textTransform: 'uppercase', color: '#f57f17' }}>
            Nota Bene:
          </Typography>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontStyle: 'italic', color: 'text.primary', lineHeight: 1.4 }}>
            {notaBene}
          </Typography>
        </Paper>
      )}

      {/* Vocabulary / Word Bank */}
      {vocabList.length > 0 && (
        <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: isMultiSpeaker ? '#fdf6e3' : '#f8f9fa', borderLeft: 5, borderColor: isMultiSpeaker ? '#856404' : 'primary.main' }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', fontSize: '0.75rem', textTransform: 'uppercase', color: isMultiSpeaker ? '#856404' : 'primary.main' }}>
            {vocabLabel}:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {vocabList.map((expr, idx) => (
              <Typography key={idx} variant="caption" sx={{ bgcolor: 'white', px: 1, py: 0.5, borderRadius: 1, border: 1, borderColor: 'divider' }}>
                {expr}
              </Typography>
            ))}
          </Box>
        </Paper>
      )}

      {!isMultiSpeaker && <Divider sx={{ mb: 3 }} />}

      {/* Main Writing Input(s) */}
      {isMultiSpeaker ? (
        <Paper elevation={2} sx={{ p: 3, borderRadius: 2, bgcolor: 'background.paper' }}>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            {currentSpeaker.name} {isStepComplete(activeStep) && <CheckCircle color="success" fontSize="small" />}
          </Typography>
          {currentSpeaker.videoPath && (
            <VideoPlayer
              src={`app://${currentSpeaker.videoPath}`}
              title={currentSpeaker.name}
              relativePath={currentSpeaker.videoPath}
              fallbackUrl={`https://coerll.utexas.edu/dib/toc.php?k=${chapter}`}
              sx={{ mb: 3 }}
            />
          )}
          {currentSpeaker.questions.map((q, idx) => {
            const isLongTask = q.includes('\n');
            return (
              <Box key={idx} sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1, whiteSpace: 'pre-wrap' }}>{q.trim()}</Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  size={isLongTask ? "medium" : "small"}
                  multiline={isLongTask}
                  rows={isLongTask ? 4 : 1}
                  placeholder="Antworten Sie hier..."
                  value={responses[`${currentSpeaker.id}_${idx}`] || ''}
                  onChange={(e) => setResponses(prev => ({ ...prev, [`${currentSpeaker.id}_${idx}`]: e.target.value }))}
                  disabled={done}
                  sx={{ bgcolor: 'background.paper' }}
                />
              </Box>
            );
          })}
        </Paper>
      ) : !isParagraphMode ? (
        <Box sx={{ mb: 2 }}>
          {tasks.map((task, idx) => {
            const isLongTask = task.includes('\n');
            return (
              <Box key={idx} sx={{ mb: 3 }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1, whiteSpace: 'pre-wrap' }}>
                  {idx + 1}. {task.trim()}
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  size={isLongTask ? "medium" : "small"}
                  multiline={isLongTask}
                  rows={isLongTask ? 6 : 1}
                  placeholder="Ihre Antwort..."
                  value={responses[idx] || ''}
                  onChange={(e) => setResponses(prev => ({ ...prev, [idx]: e.target.value }))}
                  disabled={done}
                  sx={{ bgcolor: 'background.paper' }}
                />
              </Box>
            );
          })}
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

      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4, mt: isMultiSpeaker ? 2 : 0 }}>
        {isMultiSpeaker && (
          <MobileStepper
            variant="progress"
            steps={totalSteps}
            position="static"
            activeStep={activeStep}
            sx={{ width: '100%', bgcolor: 'transparent', mb: 2 }}
            nextButton={
              <Button size="small" onClick={() => setActiveStep(s => s + 1)} disabled={activeStep === totalSteps - 1}>
                Next Speaker <KeyboardArrowRight />
              </Button>
            }
            backButton={
              <Button size="small" onClick={() => setActiveStep(s => s - 1)} disabled={activeStep === 0}>
                <KeyboardArrowLeft /> Back
              </Button>
            }
          />
        )}

        {!done ? (
          <Button
            variant="contained"
            color={isMultiSpeaker ? "success" : "primary"}
            size="large"
            startIcon={<EditNote />}
            onClick={handleComplete}
            disabled={isMultiSpeaker ? !allSpeakersDone : (isParagraphMode ? (responses[0] || '').trim().length < 20 : !Object.values(responses).every(v => v.trim().length > 0))}
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