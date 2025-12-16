import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { Theme } from './types';
import { lightTheme, darkTheme } from './defaultTheme';

interface ThemeContextValue {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  setDarkMode: (isDark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: ReactNode;
  theme?: Theme;
  darkTheme?: Theme;
  followSystem?: boolean;
}

/**
 * Provider de tema para la aplicación
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  theme: customLightTheme,
  darkTheme: customDarkTheme,
  followSystem = true,
}) => {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(followSystem ? systemColorScheme === 'dark' : false);

  const light = customLightTheme || lightTheme;
  const dark = customDarkTheme || darkTheme;

  const theme = useMemo(() => (isDarkMode ? dark : light), [isDarkMode, light, dark]);

  const toggleTheme = () => setIsDarkMode(prev => !prev);
  const setTheme = (newTheme: Theme) => setIsDarkMode(newTheme.isDark);
  const setDarkMode = (isDark: boolean) => setIsDarkMode(isDark);

  const value = useMemo(
    () => ({ theme, isDark: isDarkMode, toggleTheme, setTheme, setDarkMode }),
    [theme, isDarkMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

/**
 * Hook para acceder al tema
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

/**
 * Hook para crear estilos con el tema
 */
export function useThemedStyles<T>(styleFactory: (theme: Theme) => T): T {
  const { theme } = useTheme();
  return useMemo(() => styleFactory(theme), [theme, styleFactory]);
}
