import { useNavigate } from 'react-router-dom';
import styled, { css } from 'styled-components';

const Button = styled.button`
  background: transparent;
  border-radius: 3px;
  border: 2px solid #BF4F74;
  color: #BF4F74;
  margin: 0 1em;
  padding: 0.25em 1em;
  font-size: 1.2rem;
`;

const BackButton = ({ children = "Back", to, ...props }) => {
  const navigate = useNavigate();
  
  return (
    <Button 
      onClick={() => to ? navigate(to) : navigate(-1)} 
      {...props}
    >
      {children}
    </Button>
  );
};

export default BackButton;