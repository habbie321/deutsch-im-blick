import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  Person as PersonIcon,
  School as TeacherIcon,
  Add as AddIcon
} from '@mui/icons-material';

const AccountCard = ({ account }) => {
  const { first_name, role, id } = account;
  const navigate = useNavigate();
  const [elevation, setElevation] = useState(2);
  const isNewAccount = id === 0;
  const isTeacher = role === 'teacher';

  const handleClick = () => {
    if (isNewAccount) {
      navigate('/account/new');
    } else if (isTeacher) {
      navigate(`/account/${role}`);
    } else {
      navigate(`/account/${id}`);
    }
  };

  return (
    <Card
      sx={{
        width: 260,
        height: 220,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isNewAccount ? 'grey.50' : (isTeacher ? 'secondary.light' : 'primary.light'),
        color: isNewAccount ? 'grey.600' : 'common.white',
        boxShadow: elevation,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        margin: 1.5,
        position: 'relative',
        overflow: 'visible',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6
        }
      }}
      onMouseEnter={() => setElevation(4)}
      onMouseLeave={() => setElevation(2)}
    >
      <CardActionArea
        onClick={handleClick}
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 2
        }}
      >
        {/* Avatar/Icon */}
        <Box
          sx={{
            width: 70,
            height: 70,
            borderRadius: '50%',
            backgroundColor: isNewAccount ? 'grey.300' : (isTeacher ? 'secondary.main' : 'primary.main'),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            mb: 2,
            boxShadow: 3
          }}
        >
          {isNewAccount ? (
            <AddIcon sx={{ fontSize: 40 }} />
          ) : isTeacher ? (
            <TeacherIcon sx={{ fontSize: 40 }} />
          ) : (
            <PersonIcon sx={{ fontSize: 40 }} />
          )}
        </Box>

        <CardContent sx={{ textAlign: 'center', p: 0 }}>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
            {first_name}
          </Typography>
          
          <Chip 
            label={isNewAccount ? 'New Account' : (isTeacher ? 'Teacher' : 'Student')} 
            size="small"
            color={isNewAccount ? 'default' : (isTeacher ? 'secondary' : 'primary')}
            variant={isNewAccount ? 'outlined' : 'filled'}
            sx={{ 
              color: isNewAccount ? 'grey.600' : 'white',
              backgroundColor: isNewAccount ? 'transparent' : 'rgba(255, 255, 255, 0.2)',
              borderColor: isNewAccount ? 'grey.400' : 'rgba(255, 255, 255, 0.5)'
            }}
          />
        </CardContent>

        {/* Decorative elements */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            width: 16,
            height: 16,
            borderRadius: '50%',
            backgroundColor: isNewAccount ? 'grey.400' : (isTeacher ? 'secondary.main' : 'primary.main'),
            opacity: 0.7
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: isNewAccount ? 'grey.400' : (isTeacher ? 'secondary.main' : 'primary.main'),
            opacity: 0.7
          }}
        />
      </CardActionArea>
    </Card>
  );
};

export default AccountCard;