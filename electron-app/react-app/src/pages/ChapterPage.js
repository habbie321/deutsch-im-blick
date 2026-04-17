import { useState, useEffect } from 'react';
import { useLoaderData } from 'react-router-dom';
import VideoPlayer from '../components/VideoPlayer';
import BackButton from '../components/BackButton';
import ActivitiesStepper from '../components/ActivitiesStepper';
import { Backdrop, Box, Button, Container, Paper, Typography } from '@mui/material';

function ChapterPage() {

  const [showIntro, setShowIntro] = useState(false);
  const [open, setOpen] = useState(false);
  const { chapterNumber, userId } = useLoaderData();

  // Check if intro was seen
  useEffect(() => {
    const hasSeenIntro = localStorage.getItem(`${userId}_intro_seen_${chapterNumber}`);
    if (!hasSeenIntro) {
      setShowIntro(true);
      setOpen(true);
      localStorage.setItem(`${userId}_intro_seen_${chapterNumber}`, 'true');
    }
  }, [chapterNumber, userId]);

  const handleClose = () => {
    setOpen(false);
  };

  const chFolder = `chapter${String(chapterNumber).padStart(2, '0')}`;
  const introSrc = `app://${chFolder}/intro.mp4`;

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', py: 3 }}>
      {/* Intro Video Overlay */}
      {showIntro && (
        <Backdrop
          sx={(theme) => ({
            color: '#fff',
            zIndex: theme.zIndex.drawer + 1,
            backdropFilter: 'blur(6px)',
            px: 2
          })}
          open={open}
        >
          <Paper sx={{ p: 2, maxWidth: 860, width: '100%', borderRadius: 3 }}>
            <Typography variant="h6" sx={{ mb: 1.5, color: 'text.primary' }}>
              Kapitel {chapterNumber} — Einführung
            </Typography>
            <VideoPlayer
              src={introSrc}
              relativePath={`${chFolder}/intro.mp4`}
              title={`Kapitel ${chapterNumber} — Einführung`}
              fallbackUrl={`https://coerll.utexas.edu/dib/toc.php?k=${chapterNumber}`}
              autoPlay
            />
            <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="contained" onClick={handleClose}>Continue</Button>
            </Box>
          </Paper>
        </Backdrop>
      )}

      {/* Chapter Stuff */}
      <Container maxWidth="lg">
        <Paper sx={{ p: { xs: 2, md: 3 }, mb: 2, borderRadius: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
            Kapitel {chapterNumber}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Activities, listening clips, and workbook practice
          </Typography>
          <BackButton />
        </Paper>

        <ActivitiesStepper chapterNumber={chapterNumber} />
        {/* ... */}
      </Container>
    </Box>
  );
}

export default ChapterPage;