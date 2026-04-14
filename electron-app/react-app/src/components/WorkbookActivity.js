import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Divider,
  Button,
  Alert,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import MatchingActivity from './MatchingActivity';

const WorkbookActivity = ({ activityData, onComplete }) => {
  const { title, intro, checks, pdfNote } = activityData;
  const [currentStep, setCurrentStep] = useState(0);
  const [tfAnswers, setTfAnswers] = useState({});
  const [matchingComplete, setMatchingComplete] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const tfBlocks = checks?.blocks.filter(b => b.type === 'tf') || [];
  const matchingBlock = checks?.blocks.find(b => b.type === 'matching');

  // Determine if we should split this into steps
  const hasTf = tfBlocks.length > 0;
  const hasMatching = !!matchingBlock;
  const isMultiStep = hasTf && hasMatching;

  const handleTfChange = (id, value) => {
    setTfAnswers(prev => ({ ...prev, [id]: value === 'true' }));
  };

  const allTfAnswered = tfBlocks.every(block => tfAnswers[block.id] !== undefined);
  
  const canProceedToMatching = allTfAnswered;
  const canFinalize = hasMatching ? matchingComplete : allTfAnswered;

  const handleNext = () => {
    setCurrentStep(1);
    // Scroll to top of activity content when switching steps
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = () => {
    setSubmitted(true);
    if (onComplete) {
      onComplete({ correct: true }); // Defaulting to true as requested for now
    }
  };

  return (
    <Box sx={{ p: 2, maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h4" color="primary" align="center" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
        {intro}
      </Typography>

      {isMultiStep && (
        <Stepper activeStep={currentStep} sx={{ mb: 4 }}>
          <Step><StepLabel>Richtig oder Falsch?</StepLabel></Step>
          <Step><StepLabel>Matching</StepLabel></Step>
        </Stepper>
      )}

      {checks?.blocks.filter(block => {
        if (!isMultiStep) return true;
        if (currentStep === 0) return block.type === 'tf' || block.type === 'sectionTitle';
        if (currentStep === 1) return block.type === 'matching';
        return true;
      }).map((block, index) => {
        if (block.type === 'sectionTitle') {
          return (
            <Typography key={index} variant="h6" sx={{ mt: 4, mb: 2, color: 'text.primary', fontWeight: 'bold' }}>
              {block.text}
            </Typography>
          );
        }

        if (block.type === 'tf') {
          return (
            <Paper key={block.id} elevation={0} sx={{ p: 2, mb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body1" sx={{ flexGrow: 1 }}>
                  {block.statement}
                </Typography>
                <FormControl component="fieldset">
                  <RadioGroup
                    row
                    value={tfAnswers[block.id] === undefined ? '' : tfAnswers[block.id].toString()}
                    onChange={(e) => handleTfChange(block.id, e.target.value)}
                  >
                    <FormControlLabel value="true" control={<Radio size="small" />} label="R" />
                    <FormControlLabel value="false" control={<Radio size="small" />} label="F" />
                  </RadioGroup>
                </FormControl>
              </Box>
            </Paper>
          );
        }

        if (block.type === 'matching') {
          return (
            <Box key={block.id} sx={{ mt: 4, p: 0, border: '2px dashed', borderColor: 'primary.light', borderRadius: 2 }}>
              <MatchingActivity 
                activityData={block} 
                onComplete={() => setMatchingComplete(true)} 
              />
            </Box>
          );
        }

        return null;
      })}

      <Box sx={{ mt: 6, textAlign: 'center' }}>
        {!submitted ? (
          isMultiStep && currentStep === 0 ? (
            <Button
              variant="contained"
              size="large"
              disabled={!canProceedToMatching}
              onClick={handleNext}
              sx={{ px: 8, borderRadius: 2 }}
            >
              Continue to Matching
            </Button>
          ) : (
            <Button
              variant="contained"
              size="large"
              disabled={!canFinalize}
              onClick={handleSubmit}
              sx={{ px: 8, borderRadius: 2 }}
            >
              Check All Answers
            </Button>
          )
        ) : (
          <Alert severity="success" sx={{ borderRadius: 2 }}>
            Activity completed! You found all the matching pairs and evaluated the statements.
          </Alert>
        )}
      </Box>

      {pdfNote && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 4, textAlign: 'center' }}>
          Reference: {pdfNote}
        </Typography>
      )}
    </Box>
  );
};

export default WorkbookActivity;