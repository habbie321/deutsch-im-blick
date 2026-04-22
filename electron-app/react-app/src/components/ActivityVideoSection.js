import React, { useEffect, useMemo, useState } from 'react';
import { Box, Typography, Paper, Divider, Button, Dialog } from '@mui/material';
import { NavigateBefore, NavigateNext } from '@mui/icons-material';
import VideoPlayer from './VideoPlayer';

/**
 * Renders local COERLL-style clips above an activity when metadata or icon says so.
 */
const ActivityVideoSection = ({ activity }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);

  const resourcesRoot = 'electron-app/resources/videos/';
  const resolveImageSrc = (value) => {
    if (!value) return '';
    if (/^https?:\/\//.test(value) || value.startsWith('app://') || value.startsWith('/')) return value;
    return `app://${value}`;
  };

  const toVideoItem = (rawVideo, index) => {
    if (!rawVideo?.path) return null;
    const appSrc =
      /^https?:\/\//.test(rawVideo.path) || rawVideo.path.startsWith('app://')
        ? rawVideo.path
        : `app://${rawVideo.path}`;
    return {
      id: rawVideo.id || `video-${index}`,
      title: rawVideo.title || rawVideo.label || `Video ${index + 1}`,
      body: rawVideo.body || '',
      video: {
        appSrc,
        relativePath: rawVideo.path,
        fallbackUrl: rawVideo.fallbackUrl
      }
    };
  };

  const mediaItems = useMemo(() => {
    return (activity?.mediaCards || [])
      .map((card, index) => {
        const normalizedVideo =
          card.video && card.video.path
            ? toVideoItem(
                {
                  ...card.video,
                  title: card.video.title || card.title
                },
                index
              )?.video
            : card.videoPath
              ? toVideoItem(
                  {
                    path: card.videoPath,
                    title: card.videoTitle || card.title,
                    fallbackUrl: card.videoFallbackUrl
                  },
                  index
                )?.video
              : null;

        return {
          id: card.id || `media-${index}`,
          title: card.title || '',
          body: card.body || '',
          imagePath: card.imagePath || '',
          imageAlt: card.alt || card.imageAlt || '',
          video: normalizedVideo
        };
      })
      .filter((item) => item.video || item.imagePath || item.body);
  }, [activity]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [activity?.chapter, activity?.id]);

  useEffect(() => {
    setImageFailed(false);
  }, [currentIndex, activity?.chapter, activity?.id]);

  if (!mediaItems.length) {
    return null;
  }

  const currentItem = mediaItems[currentIndex];
  const hasNavigation = mediaItems.length > 1;
  const showPrev = hasNavigation && currentIndex > 0;
  const showNext = hasNavigation && currentIndex < mediaItems.length - 1;
  const hasAnyVideo = mediaItems.some((item) => item.video);

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
      {currentItem.title ? (
        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1.5 }}>
          {currentItem.title}
        </Typography>
      ) : null}
      {hasAnyVideo && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
          Place MP4 files under <strong>{resourcesRoot}</strong>. Until a file is there, you will see a placeholder with a link to the chapter on the COERLL site.
        </Typography>
      )}
      {currentItem.title ? <Divider sx={{ mb: 2 }} /> : null}
      <Box
        sx={{
          p: 1.5,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: '#fcfdff'
        }}
      >
        {currentItem.video && (
          <>
            <VideoPlayer
              src={currentItem.video.appSrc}
              title={currentItem.title}
              relativePath={currentItem.video.relativePath}
              resourcesRoot={resourcesRoot}
              fallbackUrl={currentItem.video.fallbackUrl}
              autoPlay={false}
              sx={{ mb: currentItem.imagePath || currentItem.body ? 1.5 : 0 }}
            />
          </>
        )}

        {currentItem.imagePath && (
          <>
            {!imageFailed && (
              <Box
                component="img"
                src={resolveImageSrc(currentItem.imagePath)}
                alt={currentItem.imageAlt || currentItem.title || 'Activity visual'}
                onError={() => setImageFailed(true)}
                onClick={() => setZoomOpen(true)}
                sx={{
                  width: '100%',
                  maxHeight: 'min(34vh, 280px)',
                  objectFit: 'contain',
                  borderRadius: 1.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: '#fff',
                  cursor: 'zoom-in',
                  mb: currentItem.body ? 1.5 : 0
                }}
              />
            )}
          </>
        )}

        {currentItem.body && (
          <Typography variant="body2" color="text.primary" sx={{ whiteSpace: 'pre-wrap' }}>
            {currentItem.body}
          </Typography>
        )}
      </Box>
      {hasNavigation && (
        <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<NavigateBefore />}
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={!showPrev}
          >
            Previous
          </Button>
          <Typography variant="caption" color="text.secondary">
            {currentIndex + 1} of {mediaItems.length}
          </Typography>
          <Button
            size="small"
            variant="contained"
            endIcon={<NavigateNext />}
            onClick={() => setCurrentIndex((prev) => Math.min(mediaItems.length - 1, prev + 1))}
            disabled={!showNext}
          >
            Next
          </Button>
        </Box>
      )}
      <Dialog open={zoomOpen} onClose={() => setZoomOpen(false)} maxWidth="lg" fullWidth>
        <Box sx={{ p: 1.5, bgcolor: '#111' }}>
          <Box
            component="img"
            src={resolveImageSrc(currentItem.imagePath)}
            alt={currentItem.imageAlt || currentItem.title || 'Activity visual'}
            sx={{
              width: '100%',
              maxHeight: '85vh',
              objectFit: 'contain',
              display: 'block',
              borderRadius: 1
            }}
          />
        </Box>
      </Dialog>
    </Paper>
  );
};

export default ActivityVideoSection;
