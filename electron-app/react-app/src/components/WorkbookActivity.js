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
  TextField,
  Checkbox,
  FormGroup,
  Stepper,
  Step,
  StepLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton
} from '@mui/material';
import { ArrowUpward, ArrowDownward, DragHandle } from '@mui/icons-material';
import MatchingActivity from './MatchingActivity';

const WorkbookActivity = ({ activityData, onComplete }) => {
  const { title, intro, checks, pdfNote } = activityData;
  const [currentStep, setCurrentStep] = useState(0);
  const [tfAnswers, setTfAnswers] = useState({});
  const [matchingComplete, setMatchingComplete] = useState(false);
  const [multiAnswers, setMultiAnswers] = useState({});
  const [mcAnswers, setMcAnswers] = useState({});
  const [textAnswers, setTextAnswers] = useState({});
  const [orderStates, setOrderStates] = useState(
    checks?.blocks
      .filter(b => b.type === 'order')
      .reduce((acc, block) => ({ ...acc, [block.id]: block.items }), {})
  );
  const [submitted, setSubmitted] = useState(false);

  const tfBlocks = checks?.blocks.filter(b => b.type === 'tf') || [];
  const matchingBlock = checks?.blocks.find(b => b.type === 'matching');
  const orderBlocks = checks?.blocks.filter(b => b.type === 'order') || [];

  // Determine if we should split this into steps
  const hasTf = tfBlocks.length > 0;
  const hasMatching = !!matchingBlock;
  const hasOrder = orderBlocks.length > 0;
  const isMultiStep = (hasTf ? 1 : 0) + (hasMatching ? 1 : 0) + (hasOrder ? 1 : 0) > 1;

  const handleTfChange = (id, value) => {
    setTfAnswers(prev => ({ ...prev, [id]: value === 'true' }));
  };

  const handleMultiChange = (blockId, index) => {
    setMultiAnswers(prev => {
      const current = prev[blockId] || [];
      const next = current.includes(index)
        ? current.filter(i => i !== index)
        : [...current, index];
      return { ...prev, [blockId]: next };
    });
  };

  const handleMcChange = (blockId, index) => {
    setMcAnswers(prev => ({ ...prev, [blockId]: index }));
  };

  const handleMoveOrder = (blockId, index, direction) => {
    const newItems = [...orderStates[blockId]];
    const temp = newItems[index];
    newItems[index] = newItems[index + direction];
    newItems[index + direction] = temp;
    setOrderStates(prev => ({ ...prev, [blockId]: newItems }));
  };

  const handleTextChange = (blockId, promptIndex, value) => {
    setTextAnswers(prev => ({
      ...prev,
      [blockId]: { ...(prev[blockId] || {}), [promptIndex]: value }
    }));
  };

  // Determine blocks for the current view
  const visibleBlocks = checks?.blocks.filter(block => {
    if (!isMultiStep) return true;
    if (currentStep === 0) return ['tf', 'sectionTitle', 'mc', 'who', 'multi', 'text'].includes(block.type);
    if (currentStep === 1) return block.type === 'matching' || block.type === 'order';
    return true;
  }) || [];

  // Helper to check if a specific block is "answered"
  const isBlockComplete = (block) => {
    switch (block.type) {
      case 'tf': return tfAnswers[block.id] !== undefined;
      case 'mc':
      case 'who': return mcAnswers[block.id] !== undefined;
      case 'multi': return (multiAnswers[block.id] || []).length > 0;
      case 'text': 
        return true; // Text prompts in workbooks are usually optional/supplemental
      case 'matching': return matchingComplete;
      case 'order': return true; // Order blocks are always in a valid state
      default: return true; // sectionTitle or unknown types don't block
    }
  };

  const stepSatisfied = visibleBlocks.every(isBlockComplete);

  const canProceedToMatching = isMultiStep && currentStep === 0 && stepSatisfied;
  const canFinalize = (!isMultiStep || currentStep === 1) && stepSatisfied;

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

      {visibleBlocks.map((block, index) => {
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
                    <FormControlLabel value="true" control={<Radio size="small" />} label={block.trueLabel || "R"} />
                    <FormControlLabel value="false" control={<Radio size="small" />} label={block.falseLabel || "F"} />
                  </RadioGroup>
                </FormControl>
              </Box>
            </Paper>
          );
        }

        if (block.type === 'mc' || block.type === 'who') {
          const options = block.options || ['H', 'E', 'S']; // Default for 'who' type
          return (
            <Paper key={block.id} elevation={0} sx={{ p: 2, mb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="body1" sx={{ mb: 1 }}>{block.question || block.statement}</Typography>
              <RadioGroup
                row
                value={mcAnswers[block.id] ?? ''}
                onChange={(e) => handleMcChange(block.id, parseInt(e.target.value))}
              >
                {options.map((opt, i) => (
                  <FormControlLabel 
                    key={i} 
                    value={i} 
                    control={<Radio size="small" />} 
                    label={opt} 
                  />
                ))}
              </RadioGroup>
            </Paper>
          );
        }

        if (block.type === 'multi') {
          return (
            <Paper key={block.id} elevation={0} sx={{ p: 2, mb: 1 }}>
              <Typography variant="body1" sx={{ mb: 1, fontWeight: 'medium' }}>
                {block.question}
              </Typography>
              <FormGroup>
                {block.options.map((opt, i) => (
                  <FormControlLabel
                    key={i}
                    control={
                      <Checkbox
                        size="small"
                        checked={(multiAnswers[block.id] || []).includes(i)}
                        onChange={() => handleMultiChange(block.id, i)}
                      />
                    }
                    label={opt}
                  />
                ))}
              </FormGroup>
            </Paper>
          );
        }

        if (block.type === 'text') {
          return (
            <Box key={block.id} sx={{ mb: 3 }}>
              {block.prompts.map((prompt, i) => (
                <TextField
                  key={i}
                  fullWidth
                  label={prompt}
                  variant="standard"
                  value={textAnswers[block.id]?.[i] || ''}
                  onChange={(e) => handleTextChange(block.id, i, e.target.value)}
                  disabled={submitted}
                  sx={{ mb: 2 }}
                  InputProps={{
                    sx: { fontStyle: 'italic' }
                  }}
                />
              ))}
            </Box>
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

        if (block.type === 'order') {
          const currentItems = orderStates[block.id] || [];
          return (
            <Box key={block.id} sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {block.instruction}
              </Typography>
              <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <List disablePadding>
                  {currentItems.map((item, i) => (
                    <React.Fragment key={item.id}>
                      <ListItem
                        secondaryAction={
                          <Box>
                            <IconButton 
                              disabled={i === 0 || submitted} 
                              onClick={() => handleMoveOrder(block.id, i, -1)}
                            >
                              <ArrowUpward />
                            </IconButton>
                            <IconButton 
                              disabled={i === currentItems.length - 1 || submitted} 
                              onClick={() => handleMoveOrder(block.id, i, 1)}
                            >
                              <ArrowDownward />
                            </IconButton>
                          </Box>
                        }
                      >
                        <ListItemIcon><DragHandle color="disabled" /></ListItemIcon>
                        <ListItemText primary={item.text} />
                      </ListItem>
                      {i < currentItems.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
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