import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  Stepper,
  Step,
  StepLabel,
  Divider,
  MobileStepper
} from '@mui/material';
import { KeyboardArrowLeft, KeyboardArrowRight, CheckCircle } from '@mui/icons-material';
import VideoPlayer from './VideoPlayer';

/**
 * MultiSpeakerWritingActivity
 * Handles activities where multiple speakers are interviewed.
 * Provides a sub-stepper to focus on one speaker and their questions at a time.
 */
const MultiSpeakerWritingActivity = ({ activityData, onComplete }) => {
  const { title, intro, speakers = [], wordBank = [], chapter, pdfNote } = activityData;
  
  const [activeStep, setActiveStep] = useState(0);
  const [responses, setResponses] = useState({});
  const [done, setDone] = useState(false);

  const currentSpeaker = speakers[activeStep];
  const totalSteps = speakers.length;

  const handleTextChange = (speakerId, questionIdx, value) => {
    setResponses(prev => ({
      ...prev,
      [`${speakerId}_${questionIdx}`]: value
    }));
  };

  const isStepComplete = (stepIdx) => {
    const speaker = speakers[stepIdx];
    return speaker.questions.every((_, qIdx) => 
      (responses[`${speaker.id}_${qIdx}`] || '').trim().length > 0
    );
  };

  const allStepsComplete = speakers.every((_, idx) => isStepComplete(idx));

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleFinalComplete = () => {
    setDone(true);
    if (onComplete) {
      onComplete({ correct: true, responses });
    }
  };

  return (
    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', maxWidth: 800, mx: 'auto', width: '100%' }}>
      <Typography variant="h4" component="h2" align="center" color="primary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {intro}
      </Typography>

      {wordBank.length > 0 && (
        <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: '#fdf6e3', borderStyle: 'dashed' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#856404' }}>
            Word Bank:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {wordBank.map((word, idx) => (
              <Typography key={idx} variant="caption" sx={{ bgcolor: 'white', px: 1, py: 0.5, borderRadius: 1, border: '1px solid #ddd' }}>
                {word}
              </Typography>
            ))}
          </Box>
        </Paper>
      )}

      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {speakers.map((s, idx) => (
          <Step key={s.id} completed={isStepComplete(idx)}>
            <StepLabel>{s.name}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Paper elevation={2} sx={{ p: 3, borderRadius: 2, bgcolor: 'background.paper' }}>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          {currentSpeaker.name} {isStepComplete(activeStep) && <CheckCircle color="success" fontSize="small" />}
        </Typography>

        <VideoPlayer
          src={`app://${currentSpeaker.videoPath}`}
          title={`${currentSpeaker.name} - Frühstück`}
          relativePath={currentSpeaker.videoPath}
          fallbackUrl={`https://coerll.utexas.edu/dib/toc.php?k=${chapter}`}
          sx={{ mb: 3 }}
        />

        <Box sx={{ mt: 3 }}>
          {currentSpeaker.questions.map((q, idx) => (
            <Box key={idx} sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                {q}
              </Typography>
              <TextField
                fullWidth
                size="small"
                variant="standard"
                placeholder="Antworten Sie hier..."
                value={responses[`${currentSpeaker.id}_${idx}`] || ''}
                onChange={(e) => handleTextChange(currentSpeaker.id, idx, e.target.value)}
                disabled={done}
              />
            </Box>
          ))}
        </Box>
      </Paper>

      <MobileStepper
        variant="progress"
        steps={totalSteps}
        position="static"
        activeStep={activeStep}
        sx={{ mt: 2, bgcolor: 'transparent' }}
        nextButton={
          activeStep === totalSteps - 1 ? (
            <Button 
              size="small" 
              variant="contained" 
              color="success" 
              onClick={handleFinalComplete} 
              disabled={!allStepsComplete || done}
            >
              {done ? "Abgeschlossen" : "Complete Activity"}
            </Button>
          ) : (
            <Button size="small" onClick={handleNext} disabled={activeStep === totalSteps - 1}>
              Next Speaker
              <KeyboardArrowRight />
            </Button>
          )
        }
        backButton={
          <Button size="small" onClick={handleBack} disabled={activeStep === 0}>
            <KeyboardArrowLeft />
            Back
          </Button>
        }
      />

      {pdfNote && <Typography variant="caption" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>{pdfNote}</Typography>}
    </Box>
  );
};

export default MultiSpeakerWritingActivity;