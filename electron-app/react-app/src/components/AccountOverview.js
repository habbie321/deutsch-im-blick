import React, { useEffect, useState } from 'react';
import { Box, Typography, Container } from '@mui/material';
import AccountCard from './AccountCard';

const AccountOverview = () => {
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    window.api.getAccounts().then(setAccounts);
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Typography 
        variant="h4"
        component="h1" 
        align="center" 
        gutterBottom 
        color="text.primary"
        sx={{ fontWeight: 700, mb: 0.75, letterSpacing: '-0.02em' }}
      >
        Deutsch im Blick
      </Typography>
      
      <Typography 
        variant="body2"
        align="center" 
        sx={{ mb: 4, color: 'text.secondary' }}
      >
        Select an account to continue
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(248px, 1fr))',
          justifyItems: 'center',
          gap: 1.5,
          mt: 2,
          maxWidth: 1040,
          mx: 'auto'
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