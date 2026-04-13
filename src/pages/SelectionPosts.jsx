import { useState, useMemo } from 'react'
import { Search, Filter, Briefcase, MapPin, IndianRupee, GraduationCap, Calendar, ChevronDown, ChevronUp, Download, Eye, AlertCircle,ExternalLink  } from 'lucide-react'
import selectionPostsData from '../data/selectionPosts.json' // We'll move the JSON to a separate file
import './SelectionPosts.css'

const SelectionPosts = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPost, setSelectedPost] = useState(null)
  const [filters, setFilters] = useState({
    ministry: '',
    payLevel: '',
    qualification: '',
    category: ''
  })
  const [showFilters, setShowFilters] = useState(false)
  const [expandedPost, setExpandedPost] = useState(null)

  // Extract unique values for filters
  const ministries = useMemo(() => {
    const unique = [...new Set(selectionPostsData.map(post => {
      const match = post.departmentalDetails?.match(/Ministry Name(.+?)Department Name/)
      return match ? match[1].trim() : 'Other'
    }))]
    return unique.filter(Boolean).sort()
  }, [])

  const payLevels = useMemo(() => {
    const unique = [...new Set(selectionPostsData.map(post => {
      const match = post.payScale?.match(/Level (\d+)/)
      return match ? `Level ${match[1]}` : null
    }))]

    
    return unique.filter(Boolean).sort()
  }, [])

  const qualifications = useMemo(() => {
    return ['Matriculation (10th)', 'Higher Secondary (10+2)', 'Graduation & Above']
  }, [])

  // Filter and search logic
  const filteredPosts = useMemo(() => {
    return selectionPostsData.filter(post => {
      // Search term filter
      if (searchTerm) {
        const searchable = `${post.postName} ${post.postCode} ${post.departmentalDetails} ${post.educationDetails}`.toLowerCase()
        if (!searchable.includes(searchTerm.toLowerCase())) return false
      }

      // Ministry filter
      if (filters.ministry) {
        const postMinistry = post.departmentalDetails?.match(/Ministry Name(.+?)Department Name/)?.[1]?.trim()
        if (postMinistry !== filters.ministry) return false
      }

      // Pay level filter
      if (filters.payLevel) {
        const postLevel = post.payScale?.match(/Level (\d+)/)?.[1]
        if (`Level ${postLevel}` !== filters.payLevel) return false
      }

      // Qualification filter
      if (filters.qualification) {
        const qualLevel = post.educationDetails?.match(/Level of Examination(.+?)Essential Qualifications/)?.[1]?.trim()
        if (qualLevel !== filters.qualification) return false
      }

      return true
    })
  }, [searchTerm, filters])

  // Get unique post (remove duplicates by postCode)
  const uniquePosts = useMemo(() => {
    const seen = new Set()
    return filteredPosts.filter(post => {
      if (seen.has(post.postCode)) return false
      seen.add(post.postCode)
      return true
    })
  }, [filteredPosts])

  const clearFilters = () => {
    setFilters({
      ministry: '',
      payLevel: '',
      qualification: '',
      category: ''
    })
    setSearchTerm('')
  }

  const getVacancySummary = (post) => {
    const match = post.categoryWiseVacancy?.match(/UR (\d+).*?ST (\d+).*?SC (\d+).*?OBC (\d+).*?EWS (\d+).*?Total(\d+)/)
    if (match) {
      return {
        ur: match[1], st: match[2], sc: match[3], obc: match[4], ews: match[5], total: match[6]
      }
    }
    return null
  }

  const getAgeLimit = (post) => {
    const match = post.additionalDetails?.match(/Age Limit \(In Years\)(\d+)\s*-\s*(\d+)/)
    return match ? `${match[1]}-${match[2]} years` : 'N/A'
  }

  const getPayLevel = (post) => {
    const match = post.payScale?.match(/Level (\d+):/)
    return match ? `Level ${match[1]}` : 'N/A'
  }


  const [currentPage, setCurrentPage] = useState(1)
const postsPerPage = 20 // Show 20 posts per page

// Pagination logic
const indexOfLastPost = currentPage * postsPerPage
const indexOfFirstPost = indexOfLastPost - postsPerPage
const currentPosts = uniquePosts.slice(indexOfFirstPost, indexOfLastPost)
const totalPages = Math.ceil(uniquePosts.length / postsPerPage)

const paginate = (pageNumber) => {
  setCurrentPage(pageNumber)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

  return (
    <div className="selection-posts-page">
      <div className="container">
        {/* Header */}
        <div className="page-header">
          <span className="section-badge">
            <Briefcase size={16} /> Phase-XIV/2026
          </span>
          <h1 className="page-title">SSC Selection Posts</h1>
          <p className="page-subtitle">Western Region • {uniquePosts.length} Vacancies Available</p>
        </div>

          


        {/* Search and Filter Bar */}
        <div className="search-filter-section">
          <div className="search-bar-wrapper">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search by post name, code, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-actions">
            <button
              className={`btn btn-outline filter-btn ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={18} />
              Filters
              {(filters.ministry || filters.payLevel || filters.qualification) && (
                <span className="filter-count">
                  {[filters.ministry, filters.payLevel, filters.qualification].filter(Boolean).length}
                </span>
              )}
            </button>

            {(filters.ministry || filters.payLevel || filters.qualification || searchTerm) && (
              <button className="btn btn-ghost clear-btn" onClick={clearFilters}>
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="filter-panel">
            <div className="filter-grid">
              <div className="filter-group">
                <label>Ministry/Department</label>
                <select
                  value={filters.ministry}
                  onChange={(e) => setFilters({ ...filters, ministry: e.target.value })}
                >
                  <option value="">All Ministries</option>
                  {ministries.map(ministry => (
                    <option key={ministry} value={ministry}>{ministry}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Pay Level</label>
                <select
                  value={filters.payLevel}
                  onChange={(e) => setFilters({ ...filters, payLevel: e.target.value })}
                >
                  <option value="">All Pay Levels</option>
                  {payLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Qualification Required</label>
                <select
                  value={filters.qualification}
                  onChange={(e) => setFilters({ ...filters, qualification: e.target.value })}
                >
                  <option value="">All Qualifications</option>
                  {qualifications.map(qual => (
                    <option key={qual} value={qual}>{qual}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Results Summary */}
<div className="results-summary">
  <span>
    Showing <strong>{indexOfFirstPost + 1}-{Math.min(indexOfLastPost, uniquePosts.length)}</strong> of <strong>{uniquePosts.length}</strong> posts
  </span>
  <button className="btn-ghost export-btn">
    <Download size={16} /> Export List
  </button>
</div>

        {/* Posts Grid */}
        <div className="posts-grid">
          {uniquePosts.map((post) => {
            const vacancy = getVacancySummary(post)
            const isExpanded = expandedPost === post.postCode

            return (
              <div key={post.postCode} className={`post-card ${isExpanded ? 'expanded' : ''}`}>
                <div className="post-header" onClick={() => setExpandedPost(isExpanded ? null : post.postCode)}>
                  <div className="post-title-section">
                    <h3 className="post-name">{post.postName}</h3>
                    <div className="post-meta">
                      <span className="post-code">Code: {post.postCode}</span>
                      <span className="post-level">{getPayLevel(post)}</span>
                    </div>
                  </div>
                  <button className="expand-btn">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>

                <div className="post-preview">
                  <div className="preview-row">
                    <span className="preview-label">
                      <IndianRupee size={14} /> Pay Scale
                    </span>
                    <span className="preview-value">{post.payScale}</span>
                  </div>
                  <div className="preview-row">
                    <span className="preview-label">
                      <GraduationCap size={14} /> Qualification
                    </span>
                    <span className="preview-value">
                      {post.educationDetails?.match(/Level of Examination(.+?)Essential/)?.[1]?.trim() || 'N/A'}
                    </span>
                  </div>
                  <div className="preview-row">
                    <span className="preview-label">
                      <Calendar size={14} /> Age Limit
                    </span>
                    <span className="preview-value">{getAgeLimit(post)}</span>
                  </div>

                  {vacancy && (
                    <div className="vacancy-preview">
                      <div className="vacancy-total">
                        Total Vacancies: <strong>{vacancy.total}</strong>
                      </div>
                      <div className="vacancy-breakdown">
                        {vacancy.ur > 0 && <span className="vacancy-tag ur">UR: {vacancy.ur}</span>}
                        {vacancy.sc > 0 && <span className="vacancy-tag sc">SC: {vacancy.sc}</span>}
                        {vacancy.st > 0 && <span className="vacancy-tag st">ST: {vacancy.st}</span>}
                        {vacancy.obc > 0 && <span className="vacancy-tag obc">OBC: {vacancy.obc}</span>}
                        {vacancy.ews > 0 && <span className="vacancy-tag ews">EWS: {vacancy.ews}</span>}
                      </div>
                    </div>
                  )}
                </div>

                {isExpanded && (
                  <div className="post-details">
                    <div className="detail-section">
                      <h4>Department Details</h4>
                      <p>{post.departmentalDetails}</p>
                    </div>

                    <div className="detail-section">
                      <h4>Educational Qualification</h4>
                      <p>{post.educationDetails}</p>
                    </div>

                    <div className="detail-section">
                      <h4>Job Requirements / Duties</h4>
                      <p className="duties-text">{post['Job Requirements / Duties Of Post']}</p>
                    </div>

                    <div className="detail-section">
                      <h4>Additional Details</h4>
                      <p>{post.additionalDetails}</p>
                    </div>

                    {vacancy && (
                      <div className="detail-section">
                        <h4>Category-wise Vacancy Details</h4>
                        <div className="vacancy-detail-grid">
                          <div className="vacancy-item">UR: {vacancy.ur}</div>
                          <div className="vacancy-item">SC: {vacancy.sc}</div>
                          <div className="vacancy-item">ST: {vacancy.st}</div>
                          <div className="vacancy-item">OBC: {vacancy.obc}</div>
                          <div className="vacancy-item">EWS: {vacancy.ews}</div>
                          <div className="vacancy-item total">Total: {vacancy.total}</div>
                        </div>
                      </div>
                    )}

                    <div className="post-actions">
                      <button className="btn btn-primary">
                        <Eye size={16} /> View Official Notification
                      </button>
                      <button className="btn btn-outline">
                        <Download size={16} /> Save Details
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>


{/* Pagination Controls */}
{totalPages > 1 && (
  <div className="pagination">
    <button 
      className="pagination-btn"
      onClick={() => paginate(currentPage - 1)}
      disabled={currentPage === 1}
    >
      Previous
    </button>
    
    <div className="pagination-numbers">
      {[...Array(totalPages)].map((_, i) => {
        // Show limited page numbers with ellipsis
        if (
          i + 1 === 1 || 
          i + 1 === totalPages || 
          (i + 1 >= currentPage - 2 && i + 1 <= currentPage + 2)
        ) {
          return (
            <button
              key={i}
              className={`pagination-number ${currentPage === i + 1 ? 'active' : ''}`}
              onClick={() => paginate(i + 1)}
            >
              {i + 1}
            </button>
          )
        } else if (i + 1 === currentPage - 3 || i + 1 === currentPage + 3) {
          return <span key={i} className="pagination-ellipsis">...</span>
        }
        return null
      })}
    </div>
    
    <button 
      className="pagination-btn"
      onClick={() => paginate(currentPage + 1)}
      disabled={currentPage === totalPages}
    >
      Next
    </button>
  </div>
)}
        

        {uniquePosts.length === 0 && (
          <div className="no-results">
            <Briefcase size={48} />
            <h3>No posts found</h3>
            <p>Try adjusting your filters or search term</p>
            <button className="btn btn-primary" onClick={clearFilters}>
              Clear All Filters
            </button>
          </div>
        )}

        <p>
          
        </p>
     
{/* Short One-Line Disclaimer */}
<div className="disclaimer-banner">
  <AlertCircle size={16} />
  <span>For reference only. Verify all details on </span>
  <a 
    href="https://ssc.gov.in" 
    target="_blank" 
    rel="noopener noreferrer"
  >
    ssc.gov.in <ExternalLink size={12} />
  </a>
</div>
      </div>

    </div>
  )
}

export default SelectionPosts