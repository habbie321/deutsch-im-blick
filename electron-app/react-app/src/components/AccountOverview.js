import React, { useEffect, useState } from 'react';
import { Box, Typography, Container } from '@mui/material';
import AccountCard from './AccountCard';
import NewAccountCard from './NewAccountCard';

const AccountOverview = () => {
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    window.api.getAccounts().then(setAccounts);
  }, []);

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
        Deutsch im Blick
      </Typography>
      
      <Typography 
        variant="subtitle1" 
        align="center" 
        sx={{ mb: 4, color: 'text.secondary' }}
      >
        Select an account to continue
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
        {accounts.map(account => (
          <AccountCard key={account.id} account={account} />
        ))}
        <AccountCard account={{id: 0, first_name: "Create New Account", role: "new"}} />
      </Box>
    </Container>
  );
};

export default AccountOverview;