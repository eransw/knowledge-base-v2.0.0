import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        const userData = JSON.parse(storedUser)
        setUser(userData)
        // 如果用户有主题设置，应用主题
        if (userData.theme) {
          const themeEvent = new CustomEvent('user-theme', { detail: { theme: userData.theme } })
          window.dispatchEvent(themeEvent)
        }
      }
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    const handleMenuOrderUpdate = (event) => {
      const { menuOrder } = event.detail
      setUser(prev => prev ? { ...prev, menuOrder } : prev)
    }
    
    window.addEventListener('user-menu-order-update', handleMenuOrderUpdate)
    return () => window.removeEventListener('user-menu-order-update', handleMenuOrderUpdate)
  }, [])

  const login = async (username, password) => {
    try {
      const response = await axios.post('/api/auth/login', { username, password }, {
        headers: {
          'Authorization': undefined
        }
      })
      const { access_token, user: userData } = response.data
      localStorage.setItem('token', access_token)
      localStorage.setItem('user', JSON.stringify(userData))
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
      setUser(userData)
      
      // 如果用户有主题设置，应用主题
      if (userData.theme) {
        const themeEvent = new CustomEvent('user-theme', { detail: { theme: userData.theme } })
        window.dispatchEvent(themeEvent)
      }
      
      return { success: true }
    } catch (error) {
      console.error('Login failed:', error)
      // 返回后端的错误消息
      const errorMessage = error.response?.data?.message || '登录失败'
      return { success: false, message: errorMessage }
    }
  }

  const register = async (username, email, password) => {
    try {
      const instance = axios.create()
      delete instance.defaults.headers.common['Authorization']
      const response = await instance.post('/api/auth/register', { username, email, password })
      const { access_token, user: userData } = response.data
      localStorage.setItem('token', access_token)
      localStorage.setItem('user', JSON.stringify(userData))
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
      setUser(userData)
      
      // 如果用户有主题设置（新用户默认是police），应用主题
      if (userData.theme) {
        const themeEvent = new CustomEvent('user-theme', { detail: { theme: userData.theme } })
        window.dispatchEvent(themeEvent)
      }
      
      return { success: true }
    } catch (error) {
      console.error('Register failed:', error)
      // 返回后端的错误消息
      const errorMessage = error.response?.data?.message || '注册失败'
      return { success: false, message: errorMessage }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
  }

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      
      const response = await axios.get('/api/auth/users/me')
      const userData = response.data
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
      
      if (userData.theme) {
        const themeEvent = new CustomEvent('user-theme', { detail: { theme: userData.theme } })
        window.dispatchEvent(themeEvent)
      }
    } catch (error) {
      console.error('Failed to refresh user:', error)
    }
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    refreshUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}