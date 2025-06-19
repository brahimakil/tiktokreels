import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import './App.css'

export type Platform = 'tiktok' | 'instagram' | 'facebook'

function App() {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('tiktok')

  // Listen for platform change events
  useEffect(() => {
    const handlePlatformChange = (event: CustomEvent) => {
      setSelectedPlatform(event.detail as Platform)
    }

    window.addEventListener('platformChange', handlePlatformChange as EventListener)
    
    return () => {
      window.removeEventListener('platformChange', handlePlatformChange as EventListener)
    }
  }, [])

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-[#8B5CF6] via-[#6366F1] to-[#3B82F6] flex flex-col">
        <Header selectedPlatform={selectedPlatform} setSelectedPlatform={setSelectedPlatform} />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage selectedPlatform={selectedPlatform} />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
