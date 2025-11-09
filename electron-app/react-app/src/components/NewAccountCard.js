import React, { useState } from 'react';
import AccountCard from './AccountCard';

const NewAccountCard = () => {
    return (<AccountCard account={{id: 0, first_name: "Create New Account"}}></AccountCard>)
}

export default NewAccountCard;