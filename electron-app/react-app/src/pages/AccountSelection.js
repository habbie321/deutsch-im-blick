import ThemeToggle from '../components/ThemeToggle';
import AccountOverview from '../components/AccountOverview';
import { Box, Typography } from '@mui/material';

const AccountSelection = () => {
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', py: 2 }}>
      <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
        <ThemeToggle>Toggle Dark Mode</ThemeToggle>
      </Box>
      
      <AccountOverview />
      
      <Typography id="info" variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 4, color: 'text.secondary' }}>
        Deutsch im Blick - Interactive German Learning Platform
      </Typography>
    </Box>
  );
}

export default AccountSelection;