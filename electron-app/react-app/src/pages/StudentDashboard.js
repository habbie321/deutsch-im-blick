import { useParams } from 'react-router-dom';
import BackButton from '../components/BackButton';
import SettingsButton from '../components/SettingsButton';
import ActivityVideoSection from '../components/ActivityVideoSection';
import MultipleChoiceQuiz from '../components/MultipleChoiceQuiz';
import MatchingActivity from '../components/MatchingActivity';
import WorkbookActivity from '../components/WorkbookActivity';
import SelfCheckReadingActivity from '../components/SelfCheckReadingActivity';
import WritingActivity from '../components/WritingActivity';
import ClassificationGridActivity from '../components/ClassificationGridActivity';
import ClozeActivity from '../components/ClozeActivity';
import ActivityBlurb from '../components/ActivityBlurb';
import activityData from '../data/activites.json';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  Paper,
  Typography
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useMemo, useState } from 'react';

import { useLoaderData } from 'react-router-dom';

function ActivityContent({ activity, onComplete }) {
  if (!activity) return null;

  switch (activity.type) {
    case 'multiple_choice':
      return <MultipleChoiceQuiz quizData={activity} onComplete={onComplete} />;
    case 'matching_activity':
    case 'qa_matching':
      return <MatchingActivity activityData={activity} onComplete={onComplete} />;
    case 'reading_self_check':
      return <SelfCheckReadingActivity activityData={activity} onComplete={onComplete} />;
    case 'workbook':
      return <WorkbookActivity activityData={activity} onComplete={onComplete} />;
    case 'writing':
    case 'multi_speaker_writing':
      return <WritingActivity activityData={activity} onComplete={onComplete} />;
    case 'classification_grid':
      return <ClassificationGridActivity activityData={activity} onComplete={onComplete} />;
    case 'cloze':
      return <ClozeActivity activityData={activity} onComplete={onComplete} />;
    case 'blurb':
      return <ActivityBlurb title={activity.title} text={activity.text} />;
    default:
      return (
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Typography color="error">Unknown activity type: {activity.type}</Typography>
        </Paper>
      );
  }
}

const StudentDashboard = () => {
  const { id } = useParams(); // 'id' is a string from the URL
  const userId = parseInt(id, 10);

  const { account, chapters } = useLoaderData();
  const initialChapter = Number(chapters?.[0]?.chapter_number || 1);
  const [expandedChapters, setExpandedChapters] = useState({ [initialChapter]: true });
  const [completedActivities, setCompletedActivities] = useState({});

  const chaptersWithActivities = useMemo(() => {
    const out = {};
    activityData.activities.forEach((a) => {
      if (!out[a.chapter]) out[a.chapter] = [];
      out[a.chapter].push(a);
    });
    Object.keys(out).forEach((k) => out[k].sort((a, b) => a.id - b.id));
    return out;
  }, []);

  const firstAvailableActivity = useMemo(() => {
    const list = chaptersWithActivities[initialChapter] || [];
    return list[0] || null;
  }, [chaptersWithActivities, initialChapter]);

  const [selectedRef, setSelectedRef] = useState({
    chapter: firstAvailableActivity?.chapter ?? initialChapter,
    id: firstAvailableActivity?.id ?? null
  });

  const selectedActivity = useMemo(() => {
    const list = chaptersWithActivities[Number(selectedRef.chapter)] || [];
    return list.find((a) => a.id === selectedRef.id) || list[0] || null;
  }, [chaptersWithActivities, selectedRef]);

  const isLocked = (activity) =>
    (activity.prerequisites || []).some((prereqId) => !completedActivities[`${activity.chapter}-${prereqId}`]);

  const isCompleted = (activity) => Boolean(completedActivities[`${activity.chapter}-${activity.id}`]);

  const handleComplete = (activity, result) => {
    if (result?.correct) {
      setCompletedActivities((prev) => ({ ...prev, [`${activity.chapter}-${activity.id}`]: true }));
    }
  };

  return (
    <Box
      sx={{
        height: '100vh',
        minHeight: '100vh',
        overflow: 'hidden',
        bgcolor: 'background.default',
        display: 'grid',
        gridTemplateRows: '1fr'
      }}
    >
      <Box sx={{ minHeight: 0, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '320px 1fr' } }}>
        <Box sx={{ minHeight: 0, borderRight: { md: '1px solid' }, borderColor: 'divider', bgcolor: 'background.paper', display: 'grid', gridTemplateRows: '1fr auto' }}>
          <Box sx={{ minHeight: 0, overflowY: 'auto' }}>
            <Box sx={{ px: 1.5, pt: 1.25, pb: 0.75, borderBottom: '1px solid', borderColor: 'divider', mb: 0.75 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                Signed in as
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {account.first_name}
              </Typography>
            </Box>

            <Typography variant="subtitle1" sx={{ fontWeight: 700, px: 1.5, pt: 0.5 }}>
              Chapters
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', px: 1.5, pb: 1 }}>
              Expand a chapter to choose an activity
            </Typography>
            {(chapters || []).map((ch) => {
              const chapterNum = Number(ch.chapter_number);
              const items = chaptersWithActivities[chapterNum] || [];
              return (
                <Accordion
                  key={ch.id}
                  disableGutters
                    expanded={Boolean(expandedChapters[chapterNum])}
                    onChange={(_, isExpanded) =>
                      setExpandedChapters((prev) => ({
                        ...prev,
                        [chapterNum]: isExpanded
                      }))
                    }
                  sx={{
                    boxShadow: 'none',
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 0,
                    '&:before': { display: 'none' }
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Kapitel {chapterNum}: {ch.chapter_name}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 0.5 }}>
                    <Box sx={{ display: 'grid', gap: 0.75 }}>
                      {items.map((a) => {
                        const locked = isLocked(a);
                        const done = isCompleted(a);
                        const selected =
                          selectedActivity &&
                          selectedActivity.chapter === a.chapter &&
                          selectedActivity.id === a.id;
                        return (
                          <Button
                            key={a.id}
                            onClick={() => !locked && setSelectedRef({ chapter: a.chapter, id: a.id })}
                            variant={selected ? 'contained' : 'text'}
                            color={selected ? 'primary' : 'inherit'}
                            disabled={locked}
                            sx={{
                              justifyContent: 'space-between',
                              px: 1.25,
                              py: 0.65,
                              borderRadius: 1,
                              color: selected ? 'common.white' : 'text.primary'
                            }}
                          >
                            <Typography variant="caption" sx={{ textAlign: 'left' }}>
                              {a.id}. {a.title.replace(/^Aktivität\s+[\d.]+\.\s*/, '')}
                            </Typography>
                            {locked ? <LockIcon sx={{ fontSize: 14, ml: 1 }} /> : done ? <CheckCircleIcon sx={{ fontSize: 14, ml: 1 }} /> : <PlayArrowIcon sx={{ fontSize: 14, ml: 1 }} />}
                          </Button>
                        );
                      })}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </Box>

          <Box sx={{ borderTop: '1px solid', borderColor: 'divider', p: 1, display: 'grid', gap: 0.25, bgcolor: '#fcfcfd' }}>
            <BackButton to="/" compact />
            <SettingsButton compact />
          </Box>
        </Box>

        <Box sx={{ minHeight: 0, overflowY: 'auto', p: { xs: 1.5, md: 2 }, bgcolor: '#fcfcfd' }}>
          {selectedActivity ? (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {selectedActivity.title}
                </Typography>
                <Chip size="small" label={selectedActivity.duration || 'varies'} variant="outlined" />
              </Box>

              {selectedActivity.type !== 'classification_grid' && selectedActivity.type !== 'multi_speaker_writing' && (
                <ActivityVideoSection activity={selectedActivity} />
              )}

              <ActivityContent activity={selectedActivity} onComplete={(result) => handleComplete(selectedActivity, result)} />
            </Box>
          ) : (
            <Typography color="text.secondary">Select a chapter and activity to begin.</Typography>
          )}
        </Box>
      </Box>

    </Box>
  );
};

export default StudentDashboard;
