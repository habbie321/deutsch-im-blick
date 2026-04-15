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
  const { title, intro, lines = [], pdfNote } = activityData;
  
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
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
          {intro}
        </Typography>
      )}

      <Paper 
        elevation={2} 
        sx={{ 
          p: { xs: 2, md: 4 }, 
          mb: 4, 
          bgcolor: '#fafafa', 
          borderRadius: 3, 
          border: '1px solid', 
          borderColor: 'divider' 
        }}
      >
        {lines.map((line, idx) => (
          <Box 
            key={idx} 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              flexWrap: 'wrap', 
              mb: 3,
              justifyContent: 'center'
            }}
          >
            {line.prefix && (
              <Typography 
                variant="h5" 
                sx={{ 
                  fontFamily: '"Georgia", serif', 
                  fontStyle: 'italic', 
                  mr: 1,
                  color: 'text.primary',
                  fontSize: { xs: '1.1rem', md: '1.5rem' }
                }}
              >
                {line.prefix}
              </Typography>
            )}
            
            <TextField
              variant="standard"
              placeholder="________________"
              value={inputs[idx]}
              onChange={(e) => handleInputChange(idx, e.target.value)}
              disabled={done}
              autoComplete="off"
              sx={{ 
                minWidth: 120,
                mx: 1,
                '& .MuiInput-input': { 
                  textAlign: 'center', 
                  fontSize: { xs: '1.1rem', md: '1.5rem' },
                  fontWeight: 'bold',
                  color: 'primary.main',
                  fontFamily: '"Georgia", serif'
                }
              }}
            />

            {line.suffix && (
              <Typography 
                variant="h5" 
                sx={{ 
                  fontFamily: '"Georgia", serif', 
                  fontStyle: 'italic', 
                  ml: 1,
                  color: 'text.primary',
                  fontSize: { xs: '1.1rem', md: '1.5rem' }
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