import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Users, FileText, BookOpen, Wrench } from 'lucide-react'
import './Navbar.css'
import logoImage from '../assets/sscyaar.jpg'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'PYQs', path: '/pyqs', icon: <FileText size={18} /> },
    { name: 'Notes', path: '/notes', icon: <BookOpen size={18} /> },
    { name: 'Community', path: '/community', icon: <Users size={18} /> },
    { name: 'Toolkit', path: '/toolkit', icon: <Wrench size={18} /> },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <Link to="/" className="logo">
          <div className="logo-icon">
            <img
              src={logoImage}
              alt="SSCYaar Logo"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'block'
              }}
            />
            <span style={{ display: 'none' }}>🎯</span>
          </div>
          <span className="logo-text">SSCYaar</span>
        </Link>

        <ul className={`nav-menu ${isOpen ? 'active' : ''}`}>
          {navLinks.map((link) => (
            <li key={link.path}>
              <Link
                to={link.path}
                className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
                onClick={() => setIsOpen(false)}
              >
                {link.icon && <span className="nav-icon">{link.icon}</span>}
                {link.name}
              </Link>
            </li>
          ))}
          <li className="nav-cta">
            <Link to="https://t.me/SSCYaar" className="btn btn-primary nav-btn">
              Join Community <Users size={16} />
            </Link>
          </li>
        </ul>

        <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
  )
}

export default Navbar