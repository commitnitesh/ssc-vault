import { Users, MessageCircle, TrendingUp, Heart } from 'lucide-react'
import './Community.css'

const Community = () => {
  const discussions = [
    { title: 'Best strategy for SSC CGL 2026?', replies: 45, views: 234, time: '2h ago' },
    { title: 'Daily Vocabulary Thread - Day 45', replies: 23, views: 156, time: '5h ago' },
    { title: 'Quant shortcuts for Time & Work', replies: 67, views: 389, time: '1d ago' },
    { title: 'GS notes: Important articles and amendments', replies: 34, views: 212, time: '1d ago' },
  ]

  return (
    <div className="page-container container">
      <div className="page-header">
        <span className="section-badge">💬 Community Hub</span>
        <h1 className="page-title">Learn together, grow together</h1>
        <p className="page-subtitle">Connect with fellow aspirants, share insights, and stay motivated</p>
      </div>

      <div className="community-stats">
        <div className="stat-card">
          <Users size={32} />
          <span className="stat-number">15,234</span>
          <span className="stat-label">Members</span>
        </div>
        <div className="stat-card">
          <MessageCircle size={32} />
          <span className="stat-number">1,234</span>
          <span className="stat-label">Daily Posts</span>
        </div>
        <div className="stat-card">
          <TrendingUp size={32} />
          <span className="stat-number">89%</span>
          <span className="stat-label">Active Users</span>
        </div>
      </div>

      <div className="discussions-section">
        <h2>Trending Discussions</h2>
        <div className="discussions-list">
          {discussions.map((disc, i) => (
            <div className="discussion-card" key={i}>
              <div className="discussion-main">
                <h4>{disc.title}</h4>
                <div className="discussion-meta">
                  <span>💬 {disc.replies} replies</span>
                  <span>👁 {disc.views} views</span>
                  <span>🕒 {disc.time}</span>
                </div>
              </div>
              <button className="btn-ghost like-btn">
                <Heart size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="community-join">
        <h3>Ready to join the conversation?</h3><a
          href="https://t.me/SSCYaar"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary nav-btn"
        >
        <button className="btn btn-primary btn-large"> Join SSCYaar Community</button></a>
      </div>
    </div>
  )
}

export default Community