import { useState, useEffect } from 'react';

const STORAGE_KEY = 'nendoroid-theme';

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(pref) {
  return pref === 'system' ? getSystemTheme() : pref;
}

export function useTheme() {
  const [pref, setPref] = useState(() => localStorage.getItem(STORAGE_KEY) ?? 'system');

  useEffect(() => {
    const apply = () => {
      const resolved = resolveTheme(pref);
      document.documentElement.setAttribute('data-theme', resolved);
    };
    apply();

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [pref]);

  const setTheme = (val) => {
    setPref(val);
    localStorage.setItem(STORAGE_KEY, val);
  };

  return { pref, setTheme };
}
