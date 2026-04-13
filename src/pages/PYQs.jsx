import { FileText, Search, Filter } from 'lucide-react'
import './PYQs.css'

const PYQs = () => {
  const exams = ['SSC CGL', 'SSC CHSL', 'SSC MTS', 'SSC CPO']
  const years = ['2025', '2024', '2023', '2022', '2021']
  
  return (
    <div className="page-container container">
      <div className="page-header">
        <span className="section-badge">📋 Previous Year Questions</span>
        <h1 className="page-title">Practice with real exam papers</h1>
        <p className="page-subtitle">Access all SSC PYQs with detailed solutions, completely free</p>
      </div>
      
      <div className="pyq-filters">
        <div className="search-bar">
          <Search size={20} />
          <input type="text" placeholder="Search by exam, year, or subject..." />
        </div>
        <button className="btn btn-outline">
          <Filter size={18} /> Filters
        </button>
      </div>
      
      <div className="exam-grid">
        {exams.map(exam => (
          <div className="exam-card" key={exam}>
            <FileText size={32} />
            <h3>{exam}</h3>
            <div className="year-tags">
              {years.slice(0, 3).map(year => (
                <span key={year} className="year-tag">{year}</span>
              ))}
              <span className="more-years">+2 more</span>
            </div>
            <button className="btn btn-primary btn-full">View Papers</button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PYQs