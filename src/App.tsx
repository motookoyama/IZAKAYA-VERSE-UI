import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './components/Home'
import Play from './components/Play'
import Library from './components/Library'
import Tickets from './components/Tickets'
import Redeem from './components/Redeem'
import Navigation from './components/Navigation'
import CardDock from './components/CardDock'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white font-sans">
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/play" element={<Play />} />
          <Route path="/library" element={<Library />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/redeem" element={<Redeem />} />
          <Route path="/dock" element={<CardDock />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
