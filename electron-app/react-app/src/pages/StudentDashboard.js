import { useParams } from 'react-router-dom';
import BackButton from '../components/BackButton';
import SettingsButton from '../components/SettingsButton';
import ActivityVideoSection from '../components/ActivityVideoSection';
import MultipleChoiceQuiz from '../components/MultipleChoiceQuiz';
import MatchingActivity from '../components/MatchingActivity';
import WorkbookActivity from '../components/WorkbookActivity';
import SelfCheckReadingActivity from '../components/SelfCheckReadingActivity';
import WritingActivity from '../components/WritingActivity';
import ClassificationGridActivity from '../components/ClassificationGridActivity';
import ClozeActivity from '../components/ClozeActivity';
import ActivityBlurb from '../components/ActivityBlurb';
import activityData from '../data/activites.json';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  Paper,
  Typography
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useLoaderData } from 'react-router-dom';

function ActivityContent({ activity, onComplete }) {
  if (!activity) return null;

  switch (activity.type) {
    case 'multiple_choice':
      return <MultipleChoiceQuiz quizData={activity} onComplete={onComplete} />;
    case 'matching_activity':
    case 'qa_matching':
      return <MatchingActivity activityData={activity} onComplete={onComplete} />;
    case 'reading_self_check':
      return <SelfCheckReadingActivity activityData={activity} onComplete={onComplete} />;
    case 'workbook':
      return <WorkbookActivity activityData={activity} onComplete={onComplete} />;
    case 'writing':
    case 'multi_speaker_writing':
      return <WritingActivity activityData={activity} onComplete={onComplete} />;
    case 'classification_grid':
      return <ClassificationGridActivity activityData={activity} onComplete={onComplete} />;
    case 'cloze':
      return <ClozeActivity activityData={activity} onComplete={onComplete} />;
    case 'blurb':
      return <ActivityBlurb title={activity.title} text={activity.text} />;
    default:
      return (
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Typography color="error">Unknown activity type: {activity.type}</Typography>
        </Paper>
      );
  }
}

const StudentDashboard = () => {
  const { id } = useParams(); // 'id' is a string from the URL
  const userId = parseInt(id, 10);

  const { account, chapters } = useLoaderData();
  const initialChapter = Number(chapters?.[0]?.chapter_number || 1);
  const [expandedChapters, setExpandedChapters] = useState({ [initialChapter]: true });
  const [completedActivities, setCompletedActivities] = useState({});
  const sidebarScrollRef = useRef(null);
  const sidebarHideTimerRef = useRef(null);
  const [sidebarThumb, setSidebarThumb] = useState({ top: 0, height: 32 });
  const [isSidebarScrolling, setIsSidebarScrolling] = useState(false);
  const [sidebarHasOverflow, setSidebarHasOverflow] = useState(false);

  const chaptersWithActivities = useMemo(() => {
    const out = {};
    activityData.activities.forEach((a) => {
      if (!out[a.chapter]) out[a.chapter] = [];
      out[a.chapter].push(a);
    });
    Object.keys(out).forEach((k) => out[k].sort((a, b) => a.id - b.id));
    return out;
  }, []);

  const firstAvailableActivity = useMemo(() => {
    const list = chaptersWithActivities[initialChapter] || [];
    return list[0] || null;
  }, [chaptersWithActivities, initialChapter]);

  const [selectedRef, setSelectedRef] = useState({
    chapter: firstAvailableActivity?.chapter ?? initialChapter,
    id: firstAvailableActivity?.id ?? null
  });

  const selectedActivity = useMemo(() => {
    const list = chaptersWithActivities[Number(selectedRef.chapter)] || [];
    return list.find((a) => a.id === selectedRef.id) || list[0] || null;
  }, [chaptersWithActivities, selectedRef]);

  const isLocked = (activity) =>
    (activity.prerequisites || []).some((prereqId) => !completedActivities[`${activity.chapter}-${prereqId}`]);

  const isCompleted = (activity) => Boolean(completedActivities[`${activity.chapter}-${activity.id}`]);

  const handleComplete = (activity, result) => {
    if (result?.correct) {
      setCompletedActivities((prev) => ({ ...prev, [`${activity.chapter}-${activity.id}`]: true }));
    }
  };

  useEffect(() => {
    const el = sidebarScrollRef.current;
    if (!el) return undefined;

    const updateThumb = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      if (clientHeight <= 0) return;
      const hasOverflow = scrollHeight > clientHeight + 1;
      setSidebarHasOverflow(hasOverflow);

      const ratio = clientHeight / Math.max(scrollHeight, 1);
      const thumbHeight = Math.max(28, Math.round(clientHeight * ratio));
      const maxTop = Math.max(clientHeight - thumbHeight, 0);
      const top =
        hasOverflow
          ? Math.round((scrollTop / (scrollHeight - clientHeight)) * maxTop)
          : 0;

      setSidebarThumb({ top, height: Math.min(thumbHeight, clientHeight) });
    };

    const handleScroll = () => {
      setIsSidebarScrolling(true);
      updateThumb();
      if (sidebarHideTimerRef.current) {
        clearTimeout(sidebarHideTimerRef.current);
      }
      sidebarHideTimerRef.current = setTimeout(() => {
        setIsSidebarScrolling(false);
      }, 700);
    };

    const resizeObserver = new ResizeObserver(updateThumb);
    resizeObserver.observe(el);
    updateThumb();
    el.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', updateThumb);

    return () => {
      resizeObserver.disconnect();
      el.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateThumb);
      if (sidebarHideTimerRef.current) {
        clearTimeout(sidebarHideTimerRef.current);
      }
    };
  }, [chapters, expandedChapters, selectedRef]);

  return (
    <Box
      sx={{
        height: '100vh',
        minHeight: '100vh',
        overflow: 'hidden',
        bgcolor: 'background.default',
        display: 'grid',
        gridTemplateRows: '1fr'
      }}
    >
      <Box sx={{ minHeight: 0, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '320px 1fr' } }}>
        <Box
          sx={{
            minHeight: 0,
            bgcolor: 'background.paper',
            display: 'grid',
            gridTemplateRows: '1fr auto',
            overflow: 'hidden',
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              width: '1px',
              bgcolor: 'divider',
              display: { xs: 'none', md: 'block' }
            }
          }}
        >
          <Box sx={{ minHeight: 0, position: 'relative' }}>
            <Box
              ref={sidebarScrollRef}
              sx={{
                height: '100%',
                overflowY: 'auto',
                overflowX: 'hidden',
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': {
                  display: 'none'
                }
              }}
            >
            <Box sx={{ px: 1.5, pt: 1.25, pb: 0.75, borderBottom: '1px solid', borderColor: 'divider', mb: 0.75 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                Signed in as
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {account.first_name}
              </Typography>
            </Box>

            <Typography variant="subtitle1" sx={{ fontWeight: 700, px: 1.5, pt: 0.5 }}>
              Chapters
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', px: 1.5, pb: 1 }}>
              Expand a chapter to choose an activity
            </Typography>
            {(chapters || []).map((ch) => {
              const chapterNum = Number(ch.chapter_number);
              const items = chaptersWithActivities[chapterNum] || [];
              return (
                <Accordion
                  key={ch.id}
                  disableGutters
                    expanded={Boolean(expandedChapters[chapterNum])}
                    onChange={(_, isExpanded) =>
                      setExpandedChapters((prev) => ({
                        ...prev,
                        [chapterNum]: isExpanded
                      }))
                    }
                  sx={{
                    boxShadow: 'none',
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 0,
                    margin: 0,
                    '&.MuiPaper-root': {
                      borderRadius: 0
                    },
                    '&.Mui-expanded': {
                      margin: 0,
                      borderRadius: 0
                    },
                    '&:before': { display: 'none' },
                    '& .MuiAccordionSummary-root': {
                      borderRadius: 0
                    },
                    '& .MuiAccordionDetails-root': {
                      borderRadius: 0
                    }
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Kapitel {chapterNum}: {ch.chapter_name}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 0.5 }}>
                    <Box sx={{ display: 'grid', gap: 0.75 }}>
                      {items.map((a) => {
                        const locked = isLocked(a);
                        const done = isCompleted(a);
                        const selected =
                          selectedActivity &&
                          selectedActivity.chapter === a.chapter &&
                          selectedActivity.id === a.id;
                        return (
                          <Button
                            key={a.id}
                            onClick={() => !locked && setSelectedRef({ chapter: a.chapter, id: a.id })}
                            variant={selected ? 'contained' : 'text'}
                            color={selected ? 'primary' : 'inherit'}
                            disabled={locked}
                            sx={{
                              justifyContent: 'space-between',
                              px: 1.25,
                              py: 0.65,
                              borderRadius: 1,
                              color: selected ? 'common.white' : 'text.primary'
                            }}
                          >
                            <Typography variant="caption" sx={{ textAlign: 'left' }}>
                              {a.id}. {a.title.replace(/^Aktivität\s+[\d.]+\.\s*/, '')}
                            </Typography>
                            {locked ? <LockIcon sx={{ fontSize: 14, ml: 1 }} /> : done ? <CheckCircleIcon sx={{ fontSize: 14, ml: 1 }} /> : <PlayArrowIcon sx={{ fontSize: 14, ml: 1 }} />}
                          </Button>
                        );
                      })}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              );
            })}
            </Box>
            <Box
              aria-hidden
              sx={{
                position: 'absolute',
                top: 0,
                right: 2,
                bottom: 0,
                width: 6,
                pointerEvents: 'none'
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  right: 0,
                  top: `${sidebarThumb.top}px`,
                  width: 6,
                  height: `${sidebarThumb.height}px`,
                  borderRadius: 999,
                  bgcolor: 'grey.500',
                  opacity: isSidebarScrolling && sidebarHasOverflow ? 1 : 0,
                  transition: 'opacity 220ms ease'
                }}
              />
            </Box>
          </Box>

          <Box sx={{ borderTop: '1px solid', borderColor: 'divider', p: 1, display: 'grid', gap: 0.25, bgcolor: '#fcfcfd' }}>
            <BackButton to="/" compact />
            <SettingsButton compact />
          </Box>
        </Box>

        <Box
          sx={{
            minHeight: 0,
            overflowY: 'auto',
            p: { xs: 1.5, md: 2 },
            bgcolor: '#fcfcfd',
            scrollbarWidth: 'thin',
            scrollbarColor: (theme) => `${theme.palette.grey[500]} #fcfcfd`,
            '&::-webkit-scrollbar': {
              width: 10
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: '#fcfcfd',
              borderLeft: '1px solid',
              borderColor: 'divider'
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'grey.500',
              borderRadius: 8,
              border: '2px solid',
              borderColor: '#fcfcfd'
            },
            '&::-webkit-scrollbar-thumb:hover': {
              backgroundColor: 'grey.600'
            }
          }}
        >
          {selectedActivity ? (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {selectedActivity.title}
                </Typography>
                <Chip size="small" label={selectedActivity.duration || 'varies'} variant="outlined" />
              </Box>

              {selectedActivity.type !== 'classification_grid' && selectedActivity.type !== 'multi_speaker_writing' && (
                <ActivityVideoSection activity={selectedActivity} />
              )}

              <ActivityContent activity={selectedActivity} onComplete={(result) => handleComplete(selectedActivity, result)} />
            </Box>
          ) : (
            <Typography color="text.secondary">Select a chapter and activity to begin.</Typography>
          )}
        </Box>
      </Box>

    </Box>
  );
};

export default StudentDashboard;
