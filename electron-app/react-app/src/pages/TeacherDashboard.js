import { useParams } from 'react-router-dom';
import ChapterCard from '../components/ChapterCard';
import BackButton from '../components/BackButton';

const TeacherDashboard = () => {
  const { id } = useParams(); // 'id' is a string from the URL
  return (
    <div>
      <p>teacher stuff</p>
      <BackButton to='/'/>
    </div>
  );
};

export default TeacherDashboard;
