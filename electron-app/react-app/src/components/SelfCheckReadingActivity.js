import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
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
import { matchesAnyVariant, containsAllKeywords, checkAutomaticAnswerByMode } from '../utils/answerMatch';
import {
  defaultAiForPageType,
  isGradableAiMode,
  resolveReadingItemAi
} from '../utils/aiActivityConfig';
import { useOptionalActivitySession } from '../context/ActivitySessionContext';
import { gradingOutlineSx } from '../utils/gradingFieldStyle';
import { isChatSuccess, sendChatMessage } from '../services/aiChat';

const SelfCheckReadingActivity = ({ activityData, onComplete }) => {
  const [answersOpen, setAnswersOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [inputs, setInputs] = useState({});
  const [itemResults, setItemResults] = useState(null);
  const [optionalAck, setOptionalAck] = useState({});
  const [checking, setChecking] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [hintNotes, setHintNotes] = useState([]);
  const [revealedKeywords, setRevealedKeywords] = useState({});
  const [hintLoading, setHintLoading] = useState(false);

  const session = useOptionalActivitySession();
  const setSessionInput = session?.setInput;
  const currentPageId = session?.currentPageId ?? null;
  const aiEnabled = session?.aiEnabled ?? false;
  const grading = session?.grading ?? {};

  const { title, intro, readingItems = [], pdfNote, ai: pageAi = defaultAiForPageType('reading_self_check', activityData) } =
    activityData;

  const itemAiFor = useCallback((item) => resolveReadingItemAi(pageAi, item), [pageAi]);

  const fieldIdForItem = useCallback(
    (itemId) => {
      const pagePart = currentPageId ? `${currentPageId}_` : '';
      return `reading_${pagePart}${itemId}`;
    },
    [currentPageId]
  );

  const hintBudget = typeof pageAi.allowHints === 'number' ? pageAi.allowHints : null;
  const modelAnswersLocked = hintBudget != null && hintsUsed < hintBudget;

  useEffect(() => {
    if (!session?.inputs || !session.hydrationToken) return;

    setInputs((prev) => {
      const next = { ...prev };
      readingItems.forEach((item) => {
        const value = session.inputs[fieldIdForItem(item.id)];
        if (value != null) next[item.id] = value;
      });
      return next;
    });
  }, [session?.hydrationToken, session?.activityKey, fieldIdForItem, readingItems]);

  useEffect(() => {
    setHintsUsed(0);
    setHintNotes([]);
    setRevealedKeywords({});
    setAnswersOpen(false);
  }, [session?.activityKey, currentPageId]);

  const scoredItems = readingItems.filter((it) => !it.acknowledgeLabel);
  const gradableItems = scoredItems.filter((it) => isGradableAiMode(itemAiFor(it).grading));
  const autoItems = gradableItems.filter((it) => {
    const mode = itemAiFor(it).grading;
    return mode === 'exact' || mode === 'keywords';
  });
  const semanticItems = gradableItems.filter((it) => itemAiFor(it).grading === 'semantic');
  const honorItems = scoredItems.filter((it) => itemAiFor(it).grading === 'honor');
  const ackItems = readingItems.filter((it) => it.acknowledgeLabel);

  const requirePass = pageAi.requirePass ?? false;

  const fieldGradedCorrect = (item) => grading[fieldIdForItem(item.id)]?.correct === true;

  const validateAutoLocal = () => {
    const next = {};
    let allOk = true;
    autoItems.forEach((it) => {
      const raw = inputs[it.id] ?? '';
      const mode = itemAiFor(it).grading;
      let ok = false;
      if (mode === 'keywords' && it.keywords?.length) {
        ok = containsAllKeywords(raw, it.keywords);
      } else if (mode === 'exact' && it.acceptedAnswers?.length) {
        ok = matchesAnyVariant(raw, it.acceptedAnswers);
      } else {
        ok = checkAutomaticAnswerByMode(raw, {
          acceptedAnswers: it.acceptedAnswers,
          keywords: it.keywords,
          mode
        });
      }
      next[it.id] = Boolean(ok);
      if (!ok) allOk = false;
    });
    setItemResults(next);
    return allOk;
  };

  const handleCheck = async () => {
    if (session?.checkMyAnswer) {
      setChecking(true);
      try {
        await session.checkMyAnswer();
      } finally {
        setChecking(false);
      }
      return;
    }
    validateAutoLocal();
  };

  const handleGetHint = async () => {
    if (hintBudget != null && hintsUsed >= hintBudget) return;

    const target =
      scoredItems.find((it) => {
        if (!isGradableAiMode(itemAiFor(it).grading)) return false;
        const fieldId = fieldIdForItem(it.id);
        return session ? grading[fieldId]?.correct !== true : !itemResults?.[it.id];
      }) || scoredItems[0];

    if (!target) return;

    setHintLoading(true);
    try {
      const mode = itemAiFor(target).grading;
      if (mode === 'keywords' && target.keywords?.length) {
        const revealed = revealedKeywords[target.id] || 0;
        const keywordGroup = target.keywords[revealed];
        if (keywordGroup) {
          setRevealedKeywords((prev) => ({ ...prev, [target.id]: revealed + 1 }));
          setHintNotes((prev) => [
            ...prev,
            `Hint for “${target.prompt.slice(0, 60)}${target.prompt.length > 60 ? '…' : ''}”: try to include the idea “${keywordGroup}”.`
          ]);
          setHintsUsed((count) => count + 1);
          return;
        }
      }

      if (aiEnabled) {
        const result = await sendChatMessage({
          persona: 'teacher',
          message: `Give one short hint (two sentences maximum) for this reading question without revealing the full model answer:\n\n${target.prompt}`,
          activityBrief: '',
          messages: []
        });
        if (isChatSuccess(result)) {
          setHintNotes((prev) => [...prev, result.content]);
        } else {
          setHintNotes((prev) => [...prev, result.error || 'Could not fetch a hint right now.']);
        }
      } else {
        setHintNotes((prev) => [
          ...prev,
          'Re-read the passage and underline words that relate to the question before checking model answers.'
        ]);
      }
      setHintsUsed((count) => count + 1);
    } finally {
      setHintLoading(false);
    }
  };

  const acksComplete = ackItems.every((it) => optionalAck[it.id]);

  const honorOk =
    honorItems.length === 0 ||
    honorItems.every((it) => (inputs[it.id] ?? '').trim().length > 0);

  const autoOk =
    autoItems.length === 0 ||
    (session ? autoItems.every(fieldGradedCorrect) : itemResults && autoItems.every((it) => itemResults[it.id]));

  const semanticOk =
    semanticItems.length === 0 ||
    (!requirePass && !aiEnabled) ||
    (session && semanticItems.every(fieldGradedCorrect));

  const canComplete = autoOk && semanticOk && honorOk && acksComplete;

  const handleComplete = () => {
    if (!canComplete) return;
    setDone(true);
    if (onComplete) {
      onComplete({ correct: true });
    }
  };

  const showCheckButton = gradableItems.length > 0;
  const showHintButton = hintBudget != null && hintsUsed < hintBudget;

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
        Type your answers below. Use Check my answers or the assistant panel.
        {hintBudget != null
          ? ` Use Get hint (${hintsUsed}/${hintBudget}) before opening model answers.`
          : ' Open model answers when you want to compare wording.'}
      </Typography>

      {hintNotes.length > 0 && (
        <Box sx={{ mb: 2, display: 'grid', gap: 1 }}>
          {hintNotes.map((note, idx) => (
            <Alert key={`hint-${idx}`} severity="info" sx={{ py: 0.5 }}>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {note}
              </Typography>
            </Alert>
          ))}
        </Box>
      )}

      {readingItems.length > 0 && (
        <Paper elevation={0} sx={{ p: 2, mb: 2, border: 1, borderColor: 'divider' }}>
          {readingItems.map((item, idx) => {
            const fieldId = fieldIdForItem(item.id);
            const itemAi = itemAiFor(item);
            const hasAuto = itemAi.grading === 'exact' || itemAi.grading === 'keywords';
            const grade = grading[fieldId];
            const checked = session ? grade?.correct === true : itemResults && itemResults[item.id];
            const failed = session
              ? grade?.ok && grade?.correct === false
              : itemResults && itemResults[item.id] === false;

            return (
              <Box
                key={item.id ?? idx}
                sx={{
                  pb: idx < readingItems.length - 1 ? 2 : 0,
                  mb: idx < readingItems.length - 1 ? 2 : 0,
                  borderBottom: idx < readingItems.length - 1 ? 1 : 0,
                  borderColor: 'divider'
                }}
              >
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  {item.prompt}
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  size="small"
                  sx={{
                    mt: 1,
                    mb: 1,
                    ...(session
                      ? gradingOutlineSx(grading, fieldId)
                      : {
                          '& .MuiOutlinedInput-notchedOutline':
                            hasAuto && failed
                              ? { borderColor: 'error.main' }
                              : hasAuto && checked
                                ? { borderColor: 'success.main' }
                                : undefined
                        })
                  }}
                  value={inputs[item.id] ?? ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    setInputs((prev) => ({ ...prev, [item.id]: value }));
                    if (setSessionInput) {
                      setSessionInput(fieldId, value);
                    }
                    setItemResults(null);
                  }}
                  placeholder="Your answer"
                />
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
              </Box>
            );
          })}
        </Paper>
      )}

      {showCheckButton && (
        <Button
          variant="outlined"
          onClick={handleCheck}
          disabled={checking || session?.status === 'grading'}
          sx={{ alignSelf: 'flex-start', mb: 2 }}
        >
          {checking || session?.status === 'grading' ? 'Checking…' : 'Check my answers'}
        </Button>
      )}

      {showHintButton && (
        <Button
          variant="outlined"
          onClick={handleGetHint}
          disabled={hintLoading}
          sx={{ alignSelf: 'flex-start', mb: 2, ml: showCheckButton ? 0 : 0 }}
        >
          {hintLoading ? 'Getting hint…' : `Get hint (${hintsUsed}/${hintBudget})`}
        </Button>
      )}

      <Button
        variant="outlined"
        onClick={() => !modelAnswersLocked && setAnswersOpen(!answersOpen)}
        endIcon={answersOpen ? <ExpandLess /> : <ExpandMore />}
        disabled={modelAnswersLocked}
        sx={{ alignSelf: 'flex-start', mb: 2 }}
      >
        {modelAnswersLocked
          ? `Show model answers (${hintBudget - hintsUsed} hint${hintBudget - hintsUsed === 1 ? '' : 's'} left)`
          : answersOpen
            ? 'Hide model answers'
            : 'Show model answers'}
      </Button>

      {pdfNote && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
          {pdfNote}
        </Typography>
      )}

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
          {gradableItems.length > 0 && !canComplete && requirePass && 'Check answers until scored items pass. '}
          {gradableItems.length > 0 && !canComplete && !requirePass && semanticItems.length > 0 && 'Use Check my answers for feedback, or mark complete when ready. '}
          {semanticItems.length > 0 && requirePass && !aiEnabled && 'Enable AI in Settings for semantic answer checking on open-ended items. '}
          {ackItems.length > 0 && !acksComplete && 'Complete all required acknowledgements. '}
        </Typography>
      )}
    </Box>
  );
};

export default SelfCheckReadingActivity;
