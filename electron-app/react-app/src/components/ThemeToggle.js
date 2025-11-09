import styled, { css } from 'styled-components';
import { useEffect, useState } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';

const Button = styled.button`
  background: transparent;
  border-radius: 3px;
  border: 2px solid #BF4F74;
  color: #BF4F74;
  margin: 0 1em;
  padding: 0.25em 1em;
`

function ThemeToggle(props) {
    const system = useMediaQuery('(prefers-color-scheme: light)');
    const [theme, setTheme] = useState(() => {
        // Try to load from localStorage, fallback to 'system'
        return localStorage.getItem('theme') || 'system';
    });

    function toggleTheme() {
        let nextTheme;
        if (theme === 'system') {
            nextTheme = system ? 'dark' : 'light';
        } else if (theme === 'light') {
            nextTheme = 'dark';
        } else {
            nextTheme = 'light';
        }
        setTheme(nextTheme);
        localStorage.setItem('theme', nextTheme);
    }

    useEffect(() => {
        if (theme === 'dark') {
            document.body.classList.remove('light');
            document.body.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
            document.body.classList.add('light');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    return (
        <Button onClick={toggleTheme}>{props.children}</Button>
    );
  }

  export default ThemeToggle;