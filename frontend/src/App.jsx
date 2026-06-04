import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ConfigProvider } from './context/ConfigContext'
import { ThemeProvider } from './context/ThemeContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Documents from './pages/Documents'
import DocumentDetail from './pages/DocumentDetail'
import Categories from './pages/Categories'
import Tags from './pages/Tags'
import SystemConfig from './pages/SystemConfig'
import AIConfig from './pages/AIConfig'
import Layout from './components/Layout'

function App() {
  return (
    <AuthProvider>
      <ConfigProvider>
        <ThemeProvider>
          <BrowserRouter>
            <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Documents />} />
              <Route path="documents" element={<Documents />} />
              <Route path="documents/:id" element={<DocumentDetail />} />
              <Route path="categories" element={<Categories />} />
              <Route path="tags" element={<Tags />} />
              <Route path="ai-config" element={<AIConfig />} />
              <Route path="system-config" element={<SystemConfig />} />
            </Route>
          </Routes>
          </BrowserRouter>
        </ThemeProvider>
      </ConfigProvider>
    </AuthProvider>
  )
}

export default App