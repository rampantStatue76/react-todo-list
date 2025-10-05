import { useState } from 'react'
import './Login.css'

const Login = ({ onLogin, isLoading, error }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [isSignUp, setIsSignUp] = useState(false)
  const [signUpData, setSignUpData] = useState({
    username: '',
    password: '',
    email: '',
    name: ''
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    if (isSignUp) {
      setSignUpData(prev => ({
        ...prev,
        [name]: value
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isSignUp) {
      onLogin(signUpData, 'signup')
    } else {
      onLogin(formData, 'login')
    }
  }

  const toggleMode = () => {
    setIsSignUp(!isSignUp)
    setFormData({ username: '', password: '' })
    setSignUpData({ username: '', password: '', email: '', name: '' })
  }

  // 演示账号快速登录
  const quickLogin = (type) => {
    if (type === 'admin') {
      setFormData({ username: 'admin', password: '123456' })
    } else {
      setFormData({ username: 'user1', password: 'password123' })
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h2>📝 待办事项管理系统</h2>
          <p>{isSignUp ? '创建新账户' : '登录到您的账户'}</p>
        </div>

        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          {isSignUp && (
            <>
              <div className="form-group">
                <label htmlFor="name">姓名</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value = {signUpData.name}
                  onChange={handleInputChange}
                  placeholder="请输入您的姓名"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">邮箱</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={signUpData.email}
                  onChange={handleInputChange}
                  placeholder="请输入您的邮箱"
                  required
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="username">用户名</label>
            <input
              type="text"
              id="username"
              name="username"
              value={isSignUp ? signUpData.username : formData.username}
              onChange={handleInputChange}
              placeholder="请输入用户名"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">密码</label>
            <input
              type="password"
              id="password"
              name="password"
              value={isSignUp ? signUpData.password : formData.password}
              onChange={handleInputChange}
              placeholder="请输入密码"
              required
            />
          </div>

          <button 
            type="submit" 
            className="login-btn"
            disabled={isLoading}
          >
            {isLoading ? '处理中...' : (isSignUp ? '注册' : '登录')}
          </button>
        </form>

        <div className="login-footer">
          <p>
            {isSignUp ? '已有账户？' : '没有账户？'}
            <button 
              type="button" 
              className="link-btn"
              onClick={toggleMode}
            >
              {isSignUp ? '立即登录' : '立即注册'}
            </button>
          </p>
        </div>

        {!isSignUp && (
          <div className="demo-accounts">
            <p>演示账号：</p>
            <div className="demo-buttons">
              <button 
                type="button"
                className="demo-btn admin"
                onClick={() => quickLogin('admin')}
              >
                管理员 (admin/123456)
              </button>
              <button 
                type="button"
                className="demo-btn user"
                onClick={() => quickLogin('user')}
              >
                普通用户 (user1/password123)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Login