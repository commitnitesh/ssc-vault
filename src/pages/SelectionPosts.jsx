import { useState, useMemo } from 'react'
import { Search, Filter, Briefcase, Download, Eye, AlertCircle, ExternalLink, X } from 'lucide-react'
import selectionPostsData from '../data/selectionPostsdata.json'
import './SelectionPosts.css'

const SelectionPosts = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPost, setSelectedPost] = useState(null)
  const [filters, setFilters] = useState({
    region: '',
    examLevel: '',
    payLevel: '',
    skillTest: '',
    ministry: '',
    experience: '',
    vacancyCategory: ''
  })
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const postsPerPage = 25

  // Extract unique values for filters
  const regions = useMemo(() => [...new Set(selectionPostsData.map(post => post.region))].sort(), [])
  const examLevels = ['Matriculation (10th)', 'Higher Secondary (10+2)', 'Graduation & Above']

  const payLevels = useMemo(() => {
    const unique = [...new Set(selectionPostsData.map(post => {
      const match = post.payScale?.match(/Level (\d+)/)
      return match ? `Level ${match[1]}` : null
    }))]
    return unique.filter(Boolean).sort((a, b) => parseInt(a.match(/\d+/)[0]) - parseInt(b.match(/\d+/)[0]))
  }, [])

  const ministries = useMemo(() => {
    const unique = [...new Set(selectionPostsData.map(post => {
      const match = post.departmentalDetails?.match(/Ministry Name(.+?)Department Name/)
      return match ? match[1].trim() : 'Other'
    }))]
    return unique.filter(Boolean).sort()
  }, [])

  // Get Exam Level
  const getExamLevel = (post) => {
    const eduText = post.educationDetails || ''
    if (eduText.includes('Matriculation (10th)')) return 'Matriculation (10th)'
    if (eduText.includes('Higher Secondary (10+2)')) return 'Higher Secondary (10+2)'
    if (eduText.includes('Graduation & Above')) return 'Graduation & Above'
    return 'N/A'
  }

  // Check if Experience is Required
  const hasExperience = (post) => {
    const eduText = post.educationDetails?.toLowerCase() || ''
    return eduText.includes('experience')
  }

  const getExperienceDisplay = (post) => {
    return hasExperience(post) ? 'Yes' : 'No'
  }

  // Get Skill Test Required
  const getSkillTest = (post) => {
    const deptDetails = post.departmentalDetails || ''
    if (deptDetails.includes('Skill Test RequiredYes')) return 'Yes'
    if (deptDetails.includes('Skill Test RequiredNo')) return 'No'
    return 'N/A'
  }

  // Get Age Limit
  const getAge = (post) => {
    const match = post.additionalDetails?.match(/Age Limit \(In Years\)(\d+)\s*-\s*(\d+)/)
    return match ? `${match[1]}-${match[2]}` : 'N/A'
  }

  // Get Pay Level Number
  const getPayLevel = (post) => {
    const match = post.payScale?.match(/Level (\d+):/)
    return match ? match[1] : 'N/A'
  }

  // Get Pay Scale Amount
  const getPayScaleAmount = (post) => {
    const amount = post.payScale?.split(': ')[1]
    return amount || post.payScale || 'N/A'
  }

  // Get PWD Vacancies
  const getPwdVacancies = (post) => {
    const match = post.categoryWiseVacancy?.match(/Vacancy for PWDOH (\d+) HH (\d+) VH (\d+) Others (\d+)/)
    return match ? { OH: match[1], HH: match[2], VH: match[3], Others: match[4] } : { OH: '0', HH: '0', VH: '0', Others: '0' }
  }

  // Get Category Wise Vacancy
  const getCategoryVacancy = (post) => {
    const match = post.categoryWiseVacancy?.match(/UR (\d+) ST (\d+) SC (\d+) OBC (\d+) EWS (\d+) Total(\d+)/)
    if (match) {
      return {
        ur: match[1], st: match[2], sc: match[3], obc: match[4], ews: match[5], total: match[6],
        esm: post.categoryWiseVacancy?.match(/ESM (\d+)/)?.[1] || '0'
      }
    }
    return { ur: '0', st: '0', sc: '0', obc: '0', ews: '0', total: '0', esm: '0' }
  }

  // Filter logic
  const filteredPosts = useMemo(() => {
    return selectionPostsData.filter(post => {
      // Search term
      if (searchTerm) {
        const searchable = `${post.postName} ${post.postCode} ${post.departmentalDetails} ${post.region}`.toLowerCase()
        if (!searchable.includes(searchTerm.toLowerCase())) return false
      }

      // Vacancy Category filter
      if (filters.vacancyCategory) {
        const vac = getCategoryVacancy(post)
        const pwd = getPwdVacancies(post)

        const categoryMap = {
          'UR': parseInt(vac.ur) || 0,
          'SC': parseInt(vac.sc) || 0,
          'ST': parseInt(vac.st) || 0,
          'OBC': parseInt(vac.obc) || 0,
          'EWS': parseInt(vac.ews) || 0,
          'ESM': parseInt(vac.esm) || 0,
          'OH': parseInt(pwd.OH) || 0,
          'HH': parseInt(pwd.HH) || 0,
          'VH': parseInt(pwd.VH) || 0
        }

        const vacancyCount = categoryMap[filters.vacancyCategory]
        if (vacancyCount === 0) return false
      }

      // Region filter
      if (filters.region && post.region !== filters.region) return false

      // Exam Level filter
      if (filters.examLevel && getExamLevel(post) !== filters.examLevel) return false

      // Pay Level filter
      if (filters.payLevel && getPayLevel(post) !== filters.payLevel.replace('Level ', '')) return false

      // Skill Test filter
      if (filters.skillTest && getSkillTest(post) !== filters.skillTest) return false

      // Ministry filter
      if (filters.ministry) {
        const postMinistry = post.departmentalDetails?.match(/Ministry Name(.+?)Department Name/)?.[1]?.trim()
        if (postMinistry !== filters.ministry) return false
      }

      // Experience filter
      if (filters.experience) {
        const postHasExp = hasExperience(post)
        if (filters.experience === 'With Experience' && !postHasExp) return false
        if (filters.experience === 'No Experience' && postHasExp) return false
      }

      return true
    })
  }, [searchTerm, filters])

  // Remove duplicates by postCode
  const uniquePosts = useMemo(() => {
    const seen = new Set()
    return filteredPosts.filter(post => {
      if (seen.has(post.postCode)) return false
      seen.add(post.postCode)
      return true
    })
  }, [filteredPosts])

  // Pagination
  const indexOfLastPost = currentPage * postsPerPage
  const indexOfFirstPost = indexOfLastPost - postsPerPage
  const currentPosts = uniquePosts.slice(indexOfFirstPost, indexOfLastPost)
  const totalPages = Math.ceil(uniquePosts.length / postsPerPage)

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const clearFilters = () => {
    setFilters({
      region: '',
      examLevel: '',
      payLevel: '',
      skillTest: '',
      ministry: '',
      experience: '',
      vacancyCategory: ''
    })
    setSearchTerm('')
  }

  const getDepartmentName = (post) => {
    return post.departmentalDetails?.match(/Department Name(.+?)Office Name/)?.[1]?.trim() ||
      post.departmentalDetails?.match(/Ministry Name(.+?)Department Name/)?.[1]?.trim() ||
      'N/A'
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
          <p className="page-subtitle">{uniquePosts.length} Vacancies Available</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="search-filter-section">
          <div className="search-bar-wrapper">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search by Post Name, Code, or Department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-actions">
            <button
              className={`filter-btn ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={18} /> Filters
              {Object.values(filters).some(v => v) && (
                <span className="filter-count">{Object.values(filters).filter(Boolean).length}</span>
              )}
            </button>
            {Object.values(filters).some(v => v) && (
              <button className="clear-btn" onClick={clearFilters}>Clear All</button>
            )}
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="filter-panel">
            <div className="filter-grid">

              <div className="filter-group">
                <label>Vacancy Available For</label>
                <select
                  value={filters.vacancyCategory}
                  onChange={(e) => setFilters({ ...filters, vacancyCategory: e.target.value })}
                >
                  <option value="">All Categories</option>
                  <option value="UR">UR (General)</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                  <option value="OBC">OBC</option>
                  <option value="EWS">EWS</option>
                  <option value="ESM">ESM (Ex-Serviceman)</option>
                  <option value="OH">OH (Orthopedic)</option>
                  <option value="HH">HH (Hearing)</option>
                  <option value="VH">VH (Visual)</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Region</label>
                <select value={filters.region} onChange={(e) => setFilters({ ...filters, region: e.target.value })}>
                  <option value="">All Regions</option>
                  {regions.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div className="filter-group">
                <label>Exam Level</label>
                <select value={filters.examLevel} onChange={(e) => setFilters({ ...filters, examLevel: e.target.value })}>
                  <option value="">All Levels</option>
                  {examLevels.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              <div className="filter-group">
                <label>Pay Level</label>
                <select value={filters.payLevel} onChange={(e) => setFilters({ ...filters, payLevel: e.target.value })}>
                  <option value="">All Pay Levels</option>
                  {payLevels.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              <div className="filter-group">
                <label>Skill Test Required</label>
                <select value={filters.skillTest} onChange={(e) => setFilters({ ...filters, skillTest: e.target.value })}>
                  <option value="">All</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Experience Required</label>
                <select value={filters.experience} onChange={(e) => setFilters({ ...filters, experience: e.target.value })}>
                  <option value="">All</option>
                  <option value="No Experience">No Experience</option>
                  <option value="With Experience">With Experience</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Ministry/Department</label>
                <select value={filters.ministry} onChange={(e) => setFilters({ ...filters, ministry: e.target.value })}>
                  <option value="">All Ministries</option>
                  {ministries.map(m => <option key={m} value={m}>{m}</option>)}
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
          <button className="export-btn">
            <Download size={16} /> Export List
          </button>
        </div>

        {/* Table View */}
        <div className="table-container">
          <table className="posts-table">
            <thead>
              <tr>
                <th>View</th>
                <th>S.No</th>
                <th>Region</th>
                <th>Post Code</th>
                <th>Post Name</th>
                <th>Department</th>
                <th>Age</th>
                <th>Pay</th>
                <th>Level</th>
                <th>Exp</th>
                <th>SC</th>
                <th>ST</th>
                <th>OBC</th>
                <th>UR</th>
                <th>EWS</th>
                <th>Total</th>
                <th>ESM</th>
                <th>OH</th>
                <th>HH</th>
                <th>VH</th>
                <th>Others</th>
              </tr>
            </thead>
            <tbody>
              {currentPosts.map((post, index) => {
                const vac = getCategoryVacancy(post)
                const pwd = getPwdVacancies(post)

                return (
                  <tr key={post.postCode} onClick={() => setSelectedPost(post)}>
                    <td>
                      <button className="view-btn">
                        <Eye size={16} />
                      </button>
                    </td>
                    <td>{indexOfFirstPost + index + 1}</td>
                    <td><span className="region-badge">{post.region?.substring(0, 3)}</span></td>
                    <td><span className="post-code">{post.postCode}</span></td>
                    <td className="post-name">{post.postName}</td>
                    <td className="dept-name">{getDepartmentName(post)}</td>
                    <td>{getAge(post)}</td>
                    <td><span className="pay-scale">{getPayScaleAmount(post)}</span></td>
                    <td>L{getPayLevel(post)}</td>
                    <td className={hasExperience(post) ? 'exp-yes' : 'exp-no'}>{getExperienceDisplay(post)}</td>
                    <td className={`vac-cell ${vac.sc !== '0' ? 'has-vacancy' : ''}`}>{vac.sc}</td>
                    <td className={`vac-cell ${vac.st !== '0' ? 'has-vacancy' : ''}`}>{vac.st}</td>
                    <td className={`vac-cell ${vac.obc !== '0' ? 'has-vacancy' : ''}`}>{vac.obc}</td>
                    <td className={`vac-cell ${vac.ur !== '0' ? 'has-vacancy' : ''}`}>{vac.ur}</td>
                    <td className={`vac-cell ${vac.ews !== '0' ? 'has-vacancy' : ''}`}>{vac.ews}</td>
                    <td className="vac-cell total-cell">{vac.total}</td>
                    <td className={`vac-cell ${vac.esm !== '0' ? 'has-vacancy' : ''}`}>{vac.esm}</td>
                    <td className={`vac-cell ${pwd.OH !== '0' ? 'has-vacancy' : ''}`}>{pwd.OH}</td>
                    <td className={`vac-cell ${pwd.HH !== '0' ? 'has-vacancy' : ''}`}>{pwd.HH}</td>
                    <td className={`vac-cell ${pwd.VH !== '0' ? 'has-vacancy' : ''}`}>{pwd.VH}</td>
                    <td className={`vac-cell ${pwd.Others !== '0' ? 'has-vacancy' : ''}`}>{pwd.Others}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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
                if (i + 1 === 1 || i + 1 === totalPages || (i + 1 >= currentPage - 2 && i + 1 <= currentPage + 2)) {
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

        {/* Detailed Modal */}
        {selectedPost && (
          <div className="modal-overlay" onClick={() => setSelectedPost(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{selectedPost.postName}</h2>
                <button className="modal-close" onClick={() => setSelectedPost(null)}>
                  <X size={24} />
                </button>
              </div>
              <div className="modal-body">
                <div className="detail-grid">
                  <div className="detail-item"><label>Post Code</label><span>{selectedPost.postCode}</span></div>
                  <div className="detail-item"><label>Region</label><span>{selectedPost.region}</span></div>
                  <div className="detail-item"><label>Pay Scale</label><span>{selectedPost.payScale}</span></div>
                  <div className="detail-item"><label>Age Limit</label><span>{getAge(selectedPost)} years</span></div>
                  <div className="detail-item"><label>Skill Test</label><span>{getSkillTest(selectedPost)}</span></div>
                  <div className="detail-item"><label>Experience Required</label><span>{getExperienceDisplay(selectedPost)}</span></div>
                  <div className="detail-item full-width"><label>Department</label><span>{selectedPost.departmentalDetails}</span></div>
                  <div className="detail-item full-width"><label>Education</label><span>{selectedPost.educationDetails}</span></div>
                  <div className="detail-item full-width"><label>Additional Details</label><span>{selectedPost.additionalDetails}</span></div>
                </div>

                <div className="vacancy-detail-section">
                  <h3>Category-wise Vacancy</h3>
                  <div className="vacancy-grid">
                    {Object.entries(getCategoryVacancy(selectedPost)).map(([k, v]) => (
                      <div key={k} className="vacancy-card">
                        <span className="cat-label">{k.toUpperCase()}</span>
                        <span className="cat-value">{v}</span>
                      </div>
                    ))}
                    <div className="vacancy-card"><span className="cat-label">OH</span><span className="cat-value">{getPwdVacancies(selectedPost).OH}</span></div>
                    <div className="vacancy-card"><span className="cat-label">HH</span><span className="cat-value">{getPwdVacancies(selectedPost).HH}</span></div>
                    <div className="vacancy-card"><span className="cat-label">VH</span><span className="cat-value">{getPwdVacancies(selectedPost).VH}</span></div>
                    <div className="vacancy-card"><span className="cat-label">Others</span><span className="cat-value">{getPwdVacancies(selectedPost).Others}</span></div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-primary">
                  <ExternalLink size={16} /> Official Notification
                </button>
                <button className="btn btn-outline" onClick={() => setSelectedPost(null)}>Close</button>
              </div>
            </div>
          </div>
        )}

        {/* No Results */}
        {uniquePosts.length === 0 && (
          <div className="no-results">
            <Briefcase size={48} />
            <h3>No posts found</h3>
            <p>Try adjusting your filters or search term</p>
            <button className="btn btn-primary" onClick={clearFilters}>Clear All Filters</button>
          </div>
        )}

        {/* Disclaimer */}
        <div className="disclaimer-banner">
          <AlertCircle size={16} />
          <span>For reference only. Verify all details on </span>
          <a href="https://ssc.gov.in" target="_blank" rel="noopener noreferrer">
            ssc.gov.in <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  )
}

export default SelectionPosts