import { createContext, useContext, useState, useEffect } from 'react'
import { themes, defaultTheme } from '../config/themes'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    // 从 localStorage 读取保存的主题
    const savedTheme = localStorage.getItem('app-theme')
    return savedTheme && themes[savedTheme] ? savedTheme : defaultTheme
  })

  // 应用主题到 document
  useEffect(() => {
    const theme = themes[currentTheme]
    const html = document.documentElement
    
    // 移除所有主题类
    Object.values(themes).forEach(t => {
      html.classList.remove(t.class)
    })
    
    // 添加当前主题类
    html.classList.add(theme.class)
    
    // 保存到 localStorage
    localStorage.setItem('app-theme', currentTheme)
    
    // 触发自定义事件，通知组件主题已更改
    window.dispatchEvent(new CustomEvent('theme-change', { 
      detail: { theme: currentTheme, colors: theme.colors }
    }))
  }, [currentTheme])

  // 获取当前主题的颜色配置
  const colors = themes[currentTheme]?.colors || themes[defaultTheme].colors
  
  // 切换主题
  const switchTheme = (themeId) => {
    if (themes[themeId]) {
      setCurrentTheme(themeId)
    }
  }

  // 获取主题配置
  const getThemeConfig = (themeId) => {
    return themes[themeId] || themes[defaultTheme]
  }

  const value = {
    currentTheme,
    switchTheme,
    colors,
    themes: Object.values(themes),
    getThemeConfig,
    isDark: currentTheme !== 'light',
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}
