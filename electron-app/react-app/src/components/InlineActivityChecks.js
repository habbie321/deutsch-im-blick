import React, { useMemo, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormGroup,
  Checkbox,
  TextField,
  IconButton,
  Divider
} from '@mui/material';
import { KeyboardArrowUp, KeyboardArrowDown } from '@mui/icons-material';
import { matchesAnyVariant, containsAllKeywords } from '../utils/answerMatch';

function shuffleIds(ids) {
  const a = [...ids];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * @param {{ blocks: object[], onSatisfiedChange: (ok: boolean) => void }} props
 */
const InlineActivityChecks = ({ blocks = [], onSatisfiedChange }) => {
  const [mc, setMc] = useState({});
  const [multi, setMulti] = useState({});
  const [tf, setTf] = useState({});
  const [short, setShort] = useState({});
  const [who, setWho] = useState({});
  const [orderState, setOrderState] = useState({});

  const orderInit = useMemo(() => {
    const init = {};
    blocks.forEach((b) => {
      if (b.type === 'order' && b.id != null && b.items?.length) {
        init[b.id] = shuffleIds(b.items.map((it) => it.id));
      }
    });
    return init;
  }, [blocks]);

  const mergedOrder = useCallback(
    (blockId) => orderState[blockId] ?? orderInit[blockId] ?? [],
    [orderState, orderInit]
  );

  const [results, setResults] = useState(null);

  const validate = () => {
    const next = {};
    let allOk = true;

    blocks.forEach((b) => {
      if (b.type === 'sectionTitle') return;
      if (b.type === 'mc') {
        const v = mc[b.id];
        const ok = v === b.correctIndex;
        next[b.id] = ok;
        if (!ok) allOk = false;
      }
      if (b.type === 'multi') {
        const sel = multi[b.id] || [];
        const want = [...(b.correctIndices || [])].sort((a, b) => a - b);
        const got = [...sel].sort((a, b) => a - b);
        const ok = want.length === got.length && want.every((x, i) => x === got[i]);
        next[b.id] = ok;
        if (!ok) allOk = false;
      }
      if (b.type === 'tf') {
        const v = tf[b.id];
        const ok = v === b.correct;
        next[b.id] = ok;
        if (!ok) allOk = false;
      }
      if (b.type === 'short') {
        const raw = short[b.id] || '';
        let ok = false;
        if (b.keywords?.length) {
          ok = containsAllKeywords(raw, b.keywords);
        } else if (b.acceptedAnswers?.length) {
          ok = matchesAnyVariant(raw, b.acceptedAnswers);
        }
        next[b.id] = ok;
        if (!ok) allOk = false;
      }
      if (b.type === 'who') {
        const picked = who[b.id] || { H: false, E: false, S: false };
        const letters = ['H', 'E', 'S'].filter((L) => picked[L]).sort().join('');
        const want = [...(b.correctLetters || [])].sort().join('');
        const ok = letters === want;
        next[b.id] = ok;
        if (!ok) allOk = false;
      }
      if (b.type === 'order') {
        const ord = mergedOrder(b.id);
        const want = b.correctOrder || [];
        const ok = ord.length === want.length && ord.every((id, i) => id === want[i]);
        next[b.id] = ok;
        if (!ok) allOk = false;
      }
    });

    setResults(next);
    onSatisfiedChange(allOk);
    return allOk;
  };

  const moveOrder = (blockId, index, dir) => {
    const list = [...mergedOrder(blockId)];
    const j = index + dir;
    if (j < 0 || j >= list.length) return;
    [list[index], list[j]] = [list[j], list[index]];
    setOrderState((prev) => ({ ...prev, [blockId]: list }));
    setResults(null);
    onSatisfiedChange(false);
  };

  const renderBlock = (b, i) => {
    const err = results && results[b.id] === false;
    const ok = results && results[b.id] === true;

    if (b.type === 'sectionTitle') {
      return (
        <Typography key={`t-${i}`} variant="subtitle1" fontWeight="bold" sx={{ mt: i > 0 ? 2 : 0, mb: 1 }}>
          {b.text}
        </Typography>
      );
    }

    if (b.type === 'mc') {
      return (
        <Paper key={b.id} elevation={0} sx={{ p: 2, mb: 2, border: 1, borderColor: err ? 'error.main' : ok ? 'success.main' : 'divider' }}>
          <Typography variant="body2" fontWeight="medium" gutterBottom>
            {b.question}
          </Typography>
          <RadioGroup
            value={mc[b.id] ?? ''}
            onChange={(e) => {
              setMc((prev) => ({ ...prev, [b.id]: parseInt(e.target.value, 10) }));
              setResults(null);
              onSatisfiedChange(false);
            }}
          >
            {(b.options || []).map((opt, j) => (
              <FormControlLabel key={j} value={j} control={<Radio size="small" />} label={opt} />
            ))}
          </RadioGroup>
        </Paper>
      );
    }

    if (b.type === 'multi') {
      const sel = multi[b.id] || [];
      return (
        <Paper key={b.id} elevation={0} sx={{ p: 2, mb: 2, border: 1, borderColor: err ? 'error.main' : ok ? 'success.main' : 'divider' }}>
          <Typography variant="body2" fontWeight="medium" gutterBottom>
            {b.question}
          </Typography>
          <FormGroup>
            {(b.options || []).map((opt, j) => (
              <FormControlLabel
                key={j}
                control={
                  <Checkbox
                    size="small"
                    checked={sel.includes(j)}
                    onChange={() => {
                      setMulti((prev) => {
                        const cur = prev[b.id] || [];
                        const next = cur.includes(j) ? cur.filter((x) => x !== j) : [...cur, j];
                        return { ...prev, [b.id]: next };
                      });
                      setResults(null);
                      onSatisfiedChange(false);
                    }}
                  />
                }
                label={opt}
              />
            ))}
          </FormGroup>
        </Paper>
      );
    }

    if (b.type === 'tf') {
      return (
        <Paper key={b.id} elevation={0} sx={{ p: 2, mb: 2, border: 1, borderColor: err ? 'error.main' : ok ? 'success.main' : 'divider' }}>
          <Typography variant="body2" gutterBottom>
            {b.statement}
          </Typography>
          <RadioGroup
            row
            value={tf[b.id] === undefined ? '' : tf[b.id] ? 't' : 'f'}
            onChange={(e) => {
              setTf((prev) => ({ ...prev, [b.id]: e.target.value === 't' }));
              setResults(null);
              onSatisfiedChange(false);
            }}
          >
            <FormControlLabel value="t" control={<Radio size="small" />} label="Richtig" />
            <FormControlLabel value="f" control={<Radio size="small" />} label="Falsch" />
          </RadioGroup>
        </Paper>
      );
    }

    if (b.type === 'short') {
      return (
        <Paper key={b.id} elevation={0} sx={{ p: 2, mb: 2, border: 1, borderColor: err ? 'error.main' : ok ? 'success.main' : 'divider' }}>
          <Typography variant="body2" fontWeight="medium" gutterBottom>
            {b.prompt}
          </Typography>
          <TextField
            fullWidth
            size="small"
            value={short[b.id] ?? ''}
            onChange={(e) => {
              setShort((prev) => ({ ...prev, [b.id]: e.target.value }));
              setResults(null);
              onSatisfiedChange(false);
            }}
            placeholder={b.placeholder || ''}
          />
          {b.hint && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              {b.hint}
            </Typography>
          )}
        </Paper>
      );
    }

    if (b.type === 'who') {
      const picked = who[b.id] || { H: false, E: false, S: false };
      return (
        <Paper key={b.id} elevation={0} sx={{ p: 2, mb: 2, border: 1, borderColor: err ? 'error.main' : ok ? 'success.main' : 'divider' }}>
          <Typography variant="body2" gutterBottom>
            {b.statement}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            Select everyone who said this (H = Hassan, E = Erin, S = Sophia).
          </Typography>
          <FormGroup row>
            {['H', 'E', 'S'].map((L) => (
              <FormControlLabel
                key={L}
                control={
                  <Checkbox
                    size="small"
                    checked={!!picked[L]}
                    onChange={() => {
                      setWho((prev) => ({
                        ...prev,
                        [b.id]: { ...(prev[b.id] || { H: false, E: false, S: false }), [L]: !(prev[b.id]?.[L]) }
                      }));
                      setResults(null);
                      onSatisfiedChange(false);
                    }}
                  />
                }
                label={L}
              />
            ))}
          </FormGroup>
        </Paper>
      );
    }

    if (b.type === 'order') {
      const ord = mergedOrder(b.id);
      const byId = Object.fromEntries((b.items || []).map((it) => [it.id, it.text]));
      return (
        <Paper key={b.id} elevation={0} sx={{ p: 2, mb: 2, border: 1, borderColor: err ? 'error.main' : ok ? 'success.main' : 'divider' }}>
          <Typography variant="body2" fontWeight="medium" gutterBottom>
            {b.instruction || 'Put the steps in the correct order (first step at the top).'}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {ord.map((id, idx) => (
              <Box key={id} sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'action.hover', borderRadius: 1, p: 1 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2">{byId[id]}</Typography>
                </Box>
                <IconButton size="small" onClick={() => moveOrder(b.id, idx, -1)} disabled={idx === 0}>
                  <KeyboardArrowUp />
                </IconButton>
                <IconButton size="small" onClick={() => moveOrder(b.id, idx, 1)} disabled={idx === ord.length - 1}>
                  <KeyboardArrowDown />
                </IconButton>
              </Box>
            ))}
          </Box>
        </Paper>
      );
    }

    return null;
  };

  if (!blocks.length) {
    return null;
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Divider sx={{ mb: 2 }} />
      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        Answer check
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Answer the questions below, then click <strong>Check answers</strong>. You can complete this activity only after everything here is correct.
      </Typography>
      {blocks.map((b, i) => renderBlock(b, i))}
      <Button variant="contained" color="secondary" onClick={validate} sx={{ mt: 1 }}>
        Check answers
      </Button>
      {results && (
        <Typography
          variant="body2"
          sx={{ mt: 2 }}
          color={Object.values(results).every((v) => v === true) ? 'success.main' : 'error.main'}
        >
          {Object.values(results).every((v) => v === true)
            ? 'All checks passed — you can mark the activity complete.'
            : 'Some answers need correction. Adjust and check again.'}
        </Typography>
      )}
    </Box>
  );
};

export default InlineActivityChecks;
