import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper
} from '@mui/material';
import { EditNote } from '@mui/icons-material';

/**
 * ClozeActivity
 * A fill-in-the-blanks style component for personalizing phrases or refrains.
 * Lines are rendered with a prefix, an input field, and a suffix.
 */
const ClozeActivity = ({ activityData, onComplete }) => {
  const { title, intro, lines = [], examples = [], pdfNote } = activityData;
  
  // Initialize inputs based on the number of lines provided in data
  const [inputs, setInputs] = useState(() => lines.map(() => ''));
  const [done, setDone] = useState(false);

  const handleComplete = () => {
    // Ensure all blanks have at least some text
    if (inputs.some(v => v.trim().length === 0)) return;
    
    setDone(true);
    if (onComplete) {
      onComplete({ correct: true, responses: inputs });
    }
  };

  const handleInputChange = (index, value) => {
    const next = [...inputs];
    next[index] = value;
    setInputs(next);
  };

  return (
    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', maxWidth: 800, mx: 'auto', width: '100%', p: 1 }}>
      <Typography variant="h4" component="h2" align="center" gutterBottom color="primary">
        {title}
      </Typography>
      
      {intro && (
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          {intro}
        </Typography>
      )}

      {examples.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 3 },
            mb: 2,
            bgcolor: 'background.paper',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
            Examples
          </Typography>
          {examples.map((example, idx) => (
            <Typography key={idx} variant="body2" sx={{ mb: idx < examples.length - 1 ? 0.75 : 0 }}>
              {example}
            </Typography>
          ))}
        </Paper>
      )}

      <Paper 
        elevation={0}
        sx={{ 
          p: { xs: 2, md: 3 },
          mb: 3,
          bgcolor: 'background.paper',
          borderRadius: 2,
          border: '1px solid', 
          borderColor: 'divider' 
        }}
      >
        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>
          Fill in each sentence.
        </Typography>
        {lines.map((line, idx) => (
          <Box 
            key={idx} 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              flexWrap: 'wrap', 
              mb: 2.5
            }}
          >
            {line.prefix && (
              <Typography 
                variant="body1"
                sx={{ 
                  mr: 1,
                  color: 'text.primary'
                }}
              >
                {line.prefix}
              </Typography>
            )}
            
            <TextField
              variant="outlined"
              placeholder="Your answer"
              value={inputs[idx]}
              onChange={(e) => handleInputChange(idx, e.target.value)}
              disabled={done}
              autoComplete="off"
              size="small"
              sx={{ 
                width: { xs: '100%', sm: 280 },
                mx: 1
              }}
            />

            {line.suffix && (
              <Typography 
                variant="body1"
                sx={{ 
                  ml: 1,
                  color: 'text.primary'
                }}
              >
                {line.suffix}
              </Typography>
            )}
          </Box>
        ))}
      </Paper>

      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
        {!done ? (
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<EditNote />}
            onClick={handleComplete}
            disabled={inputs.some(v => v.trim().length === 0)}
            sx={{ px: 4, borderRadius: 2 }}
          >
            Mark activity complete
          </Button>
        ) : (
          <Typography 
            variant="h6" 
            color="success.main" 
            sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}
          >
            ✓ Activity Complete!
          </Typography>
        )}
      </Box>

      {pdfNote && (
        <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', display: 'block' }}>
          {pdfNote}
        </Typography>
      )}
    </Box>
  );
};

export default ClozeActivity;