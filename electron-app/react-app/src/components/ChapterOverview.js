// import React, { useEffect, useState } from 'react';
// import { Box } from '@mui/material';
// import ChapterCard from './ChapterCard';

// const ChapterOverview = ({ userId, chapters, initialProgress }) => {
//   const [progress, setProgress] = useState(initialProgress || []);

//   // Only needed for refresh/reload scenarios
//   useEffect(() => {
//     if (!initialProgress?.length) {
//       window.api.getChapterProgress(userId).then(setProgress);
//     }
//   }, [userId]);

//   return (
//     <Box
//       sx={{
//         display: 'flex',
//         justifyContent: 'center',
//         gap: 2,
//         flexWrap: 'wrap',
//         mt: 4,
//       }}
//     >
//       {chapters.map(chapter => {
//         // Find progress for this specific chapter
//         const chapterProgress = progress.find(p => p.chapter_id === chapter.id) || {};
//         const isLocked = chapterProgress ? Boolean(chapterProgress.locked) : true;
//         const isCompleted = chapterProgress ? Boolean(chapterProgress.completed) : false;

//         return (
//           <ChapterCard
//             key={chapter.id}
//             userId={userId}
//             chapter_name={chapter.chapter_name}
//             chapter_number={chapter.chapter_number}
//             chapter={chapter}
//             locked={isLocked} // Default to locked if not found
//             completed={isCompleted} // Default to not completed
//           />
//         );
//       })}
//     </Box>
//   );
// };

// export default ChapterOverview;
import React, { useEffect, useState } from 'react';
import { Box, Typography, Container } from '@mui/material';
import ChapterCard from './ChapterCard';

const ChapterOverview = ({ userId, chapters, initialProgress }) => {
  const [progress, setProgress] = useState(initialProgress || []);

  useEffect(() => {
    if (!initialProgress?.length) {
      window.api.getChapterProgress(userId).then(setProgress);
    }
  }, [userId]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography 
        variant="h3" 
        component="h1" 
        align="center" 
        gutterBottom 
        color="primary"
        sx={{ fontWeight: 'bold', mb: 1 }}
      >
        Course Chapters
      </Typography>
      
      <Typography 
        variant="subtitle1" 
        align="center" 
        sx={{ mb: 4, color: 'text.secondary' }}
      >
        Complete chapters in order to unlock new content
      </Typography>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: 3,
          mt: 4
        }}
      >
        {chapters.map(chapter => {
          const chapterProgress = progress.find(p => p.chapter_id === chapter.id) || {};
          // const isLocked = chapterProgress ? Boolean(chapterProgress.locked) : true;
          const isLocked = false; // TODO: remove this when done testing
          const isCompleted = chapterProgress ? Boolean(chapterProgress.completed) : false;

          return (
            <ChapterCard
              key={chapter.id}
              userId={userId}
              chapter_name={chapter.chapter_name}
              chapter_number={chapter.chapter_number}
              chapter={chapter}
              locked={isLocked}
              completed={isCompleted}
            />
          );
        })}
      </Box>
    </Container>
  );
};

export default ChapterOverview;