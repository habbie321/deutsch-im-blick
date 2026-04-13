import { useState, useEffect } from 'react';
import { useLoaderData } from 'react-router-dom';
import VideoPlayer from '../components/VideoPlayer';
import BackButton from '../components/BackButton';
import { Backdrop } from '@mui/material';
import { Button } from '@mui/material';
import ActivitiesStepper from '../components/ActivitiesStepper';

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
    <div className="relative">
      {/* Intro Video Overlay */}
      {showIntro && (
        <div>
        <Backdrop
          sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
          open={open}
        >
          <VideoPlayer
            src={introSrc}
            relativePath={`${chFolder}/intro.mp4`}
            title={`Kapitel ${chapterNumber} — Einführung`}
            fallbackUrl={`https://coerll.utexas.edu/dib/toc.php?k=${chapterNumber}`}
            autoPlay
          />
          <Button onClick={handleClose}>Close</Button>
        </Backdrop>
        </div>
      )}

      {/* Chapter Stuff */}
      <div className="container">
        <h1>Chapter {chapterNumber} Stuff</h1>
        <BackButton />
        <ActivitiesStepper chapterNumber={chapterNumber}/>
        {/* ... */}
      </div>
    </div>
  );
}

export default ChapterPage;