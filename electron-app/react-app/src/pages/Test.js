import { useParams } from 'react-router-dom';

const Test = () => {
  const { id } = useParams(); // 'id' is a string from the URL
  return (<div> <p>weeeee</p></div>);
};

export default Test;
