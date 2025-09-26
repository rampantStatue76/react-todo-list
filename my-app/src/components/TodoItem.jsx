import { useState } from 'react'
import './TodoItem.css'

function TodoItem({ todo, onDelete, onEdit, onToggle }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(todo.content)
  const [showDetails, setShowDetails] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleEdit = () => {
    if(editValue.trim()){
      onEdit(todo.id, { content: editValue.trim() })
      setIsEditing(false)
    }
  }

  const handleKeyPress = (e) => {
    if(e.key === 'Enter'){
      handleEdit()
    } else if(e.key === 'Escape') {
      setEditValue(todo.content)
      setIsEditing(false)
    }
  }

  const handleDelete = () => {
    setIsDeleting(true)
    // 等待动画完成后再真正删除
    setTimeout(() => {
      onDelete(todo.id)
    }, 300) 
  }

  // 根据优先级显示不同的颜色
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return '#e74c3c'
      case 'medium': return '#f39c12'
      case 'low': return '#27ae60'
      default: return '#95a5a6'
    }
  }

  const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date() && !todo.completed

  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''} ${isDeleting ? 'deleting' : ''}`}>
      <div className="todo-main-content">
        {/* 优先级指示器 */}
        <div 
          className="priority-indicator"
          style={{ backgroundColor: getPriorityColor(todo.priority) }}
          title={`优先级: ${todo.priority}`}
        ></div>

        {/* 勾选框 */}
        <input
          type="checkbox" 
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
          className="todo-checkbox"
        />


        {/* 任务内容区域 */}
        <div className="todo-content-area">
          {isEditing ? (
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="edit-input"
              autoFocus
              onBlur={handleEdit}
              onKeyDown={handleKeyPress}
            />
          ) : (
            <div className="todo-text">
              <span
                className='todo-content'
                onDoubleClick={() => setIsEditing(true)}
              >
                {todo.content}
              </span>
              
              <div className="todo-meta">
                <span className="category-tag">{todo.category}</span>
                {todo.dueDate && (
                  <span className={`due-date ${isOverdue ? 'overdue' : ''}`}>
                    📅 {new Date(todo.dueDate).toLocaleDateString('zh-CN')}
                  </span>
                )}
                <span className="created-time">
                  创建于 {new Date(todo.createdAt).toLocaleDateString('zh-CN')}
                </span>
              </div>
            </div>
          )}
        </div>
        {/* 操作任务区域 */}
        <div className="todo-actions">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className='details-btn'
            title="详情"
          >
            {showDetails ? '▲' : '▼'}
          </button>
          
          <button
            onClick={() => setIsEditing(true)}
            className='edit-btn'
            title="编辑"
          >
            ✏️
          </button>

          <button
            onClick={handleDelete}
            className='delete-btn'
            title="删除"
          >
            🗑️
          </button>
        </div>
      </div>

      {showDetails && (
        <div className="todo-details">
          <div className="detail-row">
            <strong>ID:</strong> {todo.id}
          </div>
          <div className="detail-row">
            <strong>优先级:</strong> {todo.priority}
          </div>
          <div className="detail-row">
            <strong>分类:</strong> {todo.category}
          </div>
          <div className="detail-row">
            <strong>创建时间:</strong> {new Date(todo.createdAt).toLocaleString('zh-CN')}
          </div>
          <div className="detail-row">
            <strong>更新时间:</strong> {new Date(todo.updatedAt).toLocaleString('zh-CN')}
          </div>
          {todo.dueDate && (
            <div className="detail-row">
              <strong>截止时间:</strong> {new Date(todo.dueDate).toLocaleString('zh-CN')}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default TodoItem