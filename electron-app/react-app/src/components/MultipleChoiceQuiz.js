import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  useTheme
} from '@mui/material';
import {
  ArrowForward
} from '@mui/icons-material';

const MultipleChoiceQuiz = ({ quizData, onComplete }) => {
  const theme = useTheme();
  const [currentSet, setCurrentSet] = useState(0);
  const [completedSets, setCompletedSets] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  // Use the passed activityData instead of internal quizData
  const currentSetData = quizData.questionSets[currentSet];
  const allQuestions = currentSetData.questions;

  // Initialize answers when set changes
  useEffect(() => {
    setAnswers(Array(allQuestions.length).fill(null));
    setSubmitted(false);
  }, [currentSet, allQuestions.length]);

  const handleAnswerChange = (questionIndex, value) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = parseInt(value);
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const score = calculateScore();
    const perfectScore = score === allQuestions.length;

    if (perfectScore) {
      const newCompletedSets = [...completedSets, currentSetData.setId];
      setCompletedSets(newCompletedSets);

      // If this is the final set, auto-complete the activity
      if (currentSet === quizData.questionSets.length - 1) {
        onComplete({
          correct: true,
          score: newCompletedSets.length,
          total: quizData.questionSets.length
        });
      }
    }
  };

  const handleNextSet = () => {
    if (currentSet < quizData.questionSets.length - 1) {
      setCurrentSet(prev => prev + 1);
    } else {
      onComplete({
        correct: true,
        score: completedSets.length + 1, // +1 for current set
        total: quizData.questionSets.length
      });
    }
  };

  const calculateScore = () => {
    return answers.filter((answer, index) =>
      answer === allQuestions[index].correctAnswer
    ).length;
  };

  const allAnswered = answers.every(answer => answer !== null);
  const currentScore = calculateScore();
  const perfectScore = currentScore === allQuestions.length;

  return (
    <Box sx={{
      flexGrow: 1,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Progress Dots */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 3 }}>
        {quizData.questionSets.map((set, index) => (
          <Box
            key={set.setId}
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              bgcolor: completedSets.includes(set.setId)
                ? 'success.main'
                : index === currentSet
                  ? 'primary.main'
                  : 'grey.400',
              transition: 'all 0.3s ease'
            }}
          />
        ))}
      </Box>

      <Box sx={{
        textAlign: 'center',
        mb: 4,
        pt: 2
      }}>
        <Typography variant="h4" component="h2" gutterBottom color="primary">
          {quizData.title}
        </Typography>
        {currentSetData.title && (
          <Typography variant="h6" color="primary" gutterBottom>
            {currentSetData.title}
          </Typography>
        )}
        <Typography variant="body1" color="text.secondary">
          Set {currentSet + 1} of {quizData.questionSets.length}
        </Typography>
      </Box>

      {!submitted ? (
        <>
          <Box sx={{ flexGrow: 1 }}>
            {allQuestions.map((q, index) => (
              <Card
                key={q.id}
                sx={{
                  mb: 2,
                  border: answers[index] !== null ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
                  transition: 'border 0.3s ease'
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <Avatar sx={{
                      bgcolor: theme.palette.primary.main,
                      mr: 2,
                      mt: 0.5,
                      fontSize: '0.8rem'
                    }}>
                      {index + 1}
                    </Avatar>
                    <Box sx={{ width: '100%' }}>
                      <Typography variant="h6" component="h3" gutterBottom>
                        {q.question}
                      </Typography>
                      <Box>
                        {q.options.map((option, optIndex) => (
                          <Button
                            key={optIndex}
                            variant={answers[index] === optIndex ? "contained" : "outlined"}
                            onClick={() => handleAnswerChange(index, optIndex)}
                            sx={{
                              mr: 1,
                              mb: 1,
                              borderRadius: 2,
                              textTransform: 'none'
                            }}
                          >
                            {option}
                          </Button>
                        ))}
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleSubmit}
              disabled={!allAnswered}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                borderRadius: 3
              }}
            >
              Submit Answers
            </Button>
          </Box>
        </>
      ) : (
        <Box sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center'
        }}>
          <Avatar sx={{
            bgcolor: perfectScore ? 'success.main' : 'error.main',
            width: 80,
            height: 80,
            mb: 3
          }}>
            {perfectScore ? '✓' : '✗'}
          </Avatar>

          <Typography variant="h4" gutterBottom color={perfectScore ? 'success.main' : 'error.main'}>
            {perfectScore ? 'Perfect!' : 'Try Again'}
          </Typography>

          <Typography variant="h6" gutterBottom>
            You scored {currentScore} out of {allQuestions.length}
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mb: 3 }}>
            {perfectScore
              ? 'Great job! You answered all questions correctly.'
              : 'Some answers were incorrect. Review the material and try again.'}
          </Typography>

          {perfectScore && currentSet < quizData.questionSets.length - 1 ? (
            <Button
              variant="contained"
              size="large"
              onClick={handleNextSet}
              endIcon={<ArrowForward />}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                borderRadius: 3
              }}
            >
              Next Set
            </Button>
          ) : perfectScore ? (
            // Final set completed - show completion message instead of Next button
            <Box>
              <Typography variant="h6" color="success.main" gutterBottom>
                Activity Completed! 🎉
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You've finished all question sets.
              </Typography>
            </Box>
          ) : (
            <Button
              variant="outlined"
              size="large"
              onClick={() => {
                setAnswers(Array(allQuestions.length).fill(null));
                setSubmitted(false);
              }}
              sx={{ mt: 2 }}
            >
              Try Again
            </Button>
          )}

        </Box>
      )}
    </Box>
  );
};

export default MultipleChoiceQuiz;