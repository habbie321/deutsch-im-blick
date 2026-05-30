import React from 'react';
import { Paper, Typography } from '@mui/material';
import MultipleChoiceQuiz from '../components/MultipleChoiceQuiz';
import MatchingActivity from '../components/MatchingActivity';
import WorkbookActivity from '../components/WorkbookActivity';
import SelfCheckReadingActivity from '../components/SelfCheckReadingActivity';
import WritingActivity from '../components/WritingActivity';
import ClassificationGridActivity from '../components/ClassificationGridActivity';
import ClozeActivity from '../components/ClozeActivity';
import MultiPageActivity from '../components/MultiPageActivity';
import PromptActivity from '../components/PromptActivity';
import ActivityBlurb from '../components/ActivityBlurb';
import { isBlurb, isExercise, normalizeActivity, PAGE_TYPES } from './normalizeActivity';

export function renderPage(pageNode, onNodeComplete) {
  switch (pageNode.type) {
    case 'multiple_choice':
      return <MultipleChoiceQuiz quizData={pageNode} onComplete={onNodeComplete} />;
    case 'matching_activity':
      return <MatchingActivity activityData={pageNode} onComplete={onNodeComplete} />;
    case 'reading_self_check':
      return <SelfCheckReadingActivity activityData={pageNode} onComplete={onNodeComplete} />;
    case 'workbook':
      return <WorkbookActivity activityData={pageNode} onComplete={onNodeComplete} />;
    case 'prompt':
      return <PromptActivity activityData={pageNode} onComplete={onNodeComplete} />;
    case 'writing':
      return <WritingActivity activityData={pageNode} onComplete={onNodeComplete} />;
    case 'classification_grid':
      return <ClassificationGridActivity activityData={pageNode} onComplete={onNodeComplete} />;
    case 'cloze':
      return <ClozeActivity activityData={pageNode} onComplete={onNodeComplete} />;
    default:
      return (
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Typography color="error">Unknown page type: {pageNode.type}</Typography>
        </Paper>
      );
  }
}

export function renderActivity(activityNode, onNodeComplete) {
  const activity = normalizeActivity(activityNode);

  if (isBlurb(activity)) {
    return <ActivityBlurb title={activity.title} text={activity.text} />;
  }

  if (isExercise(activity)) {
    return (
      <MultiPageActivity
        activityData={activity}
        onComplete={onNodeComplete}
        renderPageContent={(pageActivity, completePage) => renderPage(pageActivity, completePage)}
      />
    );
  }

  if (activityNode?.type && PAGE_TYPES.has(activityNode.type)) {
    return renderPage(activityNode, onNodeComplete);
  }

  return (
    <Paper sx={{ p: 2, borderRadius: 2 }}>
      <Typography color="error">Invalid activity: needs pages[] or text</Typography>
    </Paper>
  );
}

/** Whether ActivityVideoSection is rendered by the dashboard (not inside the activity). */
export function showsDashboardVideoSection(activity) {
  if (!activity) return false;
  const normalized = normalizeActivity(activity);
  return !isBlurb(normalized) && !isExercise(normalized);
}

/** Shared wrapper used by StudentDashboard and ActivitiesStepper. */
export function ActivityContent({ activity, onComplete }) {
  if (!activity) return null;
  return renderActivity(activity, onComplete);
}
