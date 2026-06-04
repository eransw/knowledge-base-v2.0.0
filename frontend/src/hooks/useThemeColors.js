import { useTheme } from '../context/ThemeContext'

// 自定义 hook，用于在组件中获取主题颜色
export const useThemeColors = () => {
  const { colors, isDark, currentTheme } = useTheme()
  
  return {
    colors,
    isDark,
    currentTheme,
    
    // 便捷方法
    bg: {
      primary: colors.background.primary,
      secondary: colors.background.secondary,
      tertiary: colors.background.tertiary,
      card: colors.background.card,
    },
    
    text: {
      primary: colors.text.primary,
      secondary: colors.text.secondary,
      tertiary: colors.text.tertiary,
      muted: colors.text.muted,
    },
    
    border: {
      primary: colors.border.primary,
      secondary: colors.border.secondary,
    },
    
    button: {
      primary: colors.button.primary,
      secondary: colors.button.secondary,
      ghost: colors.button.ghost,
    },
    
    gradient: {
      primary: colors.gradient.primary,
      secondary: colors.gradient.secondary,
    },
    
    primary: {
      50: colors.primary[50],
      100: colors.primary[100],
      200: colors.primary[200],
      300: colors.primary[300],
      400: colors.primary[400],
      500: colors.primary[500],
      600: colors.primary[600],
      700: colors.primary[700],
      800: colors.primary[800],
      900: colors.primary[900],
    },
  }
}
