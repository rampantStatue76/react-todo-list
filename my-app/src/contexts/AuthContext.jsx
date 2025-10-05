import { createContext, useState, useEffect } from 'react'

// 创建认证上下文
const AuthContext = createContext()

// API配置
const API_BASE_URL = 'http://localhost:3001'

// 认证服务
class AuthService {
  // 登录
  static async login(username, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/users?username=${username}&password=${password}`)
      const users = await response.json()
    //  let users
    //  await fetch(`${API_BASE_URL}/users?username=${username}&password=${password}`)
    // .then(response => response.json())
    // .then(data => {
    //     users = data
    // })
      
      if (users.length > 0) {
        const user = users[0]
        // 创建会话
        const session = {
          id: Date.now(),
          userId: user.id,
          token: this.generateToken(),
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24小时后过期
        }
        
        // 保存会话到json-server
        await fetch(`${API_BASE_URL}/sessions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(session)
        })
        
        // 返回用户信息和token
        return {
          success: true,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            name: user.name,
            role: user.role
          },
          token: session.token
        }
      } else {
        return {
          success: false,
          message: '用户名或密码错误'
        }
      }
    } catch (error) {
      console.error('登录错误:', error)
      return {
        success: false,
        message: '网络错误，请稍后重试'
      }
    }
  }

  // 注册
  static async signup(userData) {
    try {
      // 检查用户名是否已存在
      const checkResponse = await fetch(`${API_BASE_URL}/users?username=${userData.username}`)
      const existingUsers = await checkResponse.json()
      
      if (existingUsers.length > 0) {
        return {
          success: false,
          message: '用户名已存在'
        }
      }

      // 检查邮箱是否已存在
      const emailResponse = await fetch(`${API_BASE_URL}/users?email=${userData.email}`)
      const existingEmails = await emailResponse.json()
      
      if (existingEmails.length > 0) {
        return {
          success: false,
          message: '邮箱已被注册'
        }
      }

      // 创建新用户
      const newUser = {
        ...userData,
        id: Date.now(),
        role: 'user',
        createdAt: new Date().toISOString()
      }

      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUser)
      })

      if (response.ok) {
        // 自动登录
        return await this.login(userData.username, userData.password)
      } else {
        return {
          success: false,
          message: '注册失败，请稍后重试'
        }
      }
    } catch (error) {
      console.error('注册错误:', error)
      return {
        success: false,
        message: '网络错误，请稍后重试'
      }
    }
  }

  // 登出
  static async logout(token) {
    try {
      // 查找并删除会话
      const sessionsResponse = await fetch(`${API_BASE_URL}/sessions?token=${token}`)
      const sessions = await sessionsResponse.json()
      
      if (sessions.length > 0) {
        await fetch(`${API_BASE_URL}/sessions/${sessions[0].id}`, {
          method: 'DELETE'
        })
      }
      
      return { success: true }
    } catch (error) {
      console.error('登出错误:', error)
      return { success: false }
    }
  }

  // 验证token
  static async validateToken(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions?token=${token}`)
      const sessions = await response.json()
      
      if (sessions.length > 0) {
        const session = sessions[0]
        const now = new Date()
        const expiresAt = new Date(session.expiresAt)
        
        if (now < expiresAt) {
          // 获取用户信息
          const userResponse = await fetch(`${API_BASE_URL}/users/${session.userId}`)
          const user = await userResponse.json()
          
          return {
            valid: true,
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              name: user.name,
              role: user.role
            }
          }
        } else {
          // 删除过期会话
          await fetch(`${API_BASE_URL}/sessions/${session.id}`, {
            method: 'DELETE'
          })
        }
      }
      
      return { valid: false }
    } catch (error) {
      console.error('Token验证错误:', error)
      return { valid: false }
    }
  }

  // 生成简单的token
  static generateToken() {
    return btoa(Date.now() + Math.random()).replace(/[^a-zA-Z0-9]/g, '')
  }
}

// 认证Provider组件
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // 初始化时检查本地存储的token
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('authToken')
      if (token) {
        const validation = await AuthService.validateToken(token)
        if (validation.valid) {
          setUser(validation.user)
          setIsAuthenticated(true)
        } else {
          localStorage.removeItem('authToken')
        }
      }
      setIsLoading(false)
    }

    initAuth()
  }, [])

  // 登录函数
  const login = async (credentials, type = 'login') => {
    setIsLoading(true)
    
    let result
    if (type === 'signup') {
      result = await AuthService.signup(credentials)
    } else {
      result = await AuthService.login(credentials.username, credentials.password)
    }

    if (result.success) {
      setUser(result.user)
      setIsAuthenticated(true)
      localStorage.setItem('authToken', result.token)
    }

    setIsLoading(false)
    return result
  }

  // 登出函数
  const logout = async () => {
    const token = localStorage.getItem('authToken')
    if (token) {
      await AuthService.logout(token)
      localStorage.removeItem('authToken')
    }
    
    setUser(null)
    setIsAuthenticated(false)
  }

  // 获取当前用户的待办事项
  const getUserTodos = async () => {
    if (!user) return []
    
    try {
      const response = await fetch(`${API_BASE_URL}/todos?userId=${user.id}`)
      return await response.json()
    } catch (error) {
      console.error('获取用户待办事项失败:', error)
      return []
    }
  }

  // 保存待办事项到服务器
  const saveTodoToServer = async (todo) => {
    if (!user) return null
    
    try {
      const todoWithUser = { ...todo, userId: user.id }
      const response = await fetch(`${API_BASE_URL}/todos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(todoWithUser)
      })
      return await response.json()
    } catch (error) {
      console.error('保存待办事项失败:', error)
      return null
    }
  }

  // 更新待办事项
  const updateTodoOnServer = async (id, updates) => {
    if (!user) return null
    
    try {
      const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      })
      return await response.json()
    } catch (error) {
      console.error('更新待办事项失败:', error)
      return null
    }
  }

  // 删除待办事项
  const deleteTodoFromServer = async (id) => {
    if (!user) return false
    
    try {
      await fetch(`${API_BASE_URL}/todos/${id}`, {
        method: 'DELETE'
      })
      return true
    } catch (error) {
      console.error('删除待办事项失败:', error)
      return false
    }
  }

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    getUserTodos,
    saveTodoToServer,
    updateTodoOnServer,
    deleteTodoFromServer
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext