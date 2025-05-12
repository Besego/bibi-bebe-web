import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useLayout } from '@/providers/LayoutProvider';

interface ScreenLayoutProps {
    children: React.ReactNode;
    style?: ViewStyle;
    contentContainerStyle?: ViewStyle;
}

export const ScreenLayout: React.FC<ScreenLayoutProps> = ({
    children,
    style,
    contentContainerStyle,
}) => {
    const { containerStyle, contentContainerStyle: defaultContentContainerStyle } = useLayout();

    return (
        <View style={[containerStyle, style]}>
            <View style={[defaultContentContainerStyle, contentContainerStyle]}>
                {children}
            </View>
        </View>
    );
};