import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Link,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { OpenInNew } from '@mui/icons-material';
import InlineActivityChecks from './InlineActivityChecks';

const WorkbookActivity = ({ activityData, onComplete }) => {
  const [done, setDone] = useState(false);
  const [checksSatisfied, setChecksSatisfied] = useState(!(activityData.checks?.blocks?.length > 0));

  const { title, intro, sections = [], tasks = [], links = [], pdfNote, checks } = activityData;

  useEffect(() => {
    setChecksSatisfied(!(checks?.blocks?.length > 0));
  }, [checks]);

  const handleComplete = () => {
    if (checks?.blocks?.length > 0 && !checksSatisfied) return;
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

      {sections.map((sec, i) => (
        <Paper key={i} elevation={0} sx={{ p: 2, mb: 2, bgcolor: 'background.paper', border: 1, borderColor: 'divider' }}>
          {sec.heading && (
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              {sec.heading}
            </Typography>
          )}
          {(sec.paragraphs || []).map((p, j) => (
            <Typography key={j} variant="body2" color="text.secondary" sx={{ mb: 1.5, whiteSpace: 'pre-wrap' }}>
              {p}
            </Typography>
          ))}
          {sec.list && sec.list.length > 0 && (
            <List dense disablePadding sx={{ pl: 1 }}>
              {sec.list.map((item, k) => (
                <ListItem key={k} disableGutters sx={{ display: 'list-item', listStyleType: 'disc', ml: 2 }}>
                  <ListItemText primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }} primary={item} />
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
      ))}

      {tasks.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Tasks
          </Typography>
          <List dense>
            {tasks.map((t, i) => (
              <ListItem key={i} sx={{ alignItems: 'flex-start', py: 0.5 }}>
                <ListItemText primaryTypographyProps={{ variant: 'body2', color: 'text.secondary', whiteSpace: 'pre-wrap' }} primary={t} />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {links.length > 0 && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" gutterBottom>
            Links
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
            {links.map((l, i) => (
              <Link key={i} href={l.url} target="_blank" rel="noopener noreferrer" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                {l.label}
                <OpenInNew sx={{ fontSize: 16 }} />
              </Link>
            ))}
          </Box>
        </>
      )}

      {pdfNote && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
          {pdfNote}
        </Typography>
      )}

      {checks?.blocks?.length > 0 && <InlineActivityChecks blocks={checks.blocks} onSatisfiedChange={setChecksSatisfied} />}

      {!done ? (
        <Button
          variant="contained"
          size="large"
          onClick={handleComplete}
          disabled={checks?.blocks?.length > 0 && !checksSatisfied}
          sx={{ alignSelf: 'center', mt: 2, borderRadius: 2 }}
        >
          Mark activity complete
        </Button>
      ) : (
        <Typography variant="body1" color="success.main" sx={{ textAlign: 'center', mt: 2 }}>
          Saved as complete. You can close this screen or go to the next activity.
        </Typography>
      )}

      {checks?.blocks?.length > 0 && !checksSatisfied && !done && (
        <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', mt: 1 }}>
          Use <strong>Check answers</strong> above until all items are correct to enable completion.
        </Typography>
      )}
    </Box>
  );
};

export default WorkbookActivity;
