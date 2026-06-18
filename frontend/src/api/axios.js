import axios from 'axios'

// 创建 axios 实例
const api = axios.create({
  // 不设置 baseURL，因为请求路径中已经包含了 /api
})

// 请求拦截器 - 确保每次请求都携带 token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    console.log('Axios request - Token found:', !!token)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('Axios request - Authorization header added')
    }
    // 防止GET请求被浏览器缓存
    if (config.method === 'get') {
      config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
      config.headers['Pragma'] = 'no-cache'
      config.headers['Expires'] = '0'
      // 添加时间戳防止缓存
      config.params = { ...config.params, _t: Date.now() }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 处理认证失败
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // 清除本地存储的 token 和用户信息
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // 跳转到登录页面
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api