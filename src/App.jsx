import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import PYQs from './pages/PYQs'
import Notes from './pages/Notes'
import Community from './pages/Community'
import Toolkit from './pages/Toolkit'
import SelectionPosts from './pages/SelectionPosts' 

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/pyqs" element={<PYQs />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/community" element={<Community />} />
            <Route path="/toolkit" element={<Toolkit />} />
             <Route path="/selection-posts" element={<SelectionPosts />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App