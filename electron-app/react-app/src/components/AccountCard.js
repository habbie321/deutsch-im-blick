import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import { useNavigate } from 'react-router-dom';
import {
  Person as PersonIcon,
  School as TeacherIcon,
  Add as AddIcon
} from '@mui/icons-material';

const AccountCard = ({ account }) => {
  const { first_name, role, id } = account;
  const navigate = useNavigate();
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
        width: 248,
        height: 184,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'background.paper',
        color: 'text.primary',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        boxShadow: '0 1px 2px rgba(24, 24, 27, 0.05)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        margin: 1,
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 12px 24px rgba(24, 24, 27, 0.08)'
        }
      }}
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
          padding: 2.5
        }}
      >
        {/* Avatar/Icon */}
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            backgroundColor: isNewAccount ? '#f4f4f5' : '#18181b',
            color: isNewAccount ? '#71717a' : '#fff',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2
          }}
        >
          {isNewAccount ? (
            <AddIcon sx={{ fontSize: 30 }} />
          ) : isTeacher ? (
            <TeacherIcon sx={{ fontSize: 30 }} />
          ) : (
            <PersonIcon sx={{ fontSize: 30 }} />
          )}
        </Box>

        <CardContent sx={{ textAlign: 'center', p: 0 }}>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 650, fontSize: '1rem' }}>
            {first_name}
          </Typography>
          
          <Chip 
            label={isNewAccount ? 'New Account' : (isTeacher ? 'Teacher' : 'Student')} 
            size="small"
            color="default"
            variant="outlined"
            sx={{ 
              color: 'text.secondary',
              borderColor: 'divider',
              bgcolor: '#fafafa'
            }}
          />
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default AccountCard;