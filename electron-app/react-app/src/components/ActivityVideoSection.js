import React from 'react';
import { Box, Typography, Paper, Divider } from '@mui/material';
import { Videocam } from '@mui/icons-material';
import VideoPlayer from './VideoPlayer';
import { getActivityVideoClips } from '../utils/activityVideo';

/**
 * Renders local COERLL-style clips above an activity when metadata or icon says so.
 */
const ActivityVideoSection = ({ activity }) => {
  const clips = getActivityVideoClips(activity);

  if (!clips.length) {
    return null;
  }

  const resourcesRoot = 'electron-app/resources/videos/';

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 3,
        p: 2,
        border: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        borderRadius: 3
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <Videocam color="primary" />
        <Typography variant="subtitle1" fontWeight="bold">
          Video
        </Typography>
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
        Place MP4 files under <strong>{resourcesRoot}</strong> using the paths below. Until a file is there, you’ll see a placeholder with a link to the chapter on the COERLL site.
      </Typography>
      <Divider sx={{ mb: 2 }} />
      {clips.map((clip, i) => (
        <Box
          key={`${clip.relativePath}-${i}`}
          sx={{
            mb: i < clips.length - 1 ? 3 : 0,
            p: 1.5,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: '#fcfdff'
          }}
        >
          <Typography variant="body2" color="primary" fontWeight="medium" gutterBottom>
            {clip.label}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontFamily: 'monospace' }}>
            {clip.relativePath}
          </Typography>
          <VideoPlayer
            src={clip.appSrc}
            title={clip.label}
            relativePath={clip.relativePath}
            resourcesRoot={resourcesRoot}
            fallbackUrl={clip.fallbackUrl}
            autoPlay={false}
          />
        </Box>
      ))}
    </Paper>
  );
};

export default ActivityVideoSection;
