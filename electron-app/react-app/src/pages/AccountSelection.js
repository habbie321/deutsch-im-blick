import ThemeToggle from '../components/ThemeToggle';
import AccountOverview from '../components/AccountOverview';
import { Box } from '@mui/material';

const AccountSelection = () => {
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', py: 2 }}>
      <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
        <ThemeToggle>Toggle Dark Mode</ThemeToggle>
      </Box>
      
      <AccountOverview />
      
      <Box sx={{ textAlign: 'center', mt: 4, color: 'text.secondary' }}>
        <p id="info">Deutsch im Blick - Interactive German Learning Platform</p>
      </Box>
    </Box>
  );
}

export default AccountSelection;