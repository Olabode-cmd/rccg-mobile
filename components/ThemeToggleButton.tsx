// components/ThemeToggleButton.tsx
import { TouchableOpacity } from 'react-native';
import { ThemedText } from './ThemedText';
import { useTheme } from '@/contexts/themeContext';
import { IconSymbol } from './ui/IconSymbol';

export function ThemeToggleButton() {
    const { theme, toggleTheme } = useTheme();

    return (
        <TouchableOpacity
            onPress={toggleTheme}
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 8,
                gap: 8,
            }}>
            <IconSymbol
                name={theme === 'light' ? 'sun.max.fill' : 'moon.fill'}
                size={24}
                color={theme === 'light' ? '#000' : '#fff'}
            />
            <ThemedText>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</ThemedText>
        </TouchableOpacity>
    );
}