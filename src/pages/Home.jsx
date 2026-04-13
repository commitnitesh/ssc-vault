import { Link } from 'react-router-dom'
import { ArrowRight, FileText, BookOpen, Users, Calculator, TrendingUp, Calendar, MessageCircle, Zap } from 'lucide-react'
import './Home.css'

const Home = () => {
  const features = [
    { 
      icon: <FileText size={24} />, 
      title: 'PYQ Library', 
      desc: 'Last 10 years papers with detailed solutions',
      link: '/pyqs',
      color: '#6366f1'
    },
    { 
      icon: <BookOpen size={24} />, 
      title: 'Topic-wise Notes', 
      desc: 'Concise notes crafted by toppers',
      link: '/notes',
      color: '#8b5cf6'
    },
    { 
      icon: <Users size={24} />, 
      title: 'Active Community', 
      desc: 'Discuss doubts, share strategies',
      link: '/community',
      color: '#3b82f6'
    },
    { 
      icon: <Calculator size={24} />, 
      title: 'Exam Toolkit', 
      desc: 'Calculators, formula sheets & more',
      link: '/toolkit',
      color: '#06b6d4'
    },
  ]

  const updates = [
    { title: 'SSC CGL 2026 Notification Expected Soon', date: '2 hours ago', tag: 'News' },
    { title: 'Quant Formula Sheet Updated - Download Now', date: 'Yesterday', tag: 'Resource' },
    { title: 'Community Milestone: 10,000+ Members!', date: '3 days ago', tag: 'Announcement' },
  ]

  const resources = [
    { title: 'Complete GS Notes for SSC', downloads: '2.3k', type: 'PDF' },
    { title: 'English Grammar Rules', downloads: '1.8k', type: 'PDF' },
    { title: 'Quant Short Tricks', downloads: '3.1k', type: 'PDF' },
  ]

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-glow"></div>
        <div className="container hero-container">
          <div className="hero-content">
            <div className="hero-badge-wrapper">
              <span className="hero-badge">
                <Zap size={14} /> Free Forever for Aspirants
              </span>
            </div>
            <h1 className="hero-title">
              Your <span className="gradient-text">SSC companion</span>
              <br />not just another course
            </h1>
            <p className="hero-desc">
              Access quality resources, connect with fellow aspirants, and prepare smarter — 
              all completely free. Built by the community, for the community.
            </p>
            <div className="hero-actions">
              <Link to="/pyqs" className="btn btn-primary">
                Explore PYQs <ArrowRight size={18} />
              </Link>
              <Link to="https://t.me/SSCYaar" className="btn btn-outline">
                Join Community <Users size={18} />
              </Link>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">15k+</span>
                <span className="stat-label">Active Aspirants</span>
              </div>
              <div className="stat">
                <span className="stat-number">50k+</span>
                <span className="stat-label">Questions Solved</span>
              </div>
              <div className="stat">
                <span className="stat-number">100%</span>
                <span className="stat-label">Free Access</span>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="visual-card floating">
              <div className="card-header">
                <FileText size={20} />
                <span>Trending PYQ</span>
              </div>
              <p className="card-title">SSC CGL 2025 Tier 2</p>
              <p className="card-meta">1.2k solved today</p>
              <div className="card-progress">
                <div className="progress-fill" style={{width: '75%'}}></div>
              </div>
            </div>
            <div className="visual-card floating-delayed">
              <div className="community-preview">
                <Users size={18} />
                <span>Active Discussions</span>
              </div>
              <div className="discussion-item">
                <span className="discussion-topic">Best strategy for Quant?</span>
                <span className="discussion-count">24 replies</span>
              </div>
              <div className="discussion-item">
                <span className="discussion-topic">Today's Vocab: 5 new words</span>
                <span className="discussion-count">12 replies</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="features">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">What We Offer</span>
            <h2 className="section-title">Everything you need, nothing you don't</h2>
            <p className="section-subtitle">Curated resources that actually help you prepare</p>
          </div>
          <div className="features-grid">
            {features.map((feature, i) => (
              <Link to={feature.link} className="feature-card" key={i}>
                <div className="feature-icon" style={{color: feature.color}}>
                  {feature.icon}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
                <span className="feature-link">
                  Explore <ArrowRight size={16} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Updates + Resources */}
      <section className="updates-resources">
        <div className="container">
          <div className="two-column">
            <div className="updates-column">
              <div className="column-header">
                <h3><TrendingUp size={20} /> Latest Updates</h3>
                <Link to="/community" className="view-all">View all</Link>
              </div>
              <div className="updates-list">
                {updates.map((update, i) => (
                  <div className="update-item" key={i}>
                    <div className="update-content">
                      <span className={`update-tag ${update.tag.toLowerCase()}`}>{update.tag}</span>
                      <p>{update.title}</p>
                      <span className="update-date">{update.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="resources-column">
              <div className="column-header">
                <h3><BookOpen size={20} /> Popular Downloads</h3>
                <Link to="/notes" className="view-all">View all</Link>
              </div>
              <div className="resources-list">
                {resources.map((resource, i) => (
                  <div className="resource-item" key={i}>
                    <div className="resource-info">
                      <p className="resource-title">{resource.title}</p>
                      <div className="resource-meta">
                        <span className="resource-type">{resource.type}</span>
                        <span className="resource-downloads">⬇ {resource.downloads}</span>
                      </div>
                    </div>
                    <button className="btn-ghost download-btn">
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community CTA */}
      <section className="community-cta">
        <div className="container">
          <div className="cta-card">
            <div className="cta-content">
              <MessageCircle size={32} />
              <h2>Join the conversation</h2>
              <p>Connect with thousands of aspirants, share your journey, and learn together.</p>
              <Link to="https://t.me/SSCYaar" className="btn btn-primary btn-large">
              
                Join SSCYaar Community <ArrowRight size={20} />
              </Link>
            </div>
            <div className="cta-stats">
              <div className="stat-item">
                <span className="stat-value">15k+</span>
                <span className="stat-name">Members</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">500+</span>
                <span className="stat-name">Daily Posts</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">24/7</span>
                <span className="stat-name">Peer Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home