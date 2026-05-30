import React, { useEffect, useMemo, useState } from 'react';
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
import { useOptionalActivitySession } from '../context/ActivitySessionContext';
import { defaultAiForPageType } from '../utils/aiActivityConfig';
import { gradingOutlineSx } from '../utils/gradingFieldStyle';
import {
  collectWorkbookGradableFields,
  scoreDeterministicBlocks,
  summarizeDeterministicScores,
  workbookFieldId
} from '../utils/workbookFields';

const WorkbookActivity = ({ activityData, onComplete }) => {
  const { title, intro, checks, pdfNote, ai: pageAi = defaultAiForPageType('workbook', activityData) } =
    activityData;

  const session = useOptionalActivitySession();
  const currentPageId = session?.currentPageId ?? activityData.id ?? 'main';
  const setSessionInput = session?.setInput;
  const sessionGrading = session?.grading;

  const blocks = checks?.blocks || [];
  const gradableFields = useMemo(
    () => collectWorkbookGradableFields(blocks, currentPageId, pageAi),
    [blocks, currentPageId, pageAi]
  );

  const [currentStep, setCurrentStep] = useState(0);
  const [tfAnswers, setTfAnswers] = useState({});
  const [matchingComplete, setMatchingComplete] = useState(false);
  const [multiAnswers, setMultiAnswers] = useState({});
  const [mcAnswers, setMcAnswers] = useState({});
  const [textAnswers, setTextAnswers] = useState({});
  const [clozeAnswers, setClozeAnswers] = useState({});
  const [orderStates, setOrderStates] = useState(
    blocks.filter((b) => b.type === 'order').reduce((acc, block) => ({ ...acc, [block.id]: block.items }), {})
  );
  const [submitted, setSubmitted] = useState(false);
  const [localScores, setLocalScores] = useState({});

  useEffect(() => {
    if (!session?.inputs || !session.hydrationToken) return;

    const nextText = {};
    const nextCloze = {};

    gradableFields.forEach((field) => {
      const value = session.inputs[field.fieldId];
      if (value == null) return;
      if (field.kind === 'text') {
        nextText[field.blockId] = { ...(nextText[field.blockId] || {}), [field.index]: value };
      } else {
        nextCloze[field.blockId] = { ...(nextCloze[field.blockId] || {}), [field.index]: value };
      }
    });

    if (Object.keys(nextText).length) {
      setTextAnswers((prev) => {
        const merged = { ...prev };
        Object.entries(nextText).forEach(([blockId, prompts]) => {
          merged[blockId] = { ...(merged[blockId] || {}), ...prompts };
        });
        return merged;
      });
    }

    if (Object.keys(nextCloze).length) {
      setClozeAnswers((prev) => {
        const merged = { ...prev };
        Object.entries(nextCloze).forEach(([blockId, lines]) => {
          merged[blockId] = { ...(merged[blockId] || {}), ...lines };
        });
        return merged;
      });
    }
  }, [session?.hydrationToken, session?.activityKey, session?.inputs, gradableFields]);

  const tfBlocks = blocks.filter((b) => b.type === 'tf');
  const matchingBlock = blocks.find((b) => b.type === 'matching');
  const orderBlocks = blocks.filter((b) => b.type === 'order');

  const hasTf = tfBlocks.length > 0;
  const hasMatching = !!matchingBlock;
  const hasOrder = orderBlocks.length > 0;
  const isMultiStep = (hasTf ? 1 : 0) + (hasMatching ? 1 : 0) + (hasOrder ? 1 : 0) > 1;

  const syncText = (blockId, promptIndex, value) => {
    setTextAnswers((prev) => ({
      ...prev,
      [blockId]: { ...(prev[blockId] || {}), [promptIndex]: value }
    }));
    if (setSessionInput) {
      setSessionInput(workbookFieldId(currentPageId, blockId, `p${promptIndex}`), value);
    }
  };

  const syncCloze = (blockId, lineIndex, value) => {
    setClozeAnswers((prev) => ({
      ...prev,
      [blockId]: { ...(prev[blockId] || {}), [lineIndex]: value }
    }));
    if (setSessionInput) {
      setSessionInput(workbookFieldId(currentPageId, blockId, `l${lineIndex}`), value);
    }
  };

  const handleTfChange = (id, value) => {
    setTfAnswers((prev) => ({ ...prev, [id]: value === 'true' }));
  };

  const handleMultiChange = (blockId, index) => {
    setMultiAnswers((prev) => {
      const current = prev[blockId] || [];
      const next = current.includes(index)
        ? current.filter((i) => i !== index)
        : [...current, index];
      return { ...prev, [blockId]: next };
    });
  };

  const handleMcChange = (blockId, index) => {
    setMcAnswers((prev) => ({ ...prev, [blockId]: index }));
  };

  const handleMoveOrder = (blockId, index, direction) => {
    const newItems = [...orderStates[blockId]];
    const temp = newItems[index];
    newItems[index] = newItems[index + direction];
    newItems[index + direction] = temp;
    setOrderStates((prev) => ({ ...prev, [blockId]: newItems }));
  };

  const visibleBlocks =
    blocks.filter((block) => {
      if (!isMultiStep) return true;
      if (currentStep === 0) {
        return ['tf', 'sectionTitle', 'mc', 'who', 'multi', 'text', 'cloze'].includes(block.type);
      }
      if (currentStep === 1) return block.type === 'matching' || block.type === 'order';
      return true;
    }) || [];

  const isBlockComplete = (block) => {
    switch (block.type) {
      case 'tf':
        return tfAnswers[block.id] !== undefined;
      case 'mc':
      case 'who':
        return mcAnswers[block.id] !== undefined;
      case 'multi':
        return (multiAnswers[block.id] || []).length > 0;
      case 'text':
        return (block.prompts || []).every((_, i) =>
          (textAnswers[block.id]?.[i] || '').trim().length > 0
        );
      case 'cloze':
        return (block.lines || []).every((_, i) =>
          (clozeAnswers[block.id]?.[i] || '').trim().length > 0
        );
      case 'matching':
        return matchingComplete;
      case 'order':
        return true;
      default:
        return true;
    }
  };

  const stepSatisfied = visibleBlocks.every(isBlockComplete);
  const canProceedToMatching = isMultiStep && currentStep === 0 && stepSatisfied;
  const canFinalize = (!isMultiStep || currentStep === 1) && stepSatisfied;

  const blockBorderColor = (blockId) => {
    const score = localScores[blockId];
    if (!score || score.correct == null) return 'divider';
    return score.correct ? 'success.main' : 'error.main';
  };

  const handleNext = () => {
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = () => {
    const scores = scoreDeterministicBlocks(blocks, {
      tf: tfAnswers,
      mc: mcAnswers,
      multi: multiAnswers,
      order: orderStates
    });
    setLocalScores(scores);
    setSubmitted(true);

    const summary = summarizeDeterministicScores(scores);
    const graded = Object.values(scores).filter((s) => s.correct != null);
    const allAutoCorrect = graded.length === 0 || graded.every((s) => s.correct);

    if (onComplete) {
      onComplete({ correct: allAutoCorrect, localScores: scores });
    }
  };

  const scoreSummary = summarizeDeterministicScores(localScores);
  const hasGradableWritten = gradableFields.length > 0;

  return (
    <Box sx={{ p: 2, maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h4" color="text.primary" align="center" gutterBottom sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
        {intro}
      </Typography>

      {hasGradableWritten && !submitted && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
          For written answers, use <strong>Check my answer</strong> in the assistant panel (Teacher mode).
        </Typography>
      )}

      {isMultiStep && (
        <Stepper
          activeStep={currentStep}
          sx={{
            mb: 4,
            p: 1.5,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            bgcolor: 'background.paper'
          }}
        >
          <Step>
            <StepLabel>Richtig oder Falsch?</StepLabel>
          </Step>
          <Step>
            <StepLabel>Matching</StepLabel>
          </Step>
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
            <Paper
              key={block.id}
              elevation={0}
              sx={{
                p: 2,
                mb: 1.25,
                border: '1px solid',
                borderColor: blockBorderColor(block.id),
                borderRadius: 2.5,
                bgcolor: 'background.paper'
              }}
            >
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
                    <FormControlLabel value="true" control={<Radio size="small" />} label={block.trueLabel || 'R'} />
                    <FormControlLabel value="false" control={<Radio size="small" />} label={block.falseLabel || 'F'} />
                  </RadioGroup>
                </FormControl>
              </Box>
              {submitted && localScores[block.id]?.correct === false && (
                <Typography variant="caption" color="error.main" sx={{ mt: 1, display: 'block' }}>
                  {localScores[block.id].feedback}
                </Typography>
              )}
            </Paper>
          );
        }

        if (block.type === 'mc' || block.type === 'who') {
          const options = block.options || ['H', 'E', 'S'];
          return (
            <Paper
              key={block.id}
              elevation={0}
              sx={{
                p: 2,
                mb: 1.25,
                border: '1px solid',
                borderColor: blockBorderColor(block.id),
                borderRadius: 2.5,
                bgcolor: 'background.paper'
              }}
            >
              <Typography variant="body1" sx={{ mb: 1 }}>
                {block.question || block.statement}
              </Typography>
              <RadioGroup
                row
                value={mcAnswers[block.id] ?? ''}
                onChange={(e) => handleMcChange(block.id, parseInt(e.target.value, 10))}
              >
                {options.map((opt, i) => (
                  <FormControlLabel key={i} value={i} control={<Radio size="small" />} label={opt} />
                ))}
              </RadioGroup>
              {submitted && localScores[block.id]?.correct === false && (
                <Typography variant="caption" color="error.main" sx={{ mt: 1, display: 'block' }}>
                  {localScores[block.id].feedback}
                </Typography>
              )}
            </Paper>
          );
        }

        if (block.type === 'multi') {
          return (
            <Paper
              key={block.id}
              elevation={0}
              sx={{
                p: 2,
                mb: 1.25,
                border: '1px solid',
                borderColor: blockBorderColor(block.id),
                borderRadius: 2.5,
                bgcolor: 'background.paper'
              }}
            >
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
              {submitted && localScores[block.id]?.correct === false && (
                <Typography variant="caption" color="error.main" sx={{ mt: 1, display: 'block' }}>
                  {localScores[block.id].feedback}
                </Typography>
              )}
            </Paper>
          );
        }

        if (block.type === 'text') {
          const promptEntries = (block.prompts || []).map((prompt) =>
            typeof prompt === 'string' ? { text: prompt } : prompt
          );

          return (
            <Paper
              key={block.id}
              elevation={0}
              sx={{ p: 2, mb: 1.25, border: '1px solid', borderColor: 'divider', borderRadius: 2.5, bgcolor: 'background.paper' }}
            >
              {promptEntries.map((prompt, i) => {
                const multiline = prompt.multiline ?? block.multiline ?? false;
                const minRows = prompt.minRows ?? block.minRows ?? 6;
                const fieldId = workbookFieldId(currentPageId, block.id, `p${i}`);

                return (
                  <Box key={i} sx={{ mb: i < promptEntries.length - 1 ? 1.5 : 0 }}>
                    <Typography variant="body1" sx={{ mb: 0.75, fontWeight: 700, whiteSpace: 'pre-wrap' }}>
                      {prompt.text}
                    </Typography>
                    <TextField
                      fullWidth
                      variant="outlined"
                      multiline={multiline}
                      minRows={multiline ? minRows : undefined}
                      value={textAnswers[block.id]?.[i] || ''}
                      onChange={(e) => syncText(block.id, i, e.target.value)}
                      disabled={submitted}
                      placeholder={
                        prompt.placeholder || block.placeholder || (multiline ? 'Write your answer here…' : 'Your answer')
                      }
                      sx={gradingOutlineSx(sessionGrading, fieldId)}
                    />
                  </Box>
                );
              })}
            </Paper>
          );
        }

        if (block.type === 'cloze') {
          return (
            <Paper
              key={block.id}
              elevation={0}
              sx={{ p: 2, mb: 1.25, border: '1px solid', borderColor: 'divider', borderRadius: 2.5, bgcolor: 'background.paper' }}
            >
              {block.prompt && (
                <Typography variant="body1" sx={{ mb: 1.5, fontWeight: 700, whiteSpace: 'pre-wrap' }}>
                  {block.prompt}
                </Typography>
              )}
              {(block.lines || []).map((line, i) => {
                const fieldId = workbookFieldId(currentPageId, block.id, `l${i}`);
                return (
                  <Box
                    key={`${block.id}-${i}`}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      mb: i < block.lines.length - 1 ? 1.5 : 0
                    }}
                  >
                    {line.prefix ? <Typography sx={{ mr: 1 }}>{line.prefix}</Typography> : null}
                    <TextField
                      size="small"
                      value={clozeAnswers[block.id]?.[i] || ''}
                      onChange={(e) => syncCloze(block.id, i, e.target.value)}
                      disabled={submitted}
                      placeholder="Your answer"
                      sx={{ width: { xs: '100%', sm: 220 }, mx: 1, ...gradingOutlineSx(sessionGrading, fieldId) }}
                    />
                    {line.suffix ? <Typography sx={{ ml: 1 }}>{line.suffix}</Typography> : null}
                  </Box>
                );
              })}
            </Paper>
          );
        }

        if (block.type === 'matching') {
          return (
            <Box
              key={block.id}
              sx={{ mt: 4, p: 0, border: '1px solid', borderColor: 'divider', borderRadius: 2.5, bgcolor: 'background.paper' }}
            >
              {block.title && (
                <Typography variant="h6" sx={{ px: 2, pt: 2, pb: 1, fontWeight: 'bold' }}>
                  {block.title}
                </Typography>
              )}
              {block.matchInstruction && (
                <Typography variant="body2" color="text.secondary" sx={{ px: 2, pb: 2 }}>
                  {block.matchInstruction}
                </Typography>
              )}
              <MatchingActivity activityData={block} onComplete={() => setMatchingComplete(true)} />
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
              <Paper
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  overflow: 'hidden',
                  borderColor: blockBorderColor(block.id)
                }}
              >
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
                        <ListItemIcon>
                          <DragHandle color="disabled" />
                        </ListItemIcon>
                        <ListItemText primary={item.text} />
                      </ListItem>
                      {i < currentItems.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
              {submitted && localScores[block.id]?.correct === false && (
                <Typography variant="caption" color="error.main" sx={{ mt: 1, display: 'block' }}>
                  {localScores[block.id].feedback}
                </Typography>
              )}
            </Box>
          );
        }

        return null;
      })}

      <Box sx={{ mt: 6, textAlign: 'center' }}>
        {!submitted ? (
          isMultiStep && currentStep === 0 ? (
            <Button variant="contained" size="large" disabled={!canProceedToMatching} onClick={handleNext} sx={{ px: 8 }}>
              Continue to Matching
            </Button>
          ) : (
            <Button variant="contained" size="large" disabled={!canFinalize} onClick={handleSubmit} sx={{ px: 8 }}>
              Submit answers
            </Button>
          )
        ) : (
          <Alert severity="success" sx={{ borderRadius: 2, textAlign: 'left' }}>
            Activity submitted.
            {scoreSummary ? ` ${scoreSummary}` : ''}
            {hasGradableWritten && ' Use Check my answer in the assistant for written responses.'}
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
