import React from 'react';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { LocalizationProvider } from '@/providers/LocalizationProvider';
import { LayoutProvider } from '@/providers/LayoutProvider';

export const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <AuthProvider>
            <LocalizationProvider>
                <ThemeProvider>
                    <LayoutProvider>
                        {children}
                    </LayoutProvider>
                </ThemeProvider>
            </LocalizationProvider>
        </AuthProvider>
    );
};