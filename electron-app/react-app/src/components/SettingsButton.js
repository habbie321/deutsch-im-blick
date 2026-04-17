import { useNavigate, useLocation } from 'react-router-dom';
import Button from '@mui/material/Button';
import SettingsIcon from '@mui/icons-material/Settings';

const SettingsButton = ({ children = "Settings", to, compact = false, ...props }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  return (
    <Button 
      variant="text"
      color="inherit"
      startIcon={<SettingsIcon />}
      size={compact ? 'small' : 'medium'}
      sx={{
        justifyContent: 'flex-start',
        color: 'text.secondary',
        px: compact ? 1 : 1.5,
        minWidth: compact ? 0 : undefined
      }}
      onClick={() => to ? navigate(to) : navigate(`${location.pathname}/settings`)} 
      {...props}
    >
      {children}
    </Button>
  );
};

export default SettingsButton;