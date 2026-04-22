import React, { useMemo, useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { NavigateBefore, NavigateNext } from '@mui/icons-material';
import ActivityVideoSection from './ActivityVideoSection';

const MultiPageActivity = ({ activityData, onComplete, renderPageContent }) => {
  const pages = activityData?.pages || [];
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [completedPages, setCompletedPages] = useState({});

  const currentPage = pages[currentPageIndex];
  const hasPages = pages.length > 0;

  const mergedPageActivity = useMemo(() => {
    if (!currentPage) return null;
    return {
      ...currentPage,
      chapter: activityData.chapter,
      mediaCards: currentPage.mediaCards || activityData.mediaCards || []
    };
  }, [activityData.chapter, activityData.mediaCards, currentPage]);

  const handlePageComplete = (result) => {
    if (!currentPage?.id || !result?.correct) return;

    const nextCompleted = { ...completedPages, [currentPage.id]: true };
    setCompletedPages(nextCompleted);

    if (pages.length > 0 && pages.every((p) => nextCompleted[p.id])) {
      onComplete?.({ correct: true });
    }
  };

  if (!hasPages) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography color="text.secondary">No pages configured for this activity.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
      <ActivityVideoSection activity={mergedPageActivity} />

      {currentPage?.title ? (
        <Typography variant="h6" color="primary" sx={{ textAlign: 'center', mb: 1 }}>
          {currentPage.title}
        </Typography>
      ) : null}

      {renderPageContent(mergedPageActivity, handlePageComplete)}

      {pages.length > 1 && (
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            startIcon={<NavigateBefore />}
            onClick={() => setCurrentPageIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentPageIndex === 0}
          >
            Previous page
          </Button>
          <Typography variant="body2" color="text.secondary">
            Page {currentPageIndex + 1} of {pages.length}
          </Typography>
          <Button
            variant="contained"
            endIcon={<NavigateNext />}
            onClick={() => setCurrentPageIndex((prev) => Math.min(pages.length - 1, prev + 1))}
            disabled={currentPageIndex === pages.length - 1}
          >
            Next page
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default MultiPageActivity;
