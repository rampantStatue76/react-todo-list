import './CategoryFilter.css'

function CategoryFilter({ selectedCategory, onCategoryChange }) {
  const categories = [
    { value: 'all', label: '全部分类', icon: '📋' },
    { value: 'general', label: '一般', icon: '📝' },
    { value: 'work', label: '工作', icon: '💼' },
    { value: 'personal', label: '个人', icon: '👤' },
    { value: 'study', label: '学习', icon: '📚' },
    { value: 'health', label: '健康', icon: '💪' },
    { value: 'shopping', label: '购物', icon: '🛒' }
  ]

  return (
    <div className="category-filter">
      <label className="filter-label">分类筛选：</label>
      <div className="category-buttons">
        {categories.map(category => (
          <button
            key={category.value}
            className={`category-btn ${selectedCategory === category.value ? 'active' : ''}`}
            onClick={() => onCategoryChange(category.value)}
            title={category.label}
          >
            <span className="category-icon">{category.icon}</span>
            <span className="category-label">{category.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default CategoryFilter