import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from './AuthContext'

const ConfigContext = createContext()

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState({
    siteName: '知识库',
    loginTitle: '欢迎登录',
    loginSubtitle: '管理您的文档和知识',
    copyright: '2024 知识库管理系统 版权所有',
  })
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchConfig()
    }
  }, [user])

  async function fetchConfig() {
    try {
      const response = await axios.get('/api/config')
      setConfig(prev => ({ ...prev, ...response.data }))
    } catch (error) {
      console.error('Failed to fetch config:', error)
    }
  }

  async function saveConfig(newConfig) {
    try {
      for (const [key, value] of Object.entries(newConfig)) {
        await axios.post('/api/config', { key, value })
      }
      setConfig(newConfig)
      return true
    } catch (error) {
      console.error('Failed to save config:', error)
      return false
    }
  }

  return (
    <ConfigContext.Provider value={{ config, fetchConfig, saveConfig }}>
      {children}
    </ConfigContext.Provider>
  )
}

export function useConfig() {
  const context = useContext(ConfigContext)
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider')
  }
  return context
}
