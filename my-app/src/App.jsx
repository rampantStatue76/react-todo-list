import { useState, useEffect, useReducer, useCallback } from 'react'
import './App.css'
import TodoForm from './components/TodoForm'
import TodoList from './components/TodoList'
import Statistics from './components/sidebar/Statistics'
import SearchBar from './/components/sidebar/SearchBar'
import CategoryFilter from './components/CategoryFilter'

// 🚀 复杂状态管理：Reducer函数集中管理所有状态变更逻辑
const todosReducer = (state, action) => {
  switch (action.type) {
    case 'SET_TODOS':
      // 设置初始数据（从localStorage加载）
      return action.payload
      
    case 'ADD_TODO':
      // 添加新任务：返回包含新任务的数组
      return [...state, action.payload]
      
    case 'UPDATE_TODO':
      // 更新单个任务：找到目标任务并合并更新
      return state.map(todo => 
        todo.id === action.payload.id 
          ? { ...todo, ...action.payload.updates } 
          : todo
      )
      
    case 'DELETE_TODO':
      // 删除单个任务：过滤掉目标任务
      return state.filter(todo => todo.id !== action.payload)
      
    case 'BATCH_DELETE':
      // 批量删除：过滤掉所有包含在ids数组中的任务
      return state.filter(todo => !action.payload.includes(todo.id))
      
    case 'TOGGLE_ALL':
      // 批量切换状态：将所有任务设置为指定完成状态
      return state.map(todo => ({ ...todo, completed: action.payload }))
      
    default:
      return state
  }
}

function App() {
  // 🚀 使用 useReducer 替代多个 useState，管理复杂状态
  const [todos, dispatch] = useReducer(todosReducer, [])
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('createdAt')
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  // 💾 数据持久化：从localStorage加载数据
  useEffect(() => {
    const savedTodos = localStorage.getItem('todos')
    const savedTheme = localStorage.getItem('isDarkMode')
    
    if (savedTodos) {
      try {
        dispatch({ type: 'SET_TODOS', payload: JSON.parse(savedTodos) })
      } catch (error) {
        console.error('加载保存数据失败:', error)
      }
    }
    
    if (savedTheme) {
      setIsDarkMode(JSON.parse(savedTheme))
    }
  }, [])

  // 💾 数据持久化：自动保存数据到localStorage
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos))
  }, [todos])

  // 🎨 主题持久化和应用
  useEffect(() => {
    localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode))
    document.body.className = isDarkMode ? 'dark-mode' : 'light-mode'
  }, [isDarkMode])


  // 添加新的代办事项（增强版）
  const addTodo = useCallback((text, priority = 'medium', category = 'general', dueDate = null) => {
    const newTodo = {
      id: Date.now() + Math.random(), // 确保唯一性
      content: text,
      completed: false,
      priority,
      category,
      dueDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: []
    }
    // 使用dispatch函数触发状态更新 发送‘ADD_TODO’类型的action 
    // 将新创建的待办事项作为payload传递给reducer
    dispatch({ type: 'ADD_TODO', payload: newTodo })
  }, [])

  // 🏷️ 多维度筛选：复杂筛选逻辑
  const getFilteredTodos = useCallback(() => {
    let filtered = todos

    // 按状态筛选
    switch (filter) {
      case 'uncompleted':
        filtered = filtered.filter(todo => !todo.completed)
        break
      case 'completed':
        filtered = filtered.filter(todo => todo.completed)
        break
      case 'overdue':
        filtered = filtered.filter(todo => 
          todo.dueDate && new Date(todo.dueDate) < new Date() && !todo.completed
        )
        break
    }

    // 按分类筛选
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(todo => todo.category === selectedCategory)
    }

    // 🔍 智能搜索：按搜索词筛选
    if (searchTerm) {
      filtered = filtered.filter(todo =>
        todo.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (todo.tags && todo.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      )
    }

    // 排序逻辑
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority': {
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        }
        case 'dueDate':
          if (!a.dueDate) return 1
          if (!b.dueDate) return -1
          return new Date(a.dueDate) - new Date(b.dueDate)
        case 'alphabetical':
          return a.content.localeCompare(b.content)
        default:
          return new Date(b.createdAt) - new Date(a.createdAt)
      }
    })
  }, [todos, filter, selectedCategory, searchTerm, sortBy])

  const toggleTodo = useCallback((id) => {
    dispatch({
      type: 'UPDATE_TODO',
      payload: {
        id,
        updates: {
          completed: !todos.find(todo => todo.id === id).completed,
          updatedAt: new Date().toISOString()
        }
      }
    })
  }, [todos])

  // 删除代办
  const deleteTodo = useCallback((id) => {
    dispatch({ type: 'DELETE_TODO', payload: id })
  }, [])

  // 编辑代办
  const editTodo = useCallback((id, updates) => {
    dispatch({
      type: 'UPDATE_TODO',
      payload: {
        id,
        updates: {
          ...updates,
          updatedAt: new Date().toISOString()
        }
      }
    })
  }, [])

  // ⚡ 批量操作功能
  const batchDelete = useCallback((ids) => {
    dispatch({ type: 'BATCH_DELETE', payload: ids })
  }, [])

  const toggleAll = useCallback((completed) => {
    dispatch({ type: 'TOGGLE_ALL', payload: completed })
  }, [])

  // 获取筛选后的待办事项
  const filteredTodos = getFilteredTodos()
  
  // 📊 数据统计：计算各种统计数据
  const stats = {
    total: todos.length,
    completed: todos.filter(t => t.completed).length,
    pending: todos.filter(t => !t.completed).length,
    overdue: todos.filter(t => 
      t.dueDate && new Date(t.dueDate) < new Date() && !t.completed
    ).length
  }

  return (
    <div className={`app ${isDarkMode ? 'dark' : 'light'}`}>
      {/* 📱 侧边栏 */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-content">
          <div className="sidebar-header">
            <h3>控制面板</h3>
            <button 
              className="sidebar-toggle"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              title={isSidebarOpen ? '收起' : '展开'}
            >
              {isSidebarOpen ? '◀' : '▶'}
            </button>
          </div>
          
          {isSidebarOpen && (
            <div className="sidebar-body">
              {/* 📊 统计面板 */}
              <div className="sidebar-section">
                <h4>数据统计</h4>
                <Statistics stats={stats} />
              </div>

              {/* 🔍 搜索和筛选控制区域 */}
              <div className="sidebar-section">
                <h4>搜索筛选</h4>
                <div className="sidebar-controls">
                  <SearchBar 
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                  />
                  
                  <CategoryFilter
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                  />

                  <div className="sort-controls">
                    <label>排序：</label>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                      <option value="createdAt">创建时间</option>
                      <option value="priority">优先级</option>
                      <option value="dueDate">截止日期</option>
                      <option value="alphabetical">字母顺序</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* 🌟 主内容区域 */}
      <div className={`main-container ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <header className='app-header'>
          <div className="header-content">
            <h1>📝 待办事项管理</h1>
            <button 
              className="theme-toggle"
              onClick={() => setIsDarkMode(!isDarkMode)}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </header>

        <main className='app-main'>
          {/* 添加待办项组件 */}
          <TodoForm onAddTodo={addTodo} />

          {/* ⚡ 批量操作 */}
          <div className="batch-actions">
            <span>批量操作：</span>
            <button onClick={() => toggleAll(true)}>全部完成</button>
            <button onClick={() => toggleAll(false)}>全部未完成</button>
            <button 
              onClick={() => batchDelete(todos.filter(t => t.completed).map(t => t.id))}
              className="danger"
            >
              删除已完成
            </button>
          </div>

          {/* 过滤按钮组件 */}
          <div className="filter-buttons">
            <button
              className={filter === 'all' ? 'active' : ''}
              onClick={() => setFilter('all')}
            >全部 ({todos.length})</button>
            <button
              className={filter === 'uncompleted' ? 'active' : ''}
              onClick={() => setFilter('uncompleted')}
            >未完成 ({stats.pending})</button>
            <button
              className={filter === 'completed' ? 'active' : ''}
              onClick={() => setFilter('completed')}
            >已完成 ({stats.completed})</button>
            <button
              className={filter === 'overdue' ? 'active' : ''}
              onClick={() => setFilter('overdue')}
            >已过期 ({stats.overdue})</button>
          </div>

          {/* 待办事项展示 */}
          <TodoList 
            todos={filteredTodos}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
            onEdit={editTodo}
            onBatchDelete={batchDelete}
          />
        </main>
      </div>
    </div>
  )
}

export default App
