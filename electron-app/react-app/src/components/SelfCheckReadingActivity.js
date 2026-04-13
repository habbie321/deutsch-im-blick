import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Collapse,
  FormControlLabel,
  Checkbox,
  Divider,
  TextField
} from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { matchesAnyVariant, containsAllKeywords } from '../utils/answerMatch';

const SelfCheckReadingActivity = ({ activityData, onComplete }) => {
  const [answersOpen, setAnswersOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [done, setDone] = useState(false);
  const [inputs, setInputs] = useState({});
  const [itemResults, setItemResults] = useState(null);
  const [optionalAck, setOptionalAck] = useState({});

  const { title, intro, readingItems = [], pdfNote } = activityData;

  const autoItems = readingItems.filter((it) => it.acceptedAnswers?.length || it.keywords?.length);
  const ackItems = readingItems.filter((it) => it.acknowledgeLabel);

  const validateAuto = () => {
    const next = {};
    let allOk = true;
    autoItems.forEach((it) => {
      const raw = inputs[it.id] ?? '';
      let ok = false;
      if (it.keywords?.length) {
        ok = containsAllKeywords(raw, it.keywords);
      } else if (it.acceptedAnswers?.length) {
        ok = matchesAnyVariant(raw, it.acceptedAnswers);
      }
      next[it.id] = ok;
      if (!ok) allOk = false;
    });
    setItemResults(next);
    return allOk;
  };

  const acksComplete = ackItems.every((it) => optionalAck[it.id]);

  const canComplete =
    confirmed &&
    (autoItems.length === 0 || (itemResults && autoItems.every((it) => itemResults[it.id]))) &&
    (ackItems.length === 0 || acksComplete);

  const handleComplete = () => {
    if (!canComplete) return;
    setDone(true);
    if (onComplete) {
      onComplete({ correct: true });
    }
  };

  return (
    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', maxWidth: 720, mx: 'auto', width: '100%' }}>
      <Typography variant="h4" component="h2" gutterBottom color="primary" sx={{ textAlign: 'center' }}>
        {title}
      </Typography>
      {intro && (
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          {intro}
        </Typography>
      )}

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Type your answers where boxes appear, then use <strong>Check my answers</strong>. Open model answers when you want to compare wording.
      </Typography>

      {readingItems.map((item, i) => {
        const hasAuto = !!(item.acceptedAnswers?.length || item.keywords?.length);
        const checked = itemResults && itemResults[item.id];
        const failed = itemResults && itemResults[item.id] === false;

        return (
          <Paper
            key={item.id ?? i}
            elevation={0}
            sx={{
              p: 2,
              mb: 2,
              border: 1,
              borderColor: hasAuto && failed ? 'error.main' : hasAuto && checked ? 'success.main' : 'divider'
            }}
          >
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              {item.prompt}
            </Typography>
            {hasAuto && (
              <TextField
                fullWidth
                size="small"
                sx={{ mt: 1, mb: 1 }}
                value={inputs[item.id] ?? ''}
                onChange={(e) => {
                  setInputs((prev) => ({ ...prev, [item.id]: e.target.value }));
                  setItemResults(null);
                }}
                placeholder="Your answer"
              />
            )}
            {item.acknowledgeLabel && (
              <FormControlLabel
                sx={{ display: 'block', mt: 1 }}
                control={
                  <Checkbox
                    checked={!!optionalAck[item.id]}
                    onChange={(e) => setOptionalAck((prev) => ({ ...prev, [item.id]: e.target.checked }))}
                  />
                }
                label={item.acknowledgeLabel}
              />
            )}
            <Collapse in={answersOpen}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                <strong>Model answer:</strong> {item.modelAnswer}
              </Typography>
            </Collapse>
          </Paper>
        );
      })}

      {autoItems.length > 0 && (
        <Button variant="outlined" onClick={validateAuto} sx={{ alignSelf: 'flex-start', mb: 2 }}>
          Check my answers
        </Button>
      )}

      <Button
        variant="outlined"
        onClick={() => setAnswersOpen(!answersOpen)}
        endIcon={answersOpen ? <ExpandLess /> : <ExpandMore />}
        sx={{ alignSelf: 'flex-start', mb: 2 }}
      >
        {answersOpen ? 'Hide model answers' : 'Show model answers'}
      </Button>

      {pdfNote && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
          {pdfNote}
        </Typography>
      )}

      <FormControlLabel
        control={<Checkbox checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />}
        label="I have read the embassy notice and related instructions in the workbook."
      />

      {!done ? (
        <Button
          variant="contained"
          size="large"
          disabled={!canComplete}
          onClick={handleComplete}
          sx={{ alignSelf: 'center', mt: 2, borderRadius: 2 }}
        >
          Mark activity complete
        </Button>
      ) : (
        <Typography variant="body1" color="success.main" sx={{ textAlign: 'center', mt: 2 }}>
          Activity complete.
        </Typography>
      )}

      {!done && (
        <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', mt: 1, display: 'block' }}>
          {!confirmed && 'Confirm the checklist above. '}
          {autoItems.length > 0 && (!itemResults || !autoItems.every((it) => itemResults[it.id])) && 'Use Check my answers until all scored items are correct. '}
          {ackItems.length > 0 && !acksComplete && 'Tick the boxes for items you complete from the printed map or directory. '}
        </Typography>
      )}
    </Box>
  );
};

export default SelfCheckReadingActivity;
