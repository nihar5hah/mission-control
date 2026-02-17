'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Initialize theme on mount
    const html = document.documentElement;
    const storedTheme = localStorage.getItem('theme');

    let shouldBeDark = false;

    if (storedTheme === 'dark') {
      shouldBeDark = true;
    } else if (storedTheme === 'light') {
      shouldBeDark = false;
    } else {
      // Check system preference
      shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    setIsDark(shouldBeDark);
    applyTheme(shouldBeDark);
    setIsMounted(true);
  }, []);

  const applyTheme = (dark: boolean) => {
    const html = document.documentElement;

    if (dark) {
      html.classList.add('dark');
      html.classList.remove('light');
      html.style.colorScheme = 'dark';
      localStorage.setItem('theme', 'dark');
    } else {
      html.classList.remove('dark');
      html.classList.add('light');
      html.style.colorScheme = 'light';
      localStorage.setItem('theme', 'light');
    }
  };

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    applyTheme(newDark);
  };

  if (!isMounted) {
    return (
      <div className="w-10 h-10 rounded-lg" style={{ backgroundColor: 'var(--muted-bg)' }} />
    );
  }

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative w-10 h-10 rounded-lg flex items-center justify-center transition-all"
      style={{
        backgroundColor: 'var(--muted-bg)',
        color: 'var(--foreground)',
        border: '1px solid var(--border)',
      }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <motion.div
        initial={false}
        animate={{
          scale: isDark ? 1 : 0,
          opacity: isDark ? 1 : 0,
          rotateZ: isDark ? 0 : 180
        }}
        transition={{ duration: 0.3, type: 'spring', stiffness: 200, damping: 15 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <Moon className="w-5 h-5" />
      </motion.div>

      <motion.div
        initial={false}
        animate={{
          scale: isDark ? 0 : 1,
          opacity: isDark ? 0 : 1,
          rotateZ: isDark ? -180 : 0
        }}
        transition={{ duration: 0.3, type: 'spring', stiffness: 200, damping: 15 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <Sun className="w-5 h-5" />
      </motion.div>
    </motion.button>
  );
}
