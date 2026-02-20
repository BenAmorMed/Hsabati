"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'glass' | 'ocean' | 'sunset' | 'midnight';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [theme, setThemeState] = useState<Theme>('dark');

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as Theme;
        if (savedTheme) {
            setThemeState(savedTheme);
        }
    }, []);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem('theme', newTheme);

        // Also update body classes
        document.body.className = `${document.body.className.split(' ').filter(c => !['theme-dark', 'theme-glass', 'theme-ocean', 'theme-sunset', 'theme-midnight'].includes(c)).join(' ')} theme-${newTheme}`;
    };

    useEffect(() => {
        document.body.classList.add(`theme-${theme}`);
        return () => {
            document.body.classList.remove(`theme-${theme}`);
        };
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within a ThemeProvider');
    return context;
};
