import { useState } from 'react'
import './App.css'
import Login from './components/Login'
import TodoApp from './components/TodoApp'
import { useAuth } from './hooks/useAuth'

function App() {
  const { isAuthenticated, isLoading, login } = useAuth()
  const [loginError, setLoginError] = useState('')
  const [loginIsLoading, setLoginIsLoading] = useState(false)

  // 如果未登录，显示登录页面
  const handleLogin = async (credentials, type) => {
    setLoginError('')
    setLoginIsLoading(true)
    
    const result = await login(credentials, type)
    
    if (!result.success) {
      setLoginError(result.message)
    }
    
    setLoginIsLoading(false)
  }

  // 如果正在初始化认证，显示加载状态
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">🔄</div>
        <p>加载中...</p>
      </div>
    )
  }

  // 如果未登录，显示登录组件
  if (!isAuthenticated) {
    return (
      <Login 
        onLogin={handleLogin}
        isLoading={loginIsLoading}
        error={loginError}
      />
    )
  }

  // 已登录，显示主应用
  return <TodoApp />
}

export default App
