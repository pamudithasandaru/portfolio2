import { useCallback, useEffect, useState } from 'react';

const readTheme = () => document.documentElement.getAttribute('data-theme') || 'light';

const useTheme = () => {
  const [theme, setTheme] = useState(readTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next = current === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('theme', next);
      } catch {
        // storage unavailable: the choice just won't persist
      }
      return next;
    });
  }, []);

  return { theme, toggleTheme };
};

export default useTheme;
