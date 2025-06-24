import { useState } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import './App.css'

export type Platform = 'tiktok' | 'instagram' | 'facebook' | 'youtube'

function App() {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('tiktok')

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Header />
      <main>
        <HomePage selectedPlatform={selectedPlatform} />
      </main>
      <Footer />
      
      {/* Global platform change listener */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.addEventListener('platformChange', (e) => {
              // This will be handled by the HomePage component
            });
          `
        }}
      />
    </div>
  )
}

export default App
