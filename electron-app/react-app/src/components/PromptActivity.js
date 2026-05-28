import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  Link
} from '@mui/material';

/**
 * PromptActivity
 * Classroom / oral activities with instructions only (no auto-graded blocks).
 */
const PromptActivity = ({ activityData, onComplete }) => {
  const { title, intro, tasks = [], sections = [], links = [], pdfNote } = activityData;
  const [done, setDone] = useState(false);

  const handleComplete = () => {
    setDone(true);
    onComplete?.({ correct: true });
  };

  return (
    <Box sx={{ p: 2, maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h4" color="text.primary" align="center" gutterBottom sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      {intro && (
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
          {intro}
        </Typography>
      )}

      {tasks.length > 0 && (
        <Paper elevation={0} sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
            Tasks
          </Typography>
          <List dense disablePadding>
            {tasks.map((task, idx) => (
              <ListItem key={idx} disableGutters sx={{ alignItems: 'flex-start' }}>
                <ListItemText primary={typeof task === 'string' ? task : task.text} />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {sections.map((section, idx) => (
        <Paper key={idx} elevation={0} sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          {section.heading && (
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
              {section.heading}
            </Typography>
          )}
          {(section.paragraphs || []).map((paragraph, pIdx) => (
            <Typography key={pIdx} variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {paragraph}
            </Typography>
          ))}
          {(section.list || []).length > 0 && (
            <List dense disablePadding>
              {section.list.map((item, lIdx) => (
                <ListItem key={lIdx} disableGutters sx={{ py: 0.25 }}>
                  <ListItemText primary={item} primaryTypographyProps={{ variant: 'body2' }} />
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
      ))}

      {links.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
            Resources
          </Typography>
          {links.map((link, idx) => (
            <Link key={idx} href={link.url} target="_blank" rel="noopener noreferrer" display="block" sx={{ mb: 0.5 }}>
              {link.label}
            </Link>
          ))}
        </Box>
      )}

      {pdfNote && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3, textAlign: 'center' }}>
          {pdfNote}
        </Typography>
      )}

      {!done ? (
        <Box sx={{ textAlign: 'center' }}>
          <Button variant="contained" size="large" onClick={handleComplete} sx={{ px: 6 }}>
            Mark activity complete
          </Button>
        </Box>
      ) : (
        <Typography variant="body1" color="success.main" sx={{ textAlign: 'center' }}>
          Activity complete.
        </Typography>
      )}
    </Box>
  );
};

export default PromptActivity;
