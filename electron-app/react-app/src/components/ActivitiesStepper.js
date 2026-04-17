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
  LinearProgress
} from '@mui/material';
import {
  CheckCircle,
  Lock,
  NavigateNext,
  NavigateBefore,
  PlayArrow,
  Schedule,
  Close,
  ArrowForward
} from '@mui/icons-material';

import MultipleChoiceQuiz from './MultipleChoiceQuiz';
import MatchingActivity from './MatchingActivity';
import WorkbookActivity from './WorkbookActivity';
import SelfCheckReadingActivity from './SelfCheckReadingActivity';
import WritingActivity from './WritingActivity';
import ClassificationGridActivity from './ClassificationGridActivity';
import ClozeActivity from './ClozeActivity';
import ActivityBlurb from './ActivityBlurb';
import ActivityVideoSection from './ActivityVideoSection';
import activityData from '../data/activites.json';

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
    default:
      return (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography color="error">Unknown activity type: {activity.type}</Typography>
        </Box>
      );
  }
}

const ActivitiesStepper = ({ chapterNumber }) => {
  const theme = useTheme();
  const [currentPage, setCurrentPage] = useState(0);
  const [completed, setCompleted] = useState({});
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [activityResult, setActivityResult] = useState(null);

  const activitiesPerPage = 6;

  const chapter = parseInt(chapterNumber, 10);

  const allActivities = useMemo(() => {
    return activityData.activities
      .filter((a) => a.chapter === chapter)
      .sort((a, b) => a.id - b.id)
      .map((a) => ({
        id: a.id,
        title: a.title,
        description: a.description || '',
        duration: a.duration || 'varies',
        prerequisites: a.prerequisites || [],
        type: a.type,
        raw: a
      }));
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
          if (activity.type === 'blurb') return null;
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

          if (activity.type === 'blurb') {
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
            <IconButton edge="end" color="inherit" onClick={() => setActivityDialogOpen(false)} aria-label="close">
              <Close />
            </IconButton>
          </Toolbar>
        </AppBar>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100% - 64px)',
            p: { xs: 2, md: 3 },
            maxWidth: 900,
            mx: 'auto',
            width: '100%',
            overflow: 'auto'
          }}
        >
          {selectedActivity && (
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              {selectedActivity.type !== 'classification_grid' &&
                selectedActivity.type !== 'multi_speaker_writing' && (
                  <ActivityVideoSection activity={selectedActivity.raw} />
                )}
              <ActivityContent
                activity={selectedActivity.raw}
                onComplete={(result) => handleActivityComplete(selectedActivity.id, result)}
              />
            </Box>
          )}

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
