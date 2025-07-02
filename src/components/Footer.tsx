const Footer = () => {
  return (
    <footer className="w-full py-8 sm:py-12 mt-12 sm:mt-16 lg:mt-20 bg-white/5 backdrop-blur-sm border-t border-white/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center text-white/70">
          <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-lg flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="sm:w-3 sm:h-3">
                <circle cx="12" cy="12" r="10" fill="#3B82F6"/>
                <path d="M8 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-white font-semibold text-sm sm:text-base">TikTokReels</span>
          </div>
          <p className="text-xs sm:text-sm">&copy; 2025 TikTokReels. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer 