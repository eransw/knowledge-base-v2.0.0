import { cn } from './utils';

// 统一的深色模式样式工具函数
export const getThemeStyles = (isDark, themeId = 'dark') => {
  // 公安蓝主题特殊样式
  const isPolice = themeId === 'police';
  const isNight = themeId === 'night';
  const isCyber = themeId === 'cyber';
  
  if (isPolice) {
    return {
      // 背景色
      bg: {
        primary: 'bg-[#00264d]',
        secondary: 'bg-[#003366]',
        tertiary: 'bg-[#004080]',
        card: 'bg-[#003366]/95',
        cardHover: 'hover:bg-[#003a73]/90',
        input: 'bg-[#004080]/80',
        badge: 'bg-blue-700/50',
      },
      
      // 文字颜色
      text: {
        primary: 'text-slate-100',
        secondary: 'text-cyan-100',
        tertiary: 'text-cyan-200',
        muted: 'text-cyan-300',
        blue: 'text-cyan-300',
        green: 'text-emerald-400',
        purple: 'text-violet-400',
        amber: 'text-amber-400',
        red: 'text-red-400',
      },
      
      // 边框颜色
      border: {
        primary: 'border-blue-500/50',
        secondary: 'border-cyan-400/40',
        blue: 'border-cyan-400/30',
        focus: 'border-blue-400/50 focus:border-cyan-300',
        input: 'border-blue-500/40',
      },
      
      // 阴影
      shadow: {
        card: 'shadow-xl shadow-blue-900/20',
        hover: 'hover:shadow-2xl hover:shadow-blue-800/25',
        glow: 'shadow-blue-600/25 shadow-cyan-500/20',
      },
      
      // 按钮样式
      button: {
        primary: 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-600/40',
        secondary: 'bg-blue-800/60 hover:bg-blue-700/60 text-white',
        outline: 'border-blue-500/50 hover:bg-blue-800/30 text-white',
        ghost: 'hover:bg-blue-800/40',
        destructive: 'bg-red-600/20 text-red-300 hover:bg-red-600/30',
      },
      
      // 图标背景
      iconBg: {
        blue: 'bg-blue-600/30 text-cyan-300',
        purple: 'bg-violet-600/30 text-violet-300',
        green: 'bg-emerald-600/30 text-emerald-300',
        amber: 'bg-amber-600/30 text-amber-300',
        pink: 'bg-pink-600/30 text-pink-300',
        slate: 'bg-blue-700/50 text-cyan-200',
      },
      
      // 渐变
      gradient: {
        primary: 'from-[#003366] via-[#004080] to-[#0055aa]',
        header: 'from-blue-700 to-cyan-600',
        card: 'from-[#003366]/95 to-[#004080]/90',
        glow: 'from-blue-600/40 via-cyan-500/30 to-blue-400/40',
      },
      
      // 特殊效果
      effects: {
        grid: 'bg-[linear-gradient(rgba(0,255,255,0.4)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.4)_1px,transparent_1px)] [background-size:50px_50px]',
        glow: 'shadow-blue-600/25 shadow-cyan-500/20',
        pulse: 'animate-pulse',
      },
    };
  }
  
  if (isNight) {
    return {
      // 背景色
      bg: {
        primary: 'bg-[#0f0a1e]',
        secondary: 'bg-[#1a1333]',
        tertiary: 'bg-[#251d47]',
        card: 'bg-[#1a1333]/90',
        cardHover: 'hover:bg-[#1f1640]/90',
        input: 'bg-[#251d47]/80',
        badge: 'bg-violet-700/50',
      },
      
      // 文字颜色
      text: {
        primary: 'text-slate-100',
        secondary: 'text-violet-100',
        tertiary: 'text-violet-200',
        muted: 'text-violet-300',
        blue: 'text-violet-300',
        green: 'text-emerald-400',
        purple: 'text-violet-400',
        amber: 'text-amber-400',
        red: 'text-red-400',
      },
      
      // 边框颜色
      border: {
        primary: 'border-violet-600/50',
        secondary: 'border-violet-500/40',
        blue: 'border-violet-400/30',
        focus: 'border-violet-500/50 focus:border-violet-300',
        input: 'border-violet-500/40',
      },
      
      // 阴影
      shadow: {
        card: 'shadow-xl shadow-violet-900/20',
        hover: 'hover:shadow-2xl hover:shadow-violet-800/25',
        glow: 'shadow-violet-600/25 shadow-purple-500/20',
      },
      
      // 按钮样式
      button: {
        primary: 'bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white shadow-lg shadow-violet-600/40',
        secondary: 'bg-violet-800/60 hover:bg-violet-700/60 text-white',
        outline: 'border-violet-500/50 hover:bg-violet-800/30 text-white',
        ghost: 'hover:bg-violet-800/40',
        destructive: 'bg-red-600/20 text-red-300 hover:bg-red-600/30',
      },
      
      // 图标背景
      iconBg: {
        blue: 'bg-violet-600/30 text-violet-300',
        purple: 'bg-violet-600/30 text-violet-300',
        green: 'bg-emerald-600/30 text-emerald-300',
        amber: 'bg-amber-600/30 text-amber-300',
        pink: 'bg-pink-600/30 text-pink-300',
        slate: 'bg-violet-700/50 text-violet-200',
      },
      
      // 渐变
      gradient: {
        primary: 'from-[#0f0a1e] via-[#1a1333] to-[#251d47]',
        header: 'from-violet-700 to-purple-600',
        card: 'from-[#1a1333]/90 to-[#251d47]/90',
        glow: 'from-violet-600/40 via-purple-500/30 to-violet-400/40',
      },
      
      // 特殊效果
      effects: {
        grid: 'bg-[linear-gradient(rgba(167,139,250,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(167,139,250,0.3)_1px,transparent_1px)] [background-size:50px_50px]',
        glow: 'shadow-violet-600/25 shadow-purple-500/20',
        pulse: 'animate-pulse',
      },
    };
  }
  
  if (isCyber) {
    return {
      // 背景色
      bg: {
        primary: 'bg-[#09090b]',
        secondary: 'bg-[#18181b]',
        tertiary: 'bg-[#27272a]',
        card: 'bg-[#18181b]/95',
        cardHover: 'hover:bg-[#1f1f23]/90',
        input: 'bg-[#27272a]/80',
        badge: 'bg-red-700/50',
      },
      
      // 文字颜色
      text: {
        primary: 'text-zinc-100',
        secondary: 'text-red-100',
        tertiary: 'text-red-200',
        muted: 'text-red-300',
        blue: 'text-red-300',
        green: 'text-red-400',
        purple: 'text-violet-400',
        amber: 'text-amber-400',
        red: 'text-red-400',
      },
      
      // 边框颜色
      border: {
        primary: 'border-red-600/50',
        secondary: 'border-red-500/40',
        blue: 'border-red-400/30',
        focus: 'border-red-500/50 focus:border-red-300',
        input: 'border-red-500/40',
      },
      
      // 阴影
      shadow: {
        card: 'shadow-xl shadow-red-900/20',
        hover: 'hover:shadow-2xl hover:shadow-red-800/25',
        glow: 'shadow-red-600/25 shadow-rose-500/20',
      },
      
      // 按钮样式
      button: {
        primary: 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white shadow-lg shadow-red-600/40',
        secondary: 'bg-red-800/60 hover:bg-red-700/60 text-white',
        outline: 'border-red-500/50 hover:bg-red-800/30 text-white',
        ghost: 'hover:bg-red-800/40',
        destructive: 'bg-red-600/20 text-red-300 hover:bg-red-600/30',
      },
      
      // 图标背景
      iconBg: {
        blue: 'bg-red-600/30 text-red-300',
        purple: 'bg-violet-600/30 text-violet-300',
        green: 'bg-red-600/30 text-red-300',
        amber: 'bg-amber-600/30 text-amber-300',
        pink: 'bg-pink-600/30 text-pink-300',
        slate: 'bg-red-700/50 text-red-200',
      },
      
      // 渐变
      gradient: {
        primary: 'from-[#09090b] via-[#18181b] to-[#27272a]',
        header: 'from-red-700 to-rose-600',
        card: 'from-[#18181b]/95 to-[#27272a]/95',
        glow: 'from-red-600/40 via-rose-500/30 to-red-400/40',
      },
      
      // 特殊效果
      effects: {
        grid: 'bg-[linear-gradient(rgba(239,68,68,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(239,68,68,0.3)_1px,transparent_1px)] [background-size:50px_50px]',
        glow: 'shadow-red-600/25 shadow-rose-500/20',
        pulse: 'animate-pulse',
      },
    };
  }
  
  // 默认深色/浅色主题样式
  return {
    // 背景色
    bg: {
      primary: isDark ? 'bg-slate-900' : 'bg-white',
      secondary: isDark ? 'bg-slate-800/80' : 'bg-gray-50',
      tertiary: isDark ? 'bg-slate-700/50' : 'bg-gray-100',
      card: isDark ? 'bg-slate-800/60' : 'bg-white',
      cardHover: isDark ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50',
      input: isDark ? 'bg-slate-700/70' : 'bg-white',
      badge: isDark ? 'bg-slate-700/60' : 'bg-gray-100',
    },
    
    // 文字颜色
    text: {
      primary: isDark ? 'text-slate-100' : 'text-gray-900',
      secondary: isDark ? 'text-slate-200' : 'text-gray-700',
      tertiary: isDark ? 'text-slate-300' : 'text-gray-600',
      muted: isDark ? 'text-slate-400' : 'text-gray-500',
      blue: isDark ? 'text-blue-400' : 'text-blue-600',
      green: isDark ? 'text-green-400' : 'text-green-600',
      purple: isDark ? 'text-purple-400' : 'text-purple-600',
      amber: isDark ? 'text-amber-400' : 'text-amber-600',
      red: isDark ? 'text-red-400' : 'text-red-600',
    },
    
    // 边框颜色
    border: {
      primary: isDark ? 'border-slate-700/50' : 'border-gray-200',
      secondary: isDark ? 'border-slate-600/40' : 'border-gray-300',
      blue: isDark ? 'border-blue-500/30' : 'border-blue-200',
      focus: isDark ? 'border-blue-500/50 focus:border-blue-400' : 'border-gray-300 focus:border-blue-500',
      input: isDark ? 'border-slate-600/50' : 'border-gray-300',
    },
    
    // 阴影
    shadow: {
      card: isDark ? 'shadow-xl shadow-black/10' : 'shadow-lg',
      hover: isDark ? 'hover:shadow-xl hover:shadow-black/15' : 'hover:shadow-lg',
    },
    
    // 按钮样式
    button: {
      primary: isDark ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white',
      secondary: isDark ? 'bg-slate-700/50 hover:bg-slate-600/50' : 'bg-gray-100 hover:bg-gray-200',
      outline: isDark ? 'border-slate-600/50 hover:bg-slate-700/30' : 'border-gray-300 hover:bg-gray-100',
      ghost: isDark ? 'hover:bg-slate-700/30' : 'hover:bg-gray-100',
      destructive: isDark ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30' : 'bg-red-50 text-red-600 hover:bg-red-100',
    },
    
    // 图标背景
    iconBg: {
      blue: isDark ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-50 text-blue-500',
      purple: isDark ? 'bg-purple-600/20 text-purple-400' : 'bg-purple-50 text-purple-500',
      green: isDark ? 'bg-green-600/20 text-green-400' : 'bg-green-50 text-green-500',
      amber: isDark ? 'bg-amber-600/20 text-amber-400' : 'bg-amber-50 text-amber-500',
      pink: isDark ? 'bg-pink-600/20 text-pink-400' : 'bg-pink-50 text-pink-500',
      slate: isDark ? 'bg-slate-700/50 text-slate-300' : 'bg-gray-100 text-gray-500',
    },
    
    // 渐变
    gradient: {
      primary: isDark ? 'from-slate-900 via-slate-800/50 to-slate-900' : 'from-white via-gray-50 to-white',
      header: isDark ? 'from-blue-900/50 to-indigo-900/50' : 'from-blue-500 to-indigo-600',
    },
  };
};

// 快捷的条件样式组合
export const themeClass = (darkClass, lightClass, isDark) => {
  return isDark ? darkClass : lightClass;
};

// 通用卡片样式
export const cardClass = (isDark, customClass = '', themeId = 'dark') => {
  return cn(
    'rounded-2xl border transition-all duration-300',
    getThemeStyles(isDark, themeId).bg.card,
    getThemeStyles(isDark, themeId).border.primary,
    getThemeStyles(isDark, themeId).shadow.card,
    customClass
  );
};

// 通用输入框样式
export const inputClass = (isDark, customClass = '', themeId = 'dark') => {
  const styles = getThemeStyles(isDark, themeId);
  return cn(
    'border rounded-lg transition-colors duration-200 px-4 py-3 h-12',
    styles.bg.input,
    styles.text.primary,
    styles.border.input,
    'focus:outline-none focus:ring-2',
    isDark ? 'focus:ring-blue-500/50' : 'focus:ring-blue-500/30',
    'placeholder:text-slate-500',
    customClass
  );
};

// 通用文本样式
export const textClass = (type, isDark, themeId = 'dark') => {
  const styles = getThemeStyles(isDark, themeId).text;
  return styles[type] || styles.primary;
};

// 通用按钮样式
export const buttonClass = (variant, isDark, customClass = '', themeId = 'dark') => {
  const styles = getThemeStyles(isDark, themeId).button;
  return cn(
    'transition-all duration-200',
    styles[variant] || styles.primary,
    customClass
  );
};