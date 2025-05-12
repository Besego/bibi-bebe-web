import React, { createContext, useContext } from 'react';
import { ViewStyle } from 'react-native';
import { LAYOUT_CONSTANTS } from '@/constants/layout';
import { useTheme } from '@/providers/ThemeProvider';

interface LayoutContextType {
    containerStyle: ViewStyle;
    contentContainerStyle: ViewStyle;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { theme } = useTheme();

    const value = {
        containerStyle: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        contentContainerStyle: {
            flex: 1,
            marginHorizontal: LAYOUT_CONSTANTS.horizontalPadding,
            marginTop: LAYOUT_CONSTANTS.marginTop,
            marginBottom: LAYOUT_CONSTANTS.marginBottom,
            borderRadius: LAYOUT_CONSTANTS.borderRadius,
            backgroundColor: theme.colors.secondary,
            overflow: 'hidden',
        },
    };

    return <LayoutContext.Provider value={value as LayoutContextType}>{children}</LayoutContext.Provider>;
};

export const useLayout = () => {
    const context = useContext(LayoutContext);
    if (!context) {
        throw new Error('useLayout must be used within a LayoutProvider');
    }
    return context;
};