import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Radio,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  Divider
} from '@mui/material';
import VideoPlayer from './VideoPlayer';

/**
 * ClassificationGridActivity
 * Specialized component for Activity 11 where users classify speakers
 * into categories (Morgenmensch, Nachtmensch, etc.) after watching videos.
 */
const ClassificationGridActivity = ({ activityData, onComplete }) => {
  const [selections, setSelections] = useState({});
  const [results, setResults] = useState(null);
  const [done, setDone] = useState(false);

  const { title, intro, videos = [], grid = {}, pdfNote, chapter } = activityData;
  const { categories = [], items = [] } = grid;

  const handleCheck = () => {
    const next = {};
    let allOk = true;
    
    items.forEach((item) => {
      const isOk = selections[item.id] === item.correctIndex;
      next[item.id] = isOk;
      if (!isOk) allOk = false;
    });

    setResults(next);
    return allOk;
  };

  const handleComplete = () => {
    setDone(true);
    if (onComplete) {
      onComplete({ correct: true });
    }
  };

  const allSelected = items.every((item) => selections[item.id] !== undefined);
  const isFullyCorrect = results && Object.values(results).every((v) => v === true);

  return (
    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', maxWidth: 900, mx: 'auto', width: '100%' }}>
      <Typography variant="h4" component="h2" gutterBottom color="primary" sx={{ textAlign: 'center' }}>
        {title}
      </Typography>
      {intro && (
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {intro}
        </Typography>
      )}

      {/* Video Grid */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {videos.map((vid, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <VideoPlayer
              src={`app://${vid.path}`}
              title={vid.label}
              relativePath={vid.path}
              fallbackUrl={`https://coerll.utexas.edu/dib/toc.php?k=${chapter}`}
              sx={{ mb: 1 }}
            />
            <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', textAlign: 'center' }}>
              {vid.label}
            </Typography>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ mb: 4 }} />

      {/* Classification Table */}
      <Paper elevation={2} sx={{ p: 2, mb: 3, border: results && !isFullyCorrect ? 1 : 0, borderColor: 'error.main' }}>
        <Typography variant="h6" gutterBottom>
          Classification
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Sprecher(in)</TableCell>
                {categories.map((cat, idx) => (
                  <TableCell key={idx} align="center" sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}>
                    {cat}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow 
                  key={item.id} 
                  sx={{ 
                    bgcolor: results && results[item.id] === false ? '#fff5f5' : 'inherit',
                    transition: 'background-color 0.3s'
                  }}
                >
                  <TableCell sx={{ fontSize: '0.9rem', py: 1.5 }}>{item.label}</TableCell>
                  {categories.map((_, catIdx) => (
                    <TableCell key={catIdx} align="center">
                      <Radio
                        size="small"
                        checked={selections[item.id] === catIdx}
                        onChange={() => {
                          setSelections(prev => ({ ...prev, [item.id]: catIdx }));
                          setResults(null);
                        }}
                        disabled={done}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, mb: 4 }}>
        {!isFullyCorrect && (
          <Button variant="contained" color="secondary" onClick={handleCheck} disabled={!allSelected}>
            Check answers
          </Button>
        )}

        {isFullyCorrect && !done && (
          <Button variant="contained" color="success" onClick={handleComplete} size="large">
            Mark activity complete
          </Button>
        )}

        {done && (
          <Typography variant="h6" color="success.main">Activity Complete!</Typography>
        )}
      </Box>

      {pdfNote && <Typography variant="caption" color="text.secondary">{pdfNote}</Typography>}
    </Box>
  );
};

export default ClassificationGridActivity;