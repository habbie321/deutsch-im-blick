import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useState } from 'react';
import BackButton from '../components/BackButton';
import { useNavigate } from 'react-router-dom';

const Button = styled.button`
  background: transparent;
  border-radius: 3px;
  border: 2px solid #BF4F74;
  color: #BF4F74;
  margin: 0 1em;
  padding: 0.25em 1em;
  font-size: 1.2rem;
`;

const CenteredContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 2em;
  margin-top: 2em;
`;

const CreateNewAccount = () => {
  const { id } = useParams();

  const [step, setStep] = useState(0);
  const [role, setRole] = useState('');
  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [newAccount, setNewAccount] = useState({});
  const navigate = useNavigate();

  if (step === 0) {
    return (
      <CenteredContainer>
        <p style={{ fontSize: '2rem', margin: 0 }}>Are you a student or a teacher?</p>
        <ButtonRow>
          <Button onClick={() => { setRole('student'); setStep(1); }}>I am a student</Button>
          <Button onClick={async () => {
            const updatedAccount = {
              id: Date.now(),
              first_name: 'Teacher',
              last_name: '',
              birthday,
              role: 'teacher'
            };
            setRole('teacher');
            setNewAccount(updatedAccount);
            await window.api.addAccount(updatedAccount);
            setStep(2);
          }}>I am a teacher</Button>
        </ButtonRow>
        <ButtonRow>
          <BackButton />
        </ButtonRow>
      </CenteredContainer>
    );
  }

  if (step === 1 && role === 'student') {
    return (
      <CenteredContainer>
        <p style={{ fontSize: '2rem', margin: 0 }}>Enter your name and birthday</p>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          style={{ margin: '1em', fontSize: '1.2rem' }}
        />
        <input
          type="date"
          value={birthday}
          onChange={e => setBirthday(e.target.value)}
          style={{ margin: '1em', fontSize: '1.2rem' }}
        />
        <ButtonRow>
          <Button onClick={() => setStep(0)}>Back</Button>
          <Button
            onClick={async () => {
              // Save student info here
              const updatedAccount = {
                first_name: name,
                last_name: '',
                birthday,
                role: 'student'
              };
              setNewAccount(updatedAccount);
              await window.api.addAccount(updatedAccount);
              setStep(3);
            }}
            disabled={!name || !birthday}
          >
            Continue
          </Button>
        </ButtonRow>
        <p style={{ marginTop: '1em', fontSize: '1rem', color: '#888' }}>
          (Everything is only saved locally)
        </p>
      </CenteredContainer>
    );
  }

  if ((step === 2 && role === 'teacher') || (step === 3 && role === 'student')) {
    navigate(`/`);
  }

};

export default CreateNewAccount;
