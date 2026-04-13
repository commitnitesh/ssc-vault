import { Link } from 'react-router-dom'
import { Mail, MapPin, Twitter, Instagram, Youtube, Heart } from 'lucide-react'
import './Footer.css'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <div className="logo-icon">
                <span>🎯</span>
              </div>
              <span className="logo-text">SSCYaar</span>
            </Link>
            <p className="footer-tagline">
              Your companion for SSC journey. Free resources, community support, and smart tools.
            </p>
            <div className="social-links">
              <a href="#" aria-label="Twitter"><Twitter size={20} /></a>
              <a href="#" aria-label="Instagram"><Instagram size={20} /></a>
              <a href="#" aria-label="YouTube"><Youtube size={20} /></a>
            </div>
          </div>

          <div className="footer-links">
            <h4>Resources</h4>
            <ul>
              <li><Link to="/pyqs">Previous Year Questions</Link></li>
              <li><Link to="/notes">Free Study Notes</Link></li>
              <li><Link to="/toolkit">Exam Toolkit</Link></li>
              <li><a href="#">SSC Notifications</a></li>
            </ul>
          </div>

          <div className="footer-links">
            <h4>Community</h4>
            <ul>
              <li><Link to="/community">Discussion Forum</Link></li>
              <li><a href="#">Telegram Group</a></li>
              <li><a href="#">Success Stories</a></li>
              <li><a href="#">Ask Mentors</a></li>
            </ul>
          </div>

          <div className="footer-contact">
            <h4>Connect</h4>
            <p><Mail size={16} /> hello@sscyaar.com</p>
            <p><MapPin size={16} /> India</p>
            <p className="footer-motto">By Aspirants, For Aspirants <Heart size={14} fill="#ef4444" color="#ef4444" /></p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 SSCYaar. Open source for the community.</p>
          <div className="footer-legal">
            <Link to="#">Privacy</Link>
            <Link to="#">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer