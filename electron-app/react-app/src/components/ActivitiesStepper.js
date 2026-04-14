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
      return <WritingActivity activityData={activity} onComplete={onComplete} />;
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
        p: 3,
        backgroundColor: theme.palette.grey[100],
        borderRadius: 2,
        boxShadow: 2
      }}
    >
      <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
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
          backgroundColor: 'white',
          borderRadius: 2,
          boxShadow: 1
        }}
      >
        {currentActivities.map((activity) => {
          const locked = isLocked(activity);
          const done = isCompleted(activity.id);
          return (
            <Step key={activity.id} completed={done}>
              <StepButton
                onClick={() => handleActivityClick(activity)}
                disabled={locked}
                icon={
                  <Avatar
                    sx={{
                      bgcolor: locked ? 'grey.400' : done ? 'success.main' : 'primary.main',
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
          return (
            <Card
              key={activity.id}
              sx={{
                opacity: locked ? 0.7 : 1,
                cursor: locked ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  transform: locked ? 'none' : 'translateY(-4px)',
                  boxShadow: locked ? 1 : 4
                }
              }}
              onClick={() => handleActivityClick(activity)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar
                    sx={{
                      mr: 2,
                      bgcolor: locked ? 'grey.400' : done ? 'success.main' : 'primary.main'
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
                    color={done ? 'success' : locked ? 'default' : 'primary'}
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
            background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)'
          }
        }}
      >
        <AppBar position="relative" color="transparent" elevation={1}>
          <Toolbar>
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
            p: 3,
            maxWidth: 900,
            mx: 'auto',
            width: '100%',
            overflow: 'auto'
          }}
        >
          {selectedActivity && (
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <ActivityVideoSection activity={selectedActivity.raw} />
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
                  fontSize: '1.1rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
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

      <Paper sx={{ p: 2, mt: 3, backgroundColor: 'primary.light', color: 'primary.contrastText' }}>
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
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                '& .MuiLinearProgress-bar': { backgroundColor: 'white' }
              }}
            />
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default ActivitiesStepper;
