import { useState, useCallback } from 'react'
import './SearchBar.css'

function SearchBar({ searchTerm, onSearchChange }) {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm)

  // 📈 防抖搜索：优化性能
  const debouncedSearch = useCallback(
    debounce((term) => {
      onSearchChange(term)
    }, 300),
    [onSearchChange]
  )

  const handleSearchChange = (e) => {
    const value = e.target.value
    setLocalSearchTerm(value)
    debouncedSearch(value)
  }

  const clearSearch = () => {
    setLocalSearchTerm('')
    onSearchChange('')
  }

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="搜索任务内容或标签..."
        value={localSearchTerm}
        onChange={handleSearchChange}
        className="search-input"
      />
      {localSearchTerm && (
        <button onClick={clearSearch} className="clear-search">
          ✕
        </button>
      )}
    </div>
  )
}

// 防抖函数
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export default SearchBar