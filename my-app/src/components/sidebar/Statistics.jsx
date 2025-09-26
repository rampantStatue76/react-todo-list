import './Statistics.css'

// 📊 数据统计组件：动态统计面板，实时显示任务完成率和各状态数据
function Statistics({ stats }) {
  const completionRate = stats.total === 0 ? 0 : Math.round((stats.completed / stats.total) * 100)
  
  return (
    <div className="statistics">
      <div className="stat-card">
        <h3>总任务</h3>
        <span className="stat-number">{stats.total}</span>
      </div>
      <div className="stat-card">
        <h3>已完成</h3>
        <span className="stat-number completed">{stats.completed}</span>
      </div>
      <div className="stat-card">
        <h3>待完成</h3>
        <span className="stat-number pending">{stats.pending}</span>
      </div>
      <div className="stat-card">
        <h3>已过期</h3>
        <span className="stat-number overdue">{stats.overdue}</span>
      </div>
      <div className="stat-card">
        <h3>完成率</h3>
        <span className="stat-number">{completionRate}%</span>
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${completionRate}%` }}
          ></div>
        </div>
      </div>
    </div>
  )
}
  
  export default Statistics