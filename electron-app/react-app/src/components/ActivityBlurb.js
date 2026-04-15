import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Restaurant } from '@mui/icons-material';

/**
 * ActivityBlurb
 * A non-interactive informational block displayed between activity cards
 * to provide context or transitions between topics.
 */
const ActivityBlurb = ({ title, text }) => {
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3, 
        mb: 2, 
        border: '1px solid',
        borderColor: 'primary.main',
        bgcolor: 'rgba(25, 118, 210, 0.04)', // Light primary tint
        borderRadius: 2,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: 'primary.main' }}>
        <Restaurant sx={{ mr: 1 }} />
        <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>
          {title}
        </Typography>
      </Box>
      <Typography variant="body1" sx={{ color: 'text.primary', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
        {text}
      </Typography>
    </Paper>
  );
};

export default ActivityBlurb;