import { useParams } from 'react-router-dom';
import BackButton from '../components/BackButton';
import SettingsButton from '../components/SettingsButton';
import ChapterOverview from '../components/ChapterOverview';
import ProgressBar from '../components/ProgressBar';

import { useLoaderData } from 'react-router-dom';

const StudentDashboard = () => {
  const { id } = useParams(); // 'id' is a string from the URL
  const userId = parseInt(id, 10);

  const { account, chapters, progress } = useLoaderData();
  console.log('Progress', progress)

  return (
    <div>
      <h1 style={{
        fontSize: "2.5rem",
        fontWeight: 700,
        lineHeight: 1.2,
        marginBottom: "1rem",
        marginLeft: "1rem"
      }}>{account.first_name}'s Dashboard</h1>
      <ProgressBar userId={userId} initialProgress={progress}/>
      <ChapterOverview userId={userId} initialProgress={progress} chapters={chapters} />
      <BackButton to='/' />
      <SettingsButton />
    </div>
  );
};

export default StudentDashboard;
