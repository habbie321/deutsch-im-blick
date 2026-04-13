import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Avatar,
  useTheme,
  Paper,
  Grid,
  Chip,
  Container
} from '@mui/material';
import {
  Check
} from '@mui/icons-material';

const MatchingActivity = ({ activityData, onComplete }) => {
  const theme = useTheme();
  const [leftItems, setLeftItems] = useState([]);
  const [rightItems, setRightItems] = useState([]);
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [matches, setMatches] = useState([]);

  const pairLeft = (pair) => pair.german ?? pair.left ?? pair.question ?? '';
  const pairRight = (pair) => pair.english ?? pair.right ?? pair.answer ?? '';

  // Initialize the matching pairs from activityData
  useEffect(() => {
    if (activityData && activityData.matchingPairs) {
      const germanItems = activityData.matchingPairs.map(pair => ({
        id: pair.id,
        text: pairLeft(pair),
        matched: false
      }));
      
      const englishItems = activityData.matchingPairs.map(pair => ({
        id: pair.id,
        text: pairRight(pair),
        matched: false
      }));

      // Shuffle both arrays for random order
      setLeftItems(shuffleArray(germanItems));
      setRightItems(shuffleArray(englishItems));
    }
  }, [activityData]);

  const shuffleArray = (array) => {
    return array.sort(() => Math.random() - 0.5);
  };

  const handleLeftItemClick = (item) => {
    if (item.matched) return;
    
    if (selectedLeft?.id === item.id) {
      setSelectedLeft(null);
    } else {
      setSelectedLeft(item);
      checkMatch(item, selectedRight);
    }
  };

  const handleRightItemClick = (item) => {
    if (item.matched) return;
    
    if (selectedRight?.id === item.id) {
      setSelectedRight(null);
    } else {
      setSelectedRight(item);
      checkMatch(selectedLeft, item);
    }
  };

  const checkMatch = (left, right) => {
    if (left && right) {
      if (left.id === right.id) {
        // Correct match
        setMatches(prev => [...prev, { leftId: left.id, rightId: right.id }]);
        
        // Update items to show they're matched
        setLeftItems(prev => prev.map(item => 
          item.id === left.id ? { ...item, matched: true } : item
        ));
        setRightItems(prev => prev.map(item => 
          item.id === right.id ? { ...item, matched: true } : item
        ));

        setSelectedLeft(null);
        setSelectedRight(null);

        // Check if all items are matched
        if (matches.length + 1 === leftItems.length) {
          onComplete({ correct: true, score: matches.length + 1, total: leftItems.length });
        }
      } else {
        // Incorrect match - show error briefly
        setTimeout(() => {
          setSelectedLeft(null);
          setSelectedRight(null);
        }, 1000);
      }
    }
  };

  const allMatched = matches.length === leftItems.length && leftItems.length > 0;

  return (
    <Box sx={{
      flexGrow: 1,
      display: 'flex',
      flexDirection: 'column',
      p: 3
    }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom color="primary">
          {activityData?.title || "Match the Pairs"}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {activityData?.matchInstruction || 'Match the items in the first column with the correct items in the second column.'}
        </Typography>
      </Box>

      {/* Matching Area - Centered Container */}
      <Container maxWidth="lg" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Grid container spacing={4} sx={{ 
          flexGrow: 1,
          justifyContent: 'center',
          alignItems: 'flex-start'
        }}>
          {/* German Column - Centered */}
          <Grid item xs={12} md={5}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              width: '100%'
            }}>
              <Typography variant="h6" gutterBottom color="primary">
                {activityData?.leftColumnTitle || 'German'}
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 2,
                width: '100%',
                maxWidth: 400
              }}>
                {leftItems.map((item) => (
                  <Paper
                    key={item.id}
                    onClick={() => handleLeftItemClick(item)}
                    sx={{
                      p: 3,
                      cursor: item.matched ? 'default' : 'pointer',
                      border: selectedLeft?.id === item.id 
                        ? `3px solid ${theme.palette.primary.main}`
                        : item.matched
                        ? `2px solid ${theme.palette.success.main}`
                        : `2px solid ${theme.palette.grey[300]}`,
                      backgroundColor: item.matched 
                        ? theme.palette.success.light 
                        : selectedLeft?.id === item.id
                        ? theme.palette.primary.light
                        : 'white',
                      transition: 'all 0.3s ease',
                      opacity: item.matched ? 0.7 : 1,
                      textAlign: 'center',
                      '&:hover': !item.matched ? {
                        transform: 'translateY(-2px)',
                        boxShadow: 3
                      } : {}
                    }}
                  >
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      gap: 1
                    }}>
                      <Typography variant="body1" fontWeight="medium" sx={{ textAlign: 'center' }}>
                        {item.text}
                      </Typography>
                      {item.matched && (
                        <Check color="success" />
                      )}
                    </Box>
                  </Paper>
                ))}
              </Box>
            </Box>
          </Grid>

          {/* English Column - Centered */}
          <Grid item xs={12} md={5}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              width: '100%'
            }}>
              <Typography variant="h6" gutterBottom color="primary">
                {activityData?.rightColumnTitle || 'English'}
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 2,
                width: '100%',
                maxWidth: 400
              }}>
                {rightItems.map((item) => (
                  <Paper
                    key={item.id}
                    onClick={() => handleRightItemClick(item)}
                    sx={{
                      p: 3,
                      cursor: item.matched ? 'default' : 'pointer',
                      border: selectedRight?.id === item.id 
                        ? `3px solid ${theme.palette.primary.main}`
                        : item.matched
                        ? `2px solid ${theme.palette.success.main}`
                        : `2px solid ${theme.palette.grey[300]}`,
                      backgroundColor: item.matched 
                        ? theme.palette.success.light 
                        : selectedRight?.id === item.id
                        ? theme.palette.primary.light
                        : 'white',
                      transition: 'all 0.3s ease',
                      opacity: item.matched ? 0.7 : 1,
                      textAlign: 'center',
                      '&:hover': !item.matched ? {
                        transform: 'translateY(-2px)',
                        boxShadow: 3
                      } : {}
                    }}
                  >
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      gap: 1
                    }}>
                      <Typography variant="body1" fontWeight="medium" sx={{ textAlign: 'center' }}>
                        {item.text}
                      </Typography>
                      {item.matched && (
                        <Check color="success" />
                      )}
                    </Box>
                  </Paper>
                ))}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Progress and Completion - Centered */}
      <Box sx={{ 
        textAlign: 'center', 
        mt: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <Chip
          label={`${matches.length} of ${leftItems.length} matched`}
          color="primary"
          variant="outlined"
          sx={{ mb: 2 }}
        />

        {allMatched && (
          <Box sx={{ maxWidth: 500, mx: 'auto' }}>
            <Avatar sx={{
              bgcolor: 'success.main',
              width: 60,
              height: 60,
              mx: 'auto',
              mb: 2
            }}>
              <Check sx={{ fontSize: 30 }} />
            </Avatar>
            
            <Typography variant="h5" color="success.main" gutterBottom>
              Perfect Match! 🎉
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              You successfully matched all the pairs!
            </Typography>
          </Box>
        )}

        {/* Instructions */}
        {!allMatched && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, maxWidth: 600, mx: 'auto' }}>
            Click one item in the left column, then its match in the right column.
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default MatchingActivity;