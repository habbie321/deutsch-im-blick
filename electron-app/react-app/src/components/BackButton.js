import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const BackButton = ({ children = "Back", to, compact = false, ...props }) => {
  const navigate = useNavigate();
  
  return (
    <Button 
      variant="text"
      color="inherit"
      startIcon={<ArrowBackIcon />}
      size={compact ? 'small' : 'medium'}
      sx={{
        justifyContent: 'flex-start',
        color: 'text.secondary',
        px: compact ? 1 : 1.5,
        minWidth: compact ? 0 : undefined
      }}
      onClick={() => to ? navigate(to) : navigate(-1)} 
      {...props}
    >
      {children}
    </Button>
  );
};

export default BackButton;