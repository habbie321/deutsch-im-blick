import { Box, Chip, Container, FormControlLabel, Paper, Switch, Typography } from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';
import PaletteIcon from '@mui/icons-material/Palette';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import SchoolIcon from '@mui/icons-material/School';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { useParams } from 'react-router-dom';
import BackButton from '../components/BackButton';
import { useAiSettings } from '../utils/aiSettings';

const SettingsPage = () => {
  const { id } = useParams();
  const { aiEnabled, setAiEnabled } = useAiSettings();

  const placeholderItems = [
    { icon: <PaletteIcon fontSize="small" />, title: 'Theme & appearance', desc: 'Light/dark mode, font sizing, and layout density.' },
    { icon: <VolumeUpIcon fontSize="small" />, title: 'Media preferences', desc: 'Video autoplay, captions, and playback behavior.' },
    { icon: <SchoolIcon fontSize="small" />, title: 'Learning defaults', desc: 'Preferred chapter, reminders, and progress behaviors.' }
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 3 }}>
      <Container maxWidth="md">
        <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Settings
            </Typography>
            <Chip icon={<TuneIcon />} label={`Account ${id}`} variant="outlined" />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
            Configure learning and assistant preferences for this account.
          </Typography>
        </Paper>

        <Paper sx={{ p: 2, borderRadius: 2.5, mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
            <SmartToyIcon fontSize="small" />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              AI assistant
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            When off, the assistant panel stays available but chat and answer checking will not call any AI service.
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={aiEnabled}
                onChange={(e) => setAiEnabled(e.target.checked)}
              />
            }
            label={aiEnabled ? 'AI assistant enabled' : 'AI assistant disabled'}
          />
        </Paper>

        <Box sx={{ display: 'grid', gap: 1.5 }}>
          {placeholderItems.map((item) => (
            <Paper key={item.title} sx={{ p: 2, borderRadius: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                {item.icon}
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {item.title}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {item.desc}
              </Typography>
            </Paper>
          ))}
        </Box>

        <Box sx={{ mt: 2 }}>
          <BackButton to={`/account/${id}`} />
        </Box>
      </Container>
    </Box>
  );
};

export default SettingsPage;
