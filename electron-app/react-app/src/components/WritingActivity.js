import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Divider,
  Alert
} from '@mui/material';
import { Create } from '@mui/icons-material';

const WritingActivity = ({ activityData, onComplete }) => {
  const { title, intro, tasks = [], pdfNote } = activityData;
  
  // State to track responses for each task/prompt
  const [responses, setResponses] = useState(
    tasks.reduce((acc, _, index) => ({ ...acc, [index]: '' }), {})
  );
  const [submitted, setSubmitted] = useState(false);

  const handleTextChange = (index, value) => {
    setResponses(prev => ({
      ...prev,
      [index]: value
    }));
  };

  const isComplete = tasks.every((_, index) => responses[index].trim().length > 0);

  const handleSubmit = () => {
    if (!isComplete) return;
    
    setSubmitted(true);
    // Defaulting to correct as requested
    if (onComplete) {
      onComplete({ correct: true });
    }
  };

  return (
    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', maxWidth: 800, mx: 'auto', width: '100%', p: 2 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom color="primary">
          {title}
        </Typography>
        {intro && (
          <Typography variant="body1" color="text.secondary">
            {intro}
          </Typography>
        )}
      </Box>

      <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <Create color="primary" />
          <Typography variant="h6">Writing Exercise</Typography>
        </Box>

        {tasks.map((task, index) => (
          <Box key={index} sx={{ mb: 4 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              {index + 1}. {task}
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              placeholder="Type your response here..."
              value={responses[index]}
              onChange={(e) => handleTextChange(index, e.target.value)}
              disabled={submitted}
              sx={{ bgcolor: 'grey.50' }}
            />
          </Box>
        ))}

        {pdfNote && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, fontStyle: 'italic' }}>
            Note: {pdfNote}
          </Typography>
        )}

        <Divider sx={{ my: 3 }} />

        {!submitted ? (
          <Box sx={{ textAlign: 'center' }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleSubmit}
              disabled={!isComplete}
              sx={{ borderRadius: 2, px: 6 }}
            >
              Submit Responses
            </Button>
            {!isComplete && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Please provide a response for all prompts to continue.
              </Typography>
            )}
          </Box>
        ) : (
          <Alert severity="success" sx={{ borderRadius: 2 }}>
            Responses saved! In a future version, these could be reviewed by an instructor or AI assistant.
          </Alert>
        )}
      </Paper>
    </Box>
  );
};

export default WritingActivity;