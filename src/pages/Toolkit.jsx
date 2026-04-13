import { Calculator, Clock, Percent, BarChart } from 'lucide-react'
import './Toolkit.css'

const Toolkit = () => {
  const tools = [
    { name: 'Percentage Calculator', icon: <Percent />, desc: 'Quick percentage calculations' },
    { name: 'Time & Work Solver', icon: <Clock />, desc: 'Solve time-work problems instantly' },
    { name: 'Profit & Loss', icon: <Calculator />, desc: 'Calculate profit/loss percentages' },
    { name: 'Progress Tracker', icon: <BarChart />, desc: 'Track your preparation progress' },
  ]
  
  return (
    <div className="page-container container">
      <div className="page-header">
        <span className="section-badge">🛠️ Exam Toolkit</span>
        <h1 className="page-title">Smart tools for smart prep</h1>
        <p className="page-subtitle">Calculators, trackers, and utilities designed for SSC aspirants</p>
      </div>
      
      <div className="tools-grid">
        {tools.map(tool => (
          <div className="tool-card" key={tool.name}>
            <div className="tool-icon">{tool.icon}</div>
            <h3>{tool.name}</h3>
            <p>{tool.desc}</p>
            <button className="btn btn-outline btn-full">Open Tool</button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Toolkit