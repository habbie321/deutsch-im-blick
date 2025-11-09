import React, { useState } from 'react';
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

// Import your MultipleChoiceQuiz component (adjust path as needed)
import MultipleChoiceQuiz from './MultipleChoiceQuiz';
import MatchingActivity from './MatchingActivity';
import activityData from '../data/activites.json';

const ActivitiesStepper = ({chapterNumber}) => {
  const theme = useTheme();
  const [currentPage, setCurrentPage] = useState(0);
  const [completed, setCompleted] = useState({});
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [activityResult, setActivityResult] = useState(null);
  const activitiesPerPage = 5;

  // Sample activities data with activity types
  const allActivities = [
    {
      id: 1,
      title: activityData.activities.find(item => item.id === 1 && item.chapter === parseInt(chapterNumber, 10)).title,
      description: "Answer the questions about Harald and Peter's interviews.",
      duration: "10 min",
      prerequisites: [],
      type: "multipleChoice",
      component: <MultipleChoiceQuiz onComplete={handleActivityComplete} showNextButton={true}
        quizData={activityData.activities.find(item => item.id === 1 && item.chapter === parseInt(chapterNumber, 10))} />
    },
    {
      id: 2,
      title: activityData.activities.find(item => item.id === 2 && item.chapter === parseInt(chapterNumber, 10)).title,
      description: "Listen to the interviews again. What questions does the interviewer ask, and what do the questions mean?",
      duration: "15 min",
      prerequisites: [],
      type: "fillInBlank",
      component: <MatchingActivity 
    onComplete={handleActivityComplete}
    activityData={activityData.activities.find(item => item.id === 2 && item.chapter === parseInt(chapterNumber, 10))}
  />
    },
    {
      id: 3,
      title: "Listening Practice",
      description: "Improve your listening skills",
      duration: "20 min",
      prerequisites: [1],
      type: "listening",
      component: <PlaceholderActivity title="Listening Practice" type="listening" onComplete={handleActivityComplete} />
    },
    {
      id: 4,
      title: "Speaking Exercise",
      description: "Practice pronunciation",
      duration: "15 min",
      prerequisites: [2, 3],
      type: "speaking",
      component: <PlaceholderActivity title="Speaking Exercise" type="speaking" onComplete={handleActivityComplete} />
    },
    {
      id: 5,
      title: "Reading Comprehension",
      description: "Read and answer questions",
      duration: "25 min",
      prerequisites: [1],
      type: "reading",
      component: <PlaceholderActivity title="Reading Comprehension" type="reading" onComplete={handleActivityComplete} />
    },
    {
      id: 6,
      title: "Writing Practice",
      description: "Write a short paragraph",
      duration: "30 min",
      prerequisites: [4, 5],
      type: "writing",
      component: <PlaceholderActivity title="Writing Practice" type="writing" onComplete={handleActivityComplete} />
    },
    {
      id: 7,
      title: "Review Session",
      description: "Recap of key points",
      duration: "15 min",
      prerequisites: [6],
      type: "review",
      component: <PlaceholderActivity title="Review Session" type="review" onComplete={handleActivityComplete} />
    },
    {
      id: 8,
      title: "Assessment",
      description: "Test your understanding",
      duration: "45 min",
      prerequisites: [7],
      type: "assessment",
      component: <PlaceholderActivity title="Assessment" type="assessment" onComplete={handleActivityComplete} />
    }
  ];

  // Calculate total pages needed
  const totalPages = Math.ceil(allActivities.length / activitiesPerPage);

  // Get activities for current page
  const startIndex = currentPage * activitiesPerPage;
  const endIndex = startIndex + activitiesPerPage;
  const currentActivities = allActivities.slice(startIndex, endIndex);

  // Check if an activity is locked (prerequisites not completed)
  const isLocked = (activity) => {
    return activity.prerequisites.some(prereqId => !completed[prereqId]);
  };

  // Check if an activity is completed
  const isCompleted = (activityId) => {
    return completed[activityId];
  };

  // Handle activity click
  const handleActivityClick = (activity) => {
    if (isLocked(activity)) return;

    setSelectedActivity(activity);
    setActivityResult(null);
    setActivityDialogOpen(true);
  };

  // Handle activity completion
  function handleActivityComplete(activityId, result) {
    setActivityResult(result);

    if (result && result.correct) {
      setCompleted(prev => ({
        ...prev,
        [activityId]: true
      }));
    }
  }

  // Handle next activity
  const handleNextActivity = () => {
    setActivityDialogOpen(false);
    setActivityResult(null);

    // Find the next unlocked activity
    const currentIndex = allActivities.findIndex(a => a.id === selectedActivity.id);
    const nextActivity = allActivities.slice(currentIndex + 1).find(a => !isLocked(a));

    if (nextActivity) {
      setTimeout(() => {
        setSelectedActivity(nextActivity);
        setActivityDialogOpen(true);
      }, 300);
    }
  };

  // Navigate to next page
  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages - 1));
  };

  // Navigate to previous page
  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 0));
  };

  return (
    <Box sx={{
      maxWidth: 1000,
      margin: '0 auto',
      p: 3,
      backgroundColor: theme.palette.grey[100],
      borderRadius: 2,
      boxShadow: 2
    }}>
      <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
        Chapter Activities
      </Typography>

      <Typography variant="subtitle1" align="center" sx={{ mb: 3 }}>
        Page {currentPage + 1} of {totalPages} • {allActivities.length} activities total
      </Typography>

      {/* Stepper component */}
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
          const completed = isCompleted(activity.id);

          return (
            <Step key={activity.id} completed={completed}>
              <StepButton
                onClick={() => handleActivityClick(activity)}
                disabled={locked}
                icon={
                  <Avatar
                    sx={{
                      bgcolor: locked ? 'grey.400' : completed ? 'success.main' : 'primary.main',
                      width: 32,
                      height: 32
                    }}
                  >
                    {locked ? <Lock /> : completed ? <CheckCircle /> : activity.id}
                  </Avatar>
                }
              >
                {activity.title}
              </StepButton>
            </Step>
          );
        })}
      </Stepper>

      {/* Activity Cards */}
      <Box sx={{ display: 'grid', gap: 2 }}>
        {currentActivities.map((activity) => {
          const locked = isLocked(activity);
          const completed = isCompleted(activity.id);

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
                      bgcolor: locked ? 'grey.400' : completed ? 'success.main' : 'primary.main'
                    }}
                  >
                    {locked ? <Lock /> : completed ? <CheckCircle /> : activity.id}
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

                  <Chip
                    icon={<Schedule />}
                    label={activity.duration}
                    size="small"
                    variant="outlined"
                    sx={{ mr: 1 }}
                  />

                  <Chip
                    label={completed ? 'Completed' : (locked ? 'Locked' : 'Start')}
                    color={completed ? 'success' : (locked ? 'default' : 'primary')}
                    variant={completed ? 'filled' : 'outlined'}
                    icon={!completed && !locked ? <PlayArrow /> : undefined}
                  />
                </Box>

                {locked && activity.prerequisites.length > 0 && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    Complete prerequisites: {activity.prerequisites.map(id => `Activity ${id}`).join(', ')}
                  </Typography>
                )}
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {/* Full-screen Activity Dialog */}
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
            <IconButton
              edge="end"
              color="inherit"
              onClick={() => setActivityDialogOpen(false)}
              aria-label="close"
            >
              <Close />
            </IconButton>
          </Toolbar>
        </AppBar>

        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100% - 64px)',
          p: 3,
          maxWidth: 900,
          mx: 'auto',
          width: '100%'
        }}>
          {selectedActivity && (
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              {React.cloneElement(selectedActivity.component, {
                onComplete: (result) => handleActivityComplete(selectedActivity.id, result),
                showNextButton: activityResult?.correct
              })}
            </Box>
          )}

          {/* Next Activity Button */}
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
                Next Activity
              </Button>
            </Box>
          )}
        </Box>
      </Dialog>

      {/* Pagination controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4 }}>
        <Button
          startIcon={<NavigateBefore />}
          onClick={handlePrevPage}
          disabled={currentPage === 0}
          variant="outlined"
        >
          Previous Page
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
                '&:hover': {
                  transform: 'scale(1.2)'
                }
              }}
            />
          ))}
        </Box>

        <Button
          endIcon={<NavigateNext />}
          onClick={handleNextPage}
          disabled={currentPage === totalPages - 1}
          variant="outlined"
        >
          Next Page
        </Button>
      </Box>

      {/* Progress summary */}
      <Paper sx={{ p: 2, mt: 3, backgroundColor: 'primary.light', color: 'primary.contrastText' }}>
        <Typography variant="h6" gutterBottom>
          Progress Summary
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="body2">
              Completed: {Object.values(completed).filter(Boolean).length} of {allActivities.length} activities
            </Typography>
          </Box>
          <Box sx={{ width: '60%' }}>
            <LinearProgress
              variant="determinate"
              value={(Object.values(completed).filter(Boolean).length / allActivities.length) * 100}
              sx={{
                height: 10,
                borderRadius: 5,
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: 'white'
                }
              }}
            />
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

// Placeholder activity component for demonstration
const PlaceholderActivity = ({ title, type, onComplete }) => {
  const theme = useTheme();

  const activityTypes = {
    fillInBlank: {
      title: "Fill in the Blanks",
      description: "Complete the sentences with the correct words",
      color: theme.palette.info.main
    },
    listening: {
      title: "Listening Exercise",
      description: "Listen to the audio and answer the questions",
      color: theme.palette.warning.main
    },
    speaking: {
      title: "Speaking Practice",
      description: "Record your voice and get feedback",
      color: theme.palette.success.main
    },
    reading: {
      title: "Reading Comprehension",
      description: "Read the text and answer questions",
      color: theme.palette.primary.main
    },
    writing: {
      title: "Writing Exercise",
      description: "Write a response to the prompt",
      color: theme.palette.secondary.main
    },
    review: {
      title: "Review Session",
      description: "Review what you've learned so far",
      color: theme.palette.info.main
    },
    assessment: {
      title: "Assessment",
      description: "Test your knowledge of the chapter",
      color: theme.palette.error.main
    }
  };

  const activity = activityTypes[type] || {
    title: "Activity",
    description: "Complete this activity",
    color: theme.palette.primary.main
  };

  const [completed, setCompleted] = useState(false);

  const handleComplete = () => {
    setCompleted(true);
    if (onComplete) {
      onComplete({ correct: true });
    }
  };

  return (
    <Box sx={{
      flexGrow: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center'
    }}>
      <Avatar sx={{
        bgcolor: activity.color,
        width: 80,
        height: 80,
        mb: 3
      }}>
        <PlayArrow sx={{ fontSize: 40 }} />
      </Avatar>

      <Typography variant="h4" component="h2" gutterBottom color={activity.color}>
        {activity.title}
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mb: 4 }}>
        {activity.description}
      </Typography>

      <Box sx={{
        p: 4,
        border: `2px dashed ${theme.palette.grey[300]}`,
        borderRadius: 3,
        textAlign: 'center',
        mb: 4,
        backgroundColor: 'white',
        boxShadow: 1
      }}>
        <Typography variant="body2" color="text.secondary">
          This is a placeholder for the <strong>{title}</strong> activity.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          In the actual app, this would contain the interactive content.
        </Typography>
      </Box>

      {!completed ? (
        <Button
          variant="contained"
          size="large"
          onClick={handleComplete}
          sx={{
            px: 4,
            py: 1.5,
            fontSize: '1.1rem',
            borderRadius: 3
          }}
        >
          Mark as Complete
        </Button>
      ) : (
        <Box>
          <Typography variant="h6" color="success.main" gutterBottom>
            Activity Completed Successfully!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You can now proceed to the next activity.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ActivitiesStepper;