import { useLoaderData } from 'react-router-dom';
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
import MultiPageActivity from '../components/MultiPageActivity';
import ActivityBlurb from '../components/ActivityBlurb';
import activityData from '../data/activites.json';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  Drawer,
  Paper,
  Typography,
  useMediaQuery
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import MenuIcon from '@mui/icons-material/Menu';
import { useEffect, useMemo, useRef, useState } from 'react';

const SIDEBAR_BREAKPOINT = '(min-width:960px)';
const SIDEBAR_WIDTH = 320;

function ActivityContent({ activity, onComplete }) {
  if (!activity) return null;

  const renderByType = (activityNode, onNodeComplete) => {
    switch (activityNode.type) {
      case 'multiple_choice':
        return <MultipleChoiceQuiz quizData={activityNode} onComplete={onNodeComplete} />;
      case 'matching_activity':
      case 'qa_matching':
        return <MatchingActivity activityData={activityNode} onComplete={onNodeComplete} />;
      case 'reading_self_check':
        return <SelfCheckReadingActivity activityData={activityNode} onComplete={onNodeComplete} />;
      case 'workbook':
        return <WorkbookActivity activityData={activityNode} onComplete={onNodeComplete} />;
      case 'writing':
      case 'multi_speaker_writing':
        return <WritingActivity activityData={activityNode} onComplete={onNodeComplete} />;
      case 'classification_grid':
        return <ClassificationGridActivity activityData={activityNode} onComplete={onNodeComplete} />;
      case 'cloze':
        return <ClozeActivity activityData={activityNode} onComplete={onNodeComplete} />;
      case 'multi_page':
        return (
          <MultiPageActivity
            activityData={activityNode}
            onComplete={onNodeComplete}
            renderPageContent={(pageActivity, completePage) => renderByType(pageActivity, completePage)}
          />
        );
      case 'blurb':
        return <ActivityBlurb title={activityNode.title} text={activityNode.text} />;
      default:
        return (
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography color="error">Unknown activity type: {activityNode.type}</Typography>
          </Paper>
        );
    }
  };

  return renderByType(activity, onComplete);
}

function DashboardSidebar({
  account,
  chapters,
  chaptersWithActivities,
  expandedChapters,
  setExpandedChapters,
  selectedActivity,
  isLocked,
  isCompleted,
  onSelectActivity
}) {
  const sidebarScrollRef = useRef(null);
  const sidebarHideTimerRef = useRef(null);
  const [sidebarThumb, setSidebarThumb] = useState({ top: 0, height: 32 });
  const [isSidebarScrolling, setIsSidebarScrolling] = useState(false);
  const [sidebarHasOverflow, setSidebarHasOverflow] = useState(false);

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
  }, [chapters, expandedChapters, selectedActivity]);

  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 0,
        bgcolor: 'background.paper',
        display: 'grid',
        gridTemplateRows: '1fr auto',
        overflow: 'hidden'
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
                          onClick={() => !locked && onSelectActivity(a)}
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
  );
}

const StudentDashboard = () => {
  const isWideSidebar = useMediaQuery(SIDEBAR_BREAKPOINT);

  const { account, chapters } = useLoaderData();
  const initialChapter = Number(chapters?.[0]?.chapter_number || 1);
  const [expandedChapters, setExpandedChapters] = useState({ [initialChapter]: true });
  const [completedActivities, setCompletedActivities] = useState({});
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [sidebarDrawerOpen, setSidebarDrawerOpen] = useState(false);

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

  const handleSelectActivity = (activity) => {
    setSelectedRef({ chapter: activity.chapter, id: activity.id });
    if (!isWideSidebar) {
      setSidebarDrawerOpen(false);
    }
  };

  const handleChaptersClick = () => {
    if (isWideSidebar) {
      setSidebarVisible((visible) => !visible);
    } else {
      setSidebarDrawerOpen((open) => !open);
    }
  };

  useEffect(() => {
    if (isWideSidebar) {
      setSidebarDrawerOpen(false);
    }
  }, [isWideSidebar]);

  const showInlineSidebar = isWideSidebar && sidebarVisible;
  const showNavInToolbar = !isWideSidebar || !sidebarVisible;

  const sidebarProps = {
    account,
    chapters,
    chaptersWithActivities,
    expandedChapters,
    setExpandedChapters,
    selectedActivity,
    isLocked,
    isCompleted,
    onSelectActivity: handleSelectActivity
  };

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
      <Box
        sx={{
          minHeight: 0,
          display: 'flex',
          overflow: 'hidden'
        }}
      >
        {isWideSidebar && (
          <Box
            sx={(theme) => ({
              width: sidebarVisible ? SIDEBAR_WIDTH : 0,
              flexShrink: 0,
              minHeight: 0,
              overflow: 'hidden',
              borderRight: sidebarVisible ? '1px solid' : '0px solid transparent',
              borderColor: 'divider',
              transition: theme.transitions.create(['width', 'border-width'], {
                easing: theme.transitions.easing.sharp,
                duration: sidebarVisible
                  ? theme.transitions.duration.enteringScreen
                  : theme.transitions.duration.leavingScreen
              })
            })}
          >
            <Box
              sx={{
                width: SIDEBAR_WIDTH,
                height: '100%',
                minHeight: 0,
                pointerEvents: sidebarVisible ? 'auto' : 'none'
              }}
            >
              <DashboardSidebar {...sidebarProps} />
            </Box>
          </Box>
        )}

        <Box
          sx={{
            flex: 1,
            minWidth: 0,
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
              borderLeft: isWideSidebar && sidebarVisible ? '1px solid' : 'none',
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
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mb: 1.5,
              pb: 1,
              borderBottom: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Button
              variant="outlined"
              size="small"
              startIcon={<MenuIcon />}
              onClick={handleChaptersClick}
              sx={{ flexShrink: 0 }}
            >
              {showInlineSidebar ? 'Hide chapters' : 'Chapters'}
            </Button>
            {showNavInToolbar && (
              <>
                <Box sx={{ flex: 1 }} />
                <BackButton to="/" compact />
                <SettingsButton compact />
              </>
            )}
          </Box>

          {selectedActivity ? (
            <Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: 1.5,
                  flexWrap: 'wrap'
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    minWidth: 0,
                    flex: '1 1 auto'
                  }}
                >
                  {selectedActivity.title}
                </Typography>
                <Chip
                  size="small"
                  label={selectedActivity.duration || 'varies'}
                  variant="outlined"
                  sx={{ flexShrink: 0 }}
                />
              </Box>

              {selectedActivity.type !== 'classification_grid' &&
                selectedActivity.type !== 'multi_speaker_writing' &&
                selectedActivity.type !== 'multi_page' && (
                <ActivityVideoSection activity={selectedActivity} />
              )}

              <ActivityContent activity={selectedActivity} onComplete={(result) => handleComplete(selectedActivity, result)} />
            </Box>
          ) : (
            <Typography color="text.secondary">Select a chapter and activity to begin.</Typography>
          )}
        </Box>
      </Box>

      {!isWideSidebar && (
        <Drawer
          open={sidebarDrawerOpen}
          onClose={() => setSidebarDrawerOpen(false)}
          variant="temporary"
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: SIDEBAR_WIDTH,
              boxSizing: 'border-box'
            }
          }}
        >
          <DashboardSidebar {...sidebarProps} />
        </Drawer>
      )}
    </Box>
  );
};

export default StudentDashboard;
