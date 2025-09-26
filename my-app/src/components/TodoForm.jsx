import { useState } from "react";
import './TodoForm.css';

function TodoForm({onAddTodo}) {
  const [inputValue, setInputValue] = useState('')
  const [priority, setPriority] = useState('medium')
  const [category, setCategory] = useState('general')
  const [dueDate, setDueDate] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if(inputValue.trim()){
      onAddTodo(
        inputValue.trim(),
        priority,
        category,
        dueDate || null
      )
      setInputValue('')
      setDueDate('')
      setShowAdvanced(false)
    }
  }

  const categories = [
    { value: 'general', label: '一般' },
    { value: 'work', label: '工作' },
    { value: 'personal', label: '个人' },
    { value: 'study', label: '学习' },
    { value: 'health', label: '健康' },
    { value: 'shopping', label: '购物' }
  ]
  // console.log(new Date().toISOString())

  return (
    <div className="todo-form-container">
      <form className="todo-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <input 
            className="todo-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="请输入待办事项..."
            type="text" 
            required
          />
          <button 
            type="button" 
            className="advanced-toggle"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? '简化' : '高级'}
          </button>
          <button type="submit" className="add-button">
            + 添加
          </button>
        </div>

        {showAdvanced && (
          <div className="advanced-options">
            <div className="form-group">
              <label>优先级：</label>
              <select 
                value={priority} 
                onChange={(e) => setPriority(e.target.value)}
                className="priority-select"
              >
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
              </select>
            </div>

            <div className="form-group">
              <label>分类：</label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                className="category-select"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>截止日期：</label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="date-input"
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
          </div>
        )}
      </form>
    </div>
  )
}

export default TodoForm