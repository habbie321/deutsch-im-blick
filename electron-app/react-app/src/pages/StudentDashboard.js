import { useParams } from 'react-router-dom';
import BackButton from '../components/BackButton';
import SettingsButton from '../components/SettingsButton';
import ChapterOverview from '../components/ChapterOverview';
import ProgressBar from '../components/ProgressBar';
import { Box, Container, Paper, Typography } from '@mui/material';

import { useLoaderData } from 'react-router-dom';

const StudentDashboard = () => {
  const { id } = useParams(); // 'id' is a string from the URL
  const userId = parseInt(id, 10);

  const { account, chapters, progress } = useLoaderData();
  console.log('Progress', progress)

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', py: 3 }}>
      <Container maxWidth="lg">
        <Paper sx={{ p: { xs: 2, md: 3 }, mb: 2, borderRadius: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
            {account.first_name}'s Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
            Track chapter progress and jump back into activities.
          </Typography>
        </Paper>

        <Paper sx={{ p: { xs: 2, md: 2.5 }, mb: 2, borderRadius: 3 }}>
          <ProgressBar userId={userId} initialProgress={progress} />
        </Paper>

        <Paper sx={{ p: { xs: 1.5, md: 2 }, mb: 2, borderRadius: 3 }}>
          <ChapterOverview userId={userId} initialProgress={progress} chapters={chapters} />
        </Paper>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <BackButton to='/' />
          <SettingsButton />
        </Box>
      </Container>
    </Box>
  );
};

export default StudentDashboard;
