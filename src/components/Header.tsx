import { Platform } from '../App'

interface HeaderProps {
  selectedPlatform: Platform
  setSelectedPlatform: (platform: Platform) => void
}

const Header = ({ selectedPlatform, setSelectedPlatform }: HeaderProps) => {
  return (
    <header className="w-full px-4 sm:px-6 py-4 sm:py-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="sm:w-4 sm:h-4">
              <circle cx="12" cy="12" r="10" fill="#3B82F6"/>
              <path d="M8 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-white text-lg sm:text-xl font-semibold tracking-tight">TikTokReels</span>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
          <a href="#" className="text-white/90 hover:text-white transition-colors text-sm font-medium">Features</a>
          <a href="#" className="text-white/90 hover:text-white transition-colors text-sm font-medium">How It Works</a>
          <a href="#" className="text-white/90 hover:text-white transition-colors text-sm font-medium">FAQ</a>
          <a href="#" className="text-white/90 hover:text-white transition-colors text-sm font-medium">Contact</a>
        </nav>
      </div>
    </header>
  )
}

export default Header 