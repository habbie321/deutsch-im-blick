import React, { useMemo, useState } from 'react';
import {
  Stepper,
  Step,
  StepButton,
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Avatar,
  IconButton,
  useTheme,
  Dialog,
  AppBar,
  Toolbar,
  LinearProgress,
  Drawer,
  useMediaQuery
} from '@mui/material';
import {
  CheckCircle,
  Lock,
  NavigateNext,
  NavigateBefore,
  PlayArrow,
  Schedule,
  Close,
  ArrowForward,
  Chat
} from '@mui/icons-material';

import ActivityVideoSection from './ActivityVideoSection';
import ActivityBlurb from './ActivityBlurb';
import AssistantPanel from './AssistantPanel';
import activityData from '../data/activites.json';
import { ActivityContent, showsDashboardVideoSection } from '../utils/renderActivity';
import { normalizeActivity, isBlurb } from '../utils/normalizeActivity';
import { ActivitySessionProvider } from '../context/ActivitySessionContext';

const ASSISTANT_BREAKPOINT = '(min-width:1200px)';
const ASSISTANT_WIDTH = 360;

const ActivitiesStepper = ({ chapterNumber }) => {
  const theme = useTheme();
  const isWideAssistant = useMediaQuery(ASSISTANT_BREAKPOINT);
  const [currentPage, setCurrentPage] = useState(0);
  const [completed, setCompleted] = useState({});
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [activityResult, setActivityResult] = useState(null);
  const [assistantVisible, setAssistantVisible] = useState(true);
  const [assistantDrawerOpen, setAssistantDrawerOpen] = useState(false);

  const activitiesPerPage = 6;

  const chapter = parseInt(chapterNumber, 10);

  const allActivities = useMemo(() => {
    return activityData.activities
      .filter((a) => a.chapter === chapter)
      .sort((a, b) => a.id - b.id)
      .map((a) => {
        const normalized = normalizeActivity(a);
        return {
          id: normalized.id,
          title: normalized.title,
          description: normalized.description || '',
          duration: normalized.duration || 'varies',
          prerequisites: normalized.prerequisites || [],
          isBlurb: isBlurb(normalized),
          raw: normalized
        };
      });
  }, [chapter]);

  const totalPages = Math.max(1, Math.ceil(allActivities.length / activitiesPerPage));

  const startIndex = currentPage * activitiesPerPage;
  const currentActivities = allActivities.slice(startIndex, startIndex + activitiesPerPage);

  const isLocked = (activity) => activity.prerequisites.some((prereqId) => !completed[prereqId]);

  const isCompleted = (activityId) => completed[activityId];

  const handleActivityClick = (activity) => {
    if (isLocked(activity)) return;
    setSelectedActivity(activity);
    setActivityResult(null);
    setAssistantDrawerOpen(false);
    setActivityDialogOpen(true);
  };

  function handleActivityComplete(activityId, result) {
    setActivityResult(result);
    if (result && result.correct) {
      setCompleted((prev) => ({
        ...prev,
        [activityId]: true
      }));
    }
  }

  const handleNextActivity = () => {
    setActivityDialogOpen(false);
    setActivityResult(null);
    const currentIndex = allActivities.findIndex((a) => a.id === selectedActivity.id);
    const nextActivity = allActivities.slice(currentIndex + 1).find((a) => !isLocked(a));
    if (nextActivity) {
      setTimeout(() => {
        setSelectedActivity(nextActivity);
        setActivityDialogOpen(true);
      }, 300);
    }
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  };

  if (allActivities.length === 0) {
    return (
      <Box sx={{ maxWidth: 720, mx: 'auto', p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No activities are defined for chapter {chapterNumber} yet.
        </Typography>
      </Box>
    );
  }

  const completedCount = Object.values(completed).filter(Boolean).length;
  const pdfUrl = `https://coerll.utexas.edu/dib/pdfs/k_${String(chapter).padStart(2, '0')}.pdf`;

  return (
    <Box
      sx={{
        maxWidth: 1000,
        margin: '0 auto',
        p: { xs: 2, md: 3 },
        backgroundColor: 'background.default',
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Typography variant="h4" component="h1" gutterBottom align="center" color="text.primary">
        Chapter activities
      </Typography>

      <Typography variant="subtitle1" align="center" sx={{ mb: 1 }}>
        Based on{' '}
        <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
          COERLL Deutsch im Blick — Kapitel {chapter} workbook (PDF)
        </a>
      </Typography>

      <Typography variant="subtitle2" align="center" sx={{ mb: 3 }} color="text.secondary">
        Page {currentPage + 1} of {totalPages} · {allActivities.length} activities
      </Typography>

      <Stepper
        nonLinear
        alternativeLabel
        sx={{
          mb: 4,
          p: 2,
          bgcolor: 'background.paper',
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        {currentActivities.map((activity) => {
          const locked = isLocked(activity);
          const done = isCompleted(activity.id);
          if (activity.isBlurb) return null;
          return (
            <Step key={activity.id} completed={done}>
              <StepButton
                onClick={() => handleActivityClick(activity)}
                disabled={locked}
                icon={
                  <Avatar
                    sx={{
                      bgcolor: locked ? 'grey.300' : done ? 'grey.900' : 'grey.100',
                      color: locked ? 'grey.700' : done ? 'common.white' : 'text.primary',
                      width: 32,
                      height: 32
                    }}
                  >
                    {locked ? <Lock /> : done ? <CheckCircle /> : activity.id}
                  </Avatar>
                }
              >
                <Typography variant="caption" sx={{ display: 'block', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {activity.title.replace(/^Aktivität \d+\.\s*/, '')}
                </Typography>
              </StepButton>
            </Step>
          );
        })}
      </Stepper>

      <Box sx={{ display: 'grid', gap: 2 }}>
        {currentActivities.map((activity) => {
          const locked = isLocked(activity);
          const done = isCompleted(activity.id);

          if (activity.isBlurb) {
            return <ActivityBlurb key={activity.id} title={activity.title} text={activity.raw.text} />;
          }

          return (
            <Card
              key={activity.id}
              sx={{
                opacity: locked ? 0.7 : 1,
                cursor: locked ? 'not-allowed' : 'pointer',
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 1px 2px rgba(24, 24, 27, 0.05)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                '&:hover': {
                  transform: locked ? 'none' : 'translateY(-2px)',
                  boxShadow: locked ? '0 1px 2px rgba(24, 24, 27, 0.05)' : '0 8px 20px rgba(24, 24, 27, 0.08)',
                  borderColor: locked ? 'divider' : 'primary.light'
                }
              }}
              onClick={() => handleActivityClick(activity)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar
                    sx={{
                      mr: 2,
                      bgcolor: locked ? 'grey.300' : done ? 'grey.900' : 'grey.100',
                      color: locked ? 'grey.700' : done ? 'common.white' : 'text.primary'
                    }}
                  >
                    {locked ? <Lock /> : done ? <CheckCircle /> : activity.id}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h2">
                      {activity.title}
                      {locked && <Lock sx={{ fontSize: 18, ml: 1, verticalAlign: 'text-bottom' }} />}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {activity.description}
                    </Typography>
                  </Box>
                  <Chip icon={<Schedule />} label={activity.duration} size="small" variant="outlined" sx={{ mr: 1 }} />
                  <Chip
                    label={done ? 'Completed' : locked ? 'Locked' : 'Start'}
                    color={done ? 'default' : locked ? 'default' : 'primary'}
                    variant={done ? 'filled' : 'outlined'}
                    icon={!done && !locked ? <PlayArrow /> : undefined}
                  />
                </Box>
                {locked && activity.prerequisites.length > 0 && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    Complete prerequisites: {activity.prerequisites.map((id) => `Activity ${id}`).join(', ')}
                  </Typography>
                )}
              </CardContent>
            </Card>
          );
        })}
      </Box>

      <Dialog
        open={activityDialogOpen}
        onClose={() => setActivityDialogOpen(false)}
        fullScreen
        PaperProps={{
          sx: {
            bgcolor: 'background.default'
          }
        }}
      >
        <AppBar
          position="relative"
          color="transparent"
          elevation={0}
          sx={{
            bgcolor: 'rgba(255,255,255,0.96)',
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Toolbar sx={{ minHeight: 68 }}>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              {selectedActivity?.title}
            </Typography>
            <Button
              size="small"
              startIcon={<Chat />}
              onClick={() => {
                if (isWideAssistant) {
                  setAssistantVisible((visible) => !visible);
                } else {
                  setAssistantDrawerOpen((open) => !open);
                }
              }}
              sx={{ mr: 1 }}
            >
              {isWideAssistant
                ? assistantVisible
                  ? 'Hide assistant'
                  : 'Assistant'
                : assistantDrawerOpen
                  ? 'Hide assistant'
                  : 'Assistant'}
            </Button>
            <IconButton edge="end" color="inherit" onClick={() => setActivityDialogOpen(false)} aria-label="close">
              <Close />
            </IconButton>
          </Toolbar>
        </AppBar>

        {selectedActivity && (
          <ActivitySessionProvider
            key={`${selectedActivity.raw.chapter}-${selectedActivity.raw.id}`}
            activity={selectedActivity.raw}
          >
            <Box
              sx={{
                display: 'flex',
                height: 'calc(100% - 68px)',
                minHeight: 0,
                overflow: 'hidden'
              }}
            >
              <Box
                sx={{
                  flex: 1,
                  minWidth: 0,
                  minHeight: 0,
                  overflowY: 'auto',
                  p: { xs: 2, md: 3 },
                  maxWidth: isWideAssistant ? 'none' : 900,
                  mx: isWideAssistant ? 0 : 'auto',
                  width: '100%'
                }}
              >
                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  {showsDashboardVideoSection(selectedActivity.raw) && (
                    <ActivityVideoSection activity={selectedActivity.raw} />
                  )}
                  <ActivityContent
                    activity={selectedActivity.raw}
                    onComplete={(result) => handleActivityComplete(selectedActivity.id, result)}
                  />
                </Box>

                {activityResult?.correct && (
                  <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Button
                      variant="contained"
                      size="large"
                      endIcon={<ArrowForward />}
                      onClick={handleNextActivity}
                      sx={{
                        borderRadius: 3,
                        px: 4,
                        py: 1.5,
                        fontSize: '1.1rem'
                      }}
                    >
                      Next activity
                    </Button>
                  </Box>
                )}
              </Box>

              {isWideAssistant && (
                <Box
                  sx={(theme) => ({
                    width: assistantVisible ? ASSISTANT_WIDTH : 0,
                    flexShrink: 0,
                    minHeight: 0,
                    overflow: 'hidden',
                    borderLeft: assistantVisible ? '1px solid' : '0px solid transparent',
                    borderColor: 'divider',
                    transition: theme.transitions.create(['width', 'border-width'], {
                      easing: theme.transitions.easing.sharp,
                      duration: assistantVisible
                        ? theme.transitions.duration.enteringScreen
                        : theme.transitions.duration.leavingScreen
                    })
                  })}
                >
                  <Box
                    sx={{
                      width: ASSISTANT_WIDTH,
                      height: '100%',
                      minHeight: 0,
                      pointerEvents: assistantVisible ? 'auto' : 'none'
                    }}
                  >
                    <AssistantPanel />
                  </Box>
                </Box>
              )}
            </Box>

            {!isWideAssistant && (
              <Drawer
                anchor="right"
                open={assistantDrawerOpen}
                onClose={() => setAssistantDrawerOpen(false)}
                variant="temporary"
                ModalProps={{ keepMounted: true }}
                sx={{
                  '& .MuiDrawer-paper': {
                    width: ASSISTANT_WIDTH,
                    boxSizing: 'border-box'
                  }
                }}
              >
                <AssistantPanel onClose={() => setAssistantDrawerOpen(false)} />
              </Drawer>
            )}
          </ActivitySessionProvider>
        )}
      </Dialog>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4 }}>
        <Button startIcon={<NavigateBefore />} onClick={handlePrevPage} disabled={currentPage === 0} variant="outlined">
          Previous page
        </Button>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {Array.from({ length: totalPages }, (_, i) => (
            <Box
              key={i}
              onClick={() => setCurrentPage(i)}
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: currentPage === i ? 'primary.main' : 'grey.400',
                mx: 0.5,
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': { transform: 'scale(1.2)' }
              }}
            />
          ))}
        </Box>
        <Button endIcon={<NavigateNext />} onClick={handleNextPage} disabled={currentPage === totalPages - 1} variant="outlined">
          Next page
        </Button>
      </Box>

      <Paper
        sx={{
          p: 2,
          mt: 3,
          borderRadius: 3,
          bgcolor: 'background.paper',
          color: 'text.primary'
        }}
      >
        <Typography variant="h6" gutterBottom>
          Progress
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="body2">
              Completed: {completedCount} of {allActivities.length}
            </Typography>
          </Box>
          <Box sx={{ width: '60%' }}>
            <LinearProgress
              variant="determinate"
              value={allActivities.length ? (completedCount / allActivities.length) * 100 : 0}
              sx={{
                height: 10,
                borderRadius: 5,
                backgroundColor: '#e5e7eb',
                '& .MuiLinearProgress-bar': { backgroundColor: '#18181b' }
              }}
            />
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default ActivitiesStepper;
