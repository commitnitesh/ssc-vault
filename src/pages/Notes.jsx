import { BookOpen, Download, Star } from 'lucide-react'
import './Notes.css'

const Notes = () => {
  const subjects = [
    { name: 'Quantitative Aptitude', topics: 24, downloads: '5.2k', rating: 4.8 },
    { name: 'English Language', topics: 18, downloads: '4.1k', rating: 4.7 },
    { name: 'General Awareness', topics: 32, downloads: '6.5k', rating: 4.9 },
    { name: 'Reasoning', topics: 20, downloads: '3.8k', rating: 4.6 },
  ]
  
  return (
    <div className="page-container container">
      <div className="page-header">
        <span className="section-badge">📚 Free Study Material</span>
        <h1 className="page-title">Topic-wise notes by toppers</h1>
        <p className="page-subtitle">Download concise, exam-focused PDFs for free</p>
      </div>
      
      <div className="notes-grid">
        {subjects.map(subject => (
          <div className="note-card" key={subject.name}>
            <div className="note-header">
              <BookOpen size={24} />
              <div className="note-rating">
                <Star size={16} fill="#fbbf24" color="#fbbf24" />
                <span>{subject.rating}</span>
              </div>
            </div>
            <h3>{subject.name}</h3>
            <div className="note-meta">
              <span>{subject.topics} topics</span>
              <span>⬇ {subject.downloads} downloads</span>
            </div>
            <button className="btn btn-primary btn-full">
              <Download size={18} /> Download Notes
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Notes