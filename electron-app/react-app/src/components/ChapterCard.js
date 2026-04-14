import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const ChapterCard = ({ userId, chapter, chapter_number, chapter_name, completed = false, locked = true }) => {
  const navigate = useNavigate();
  const [elevation, setElevation] = useState(2);

  const handleClick = () => {
    if (locked) return;
    
    const num = chapter_number.toString().padStart(2, '0');
    navigate(`/account/${userId}/chapter/${num}`);
  };

  return (
    <Card
      sx={{
        width: 240,
        height: 160,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: locked ? 'grey.50' : (completed ? 'success.light' : 'primary.light'),
        color: locked ? 'grey.500' : 'common.white',
        opacity: locked ? 0.7 : 1,
        boxShadow: elevation,
        cursor: locked ? 'not-allowed' : 'pointer',
        transition: 'all 0.3s ease',
        margin: 1.5,
        position: 'relative',
        overflow: 'visible',
        '&:before': completed ? {
          content: '""',
          position: 'absolute',
          top: -4,
          right: -4,
          width: 16,
          height: 16,
          borderRadius: '50%',
          backgroundColor: 'success.main',
          border: '2px solid white',
          zIndex: 1
        } : {},
        '&:hover': {
          transform: locked ? 'none' : 'translateY(-4px)',
          boxShadow: locked ? 2 : 6
        }
      }}
      onMouseEnter={() => !locked && setElevation(4)}
      onMouseLeave={() => setElevation(2)}
    >
      <CardActionArea
        disabled={locked}
        onClick={handleClick}
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 1
        }}
      >
        {/* Chapter number badge */}
        <Box
          sx={{
            position: 'absolute',
            top: -12,
            left: -12,
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: locked ? 'grey.400' : (completed ? 'success.main' : 'primary.main'),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            boxShadow: 2
          }}
        >
          {chapter_number}
        </Box>

        <CardContent sx={{ textAlign: 'center', p: 1 }}>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
            {chapter_name}
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 1 }}>
            <Chip 
              icon={
                locked ? <LockIcon /> : 
                completed ? <CheckCircleIcon /> : 
                <PlayArrowIcon />
              }
              label={locked ? 'Locked' : completed ? 'Completed' : 'Start'} 
              size="small"
              color={locked ? 'default' : completed ? 'success' : 'primary'}
              variant={completed ? 'filled' : 'outlined'}
              sx={{ 
                color: locked ? 'grey.500' : 'inherit',
                backgroundColor: completed ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                borderColor: locked ? 'grey.400' : 'rgba(255, 255, 255, 0.5)'
              }}
            />
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default ChapterCard;