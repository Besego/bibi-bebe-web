import React, { createContext, useContext, useState, useCallback } from 'react';
import { lightTheme, darkTheme } from '@/theme/themes';
import { Theme } from '@/theme/types';

interface ThemeContextType {
    theme: Theme;
    isDark: boolean;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isDark, setIsDark] = useState(true);

    const toggleTheme = useCallback(() => {
        setIsDark(prev => !prev);
    }, []);

    const value = {
        theme: isDark ? darkTheme : lightTheme,
        isDark,
        toggleTheme,
    };

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};