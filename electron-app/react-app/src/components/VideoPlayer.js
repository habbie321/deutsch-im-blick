import React, { useState } from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import { OpenInNew, FolderOpen } from '@mui/icons-material';

/**
 * Local (Electron app://) or remote MP4. Shows a friendly placeholder if the file is missing or the URL fails.
 */
const VideoPlayer = ({
  src,
  title,
  relativePath,
  resourcesRoot = 'electron-app/resources/videos/',
  fallbackUrl,
  autoPlay = false,
  sx = {}
}) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <Alert severity="info" icon={<FolderOpen />} sx={{ textAlign: 'left' }}>
        <Typography variant="body2" gutterBottom>
          {title ? <strong>{title}</strong> : 'This clip'} is not available yet.
        </Typography>
        {relativePath && (
          <Typography variant="body2" sx={{ mb: 1 }}>
            Add your downloaded MP4 to:
            <Box component="span" sx={{ display: 'block', fontFamily: 'monospace', fontSize: '0.85rem', mt: 0.5 }}>
              {resourcesRoot}
              {relativePath}
            </Box>
          </Typography>
        )}
        {fallbackUrl && (
          <Button
            component="a"
            href={fallbackUrl}
            target="_blank"
            rel="noopener noreferrer"
            size="small"
            variant="outlined"
            endIcon={<OpenInNew sx={{ fontSize: 16 }} />}
            sx={{ mt: 0.5 }}
          >
            Open Kapitel on COERLL (stream / links)
          </Button>
        )}
      </Alert>
    );
  }

  return (
    <Box sx={{ width: '100%', ...sx }}>
      <video
        controls
        autoPlay={autoPlay}
        preload="metadata"
        style={{ width: '100%', maxHeight: 'min(50vh, 420px)', borderRadius: 8, background: '#000' }}
        onError={() => setFailed(true)}
      >
        <source src={src} type="video/mp4" />
        Your browser does not support HTML5 video.
      </video>
    </Box>
  );
};

export default VideoPlayer;
