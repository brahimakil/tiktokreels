import { useState, useEffect } from 'react'
import { Platform } from '../App'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { downloadVideo, VideoDownloadResponse, checkBackendHealth } from '../services/api'

interface HomePageProps {
  selectedPlatform: Platform
}

const HomePage = ({ selectedPlatform }: HomePageProps) => {
  const [url, setUrl] = useState('')
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadResult, setDownloadResult] = useState<VideoDownloadResponse | null>(null)
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking')

  const platformConfig = {
    tiktok: {
      name: 'TikTok',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43V7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.43z"/>
        </svg>
      ),
      color: 'bg-black',
      placeholder: 'https://www.tiktok.com/@username/video...'
    },
    instagram: {
      name: 'Instagram', 
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
      color: 'bg-gradient-to-r from-purple-500 to-pink-500',
      placeholder: 'https://www.instagram.com/p/...'
    },
    facebook: {
      name: 'Facebook',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      color: 'bg-blue-600',
      placeholder: 'https://www.facebook.com/...'
    }
  }

  const currentPlatform = platformConfig[selectedPlatform]

  const handlePlatformSelect = (platform: Platform) => {
    window.dispatchEvent(new CustomEvent('platformChange', { detail: platform }))
  }

  useEffect(() => {
    const checkStatus = async () => {
      const isOnline = await checkBackendHealth()
      setBackendStatus(isOnline ? 'online' : 'offline')
    }
    
    checkStatus()
    // Check every 30 seconds
    const interval = setInterval(checkStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleDownload = async () => {
    if (!url) return
    
    setIsDownloading(true)
    setDownloadResult(null)
    
    try {
      // Use the universal download function
      const result = await downloadVideo(url)
      setDownloadResult(result)
      
      // Log for debugging
      console.log('🎯 Download result:', result)
      
    } catch (error) {
      console.error('💥 Download error:', error)
      setDownloadResult({
        success: false,
        error: 'Something went wrong. Please try again.'
      })
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="px-4 sm:px-6 py-12 sm:py-16 lg:py-20 text-center">
        <div className="max-w-5xl mx-auto">
          {/* Trust Badges */}
          <div className="flex justify-center items-center flex-wrap gap-2 sm:gap-4 mb-6 sm:mb-8">
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 sm:px-4 sm:py-2 border border-white/20">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full"></div>
              <span className="text-white/90 text-xs sm:text-sm font-medium">100% Free</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 sm:px-4 sm:py-2 border border-white/20">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-400 rounded-full"></div>
              <span className="text-white/90 text-xs sm:text-sm font-medium">No Registration</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 sm:px-4 sm:py-2 border border-white/20">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-purple-400 rounded-full"></div>
              <span className="text-white/90 text-xs sm:text-sm font-medium">2M+ Downloads</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight px-2">
            Download Any Video in <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Seconds</span>
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-white/90 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-4">
            The fastest, most reliable video downloader for TikTok, Instagram & Facebook. 
            <span className="font-semibold text-yellow-300"> No ads, no limits, no BS.</span>
          </p>
          
          {/* Social Proof */}
          <div className="mb-8 sm:mb-12">
            <p className="text-white/70 mb-3 sm:mb-4 text-sm sm:text-base">Trusted by content creators worldwide</p>
            <div className="flex justify-center items-center flex-wrap gap-2 sm:gap-4 lg:gap-6 text-white/60 text-xs sm:text-sm">
              <span>⭐⭐⭐⭐⭐ 4.9/5</span>
              <span className="hidden sm:inline">•</span>
              <span>2M+ Users</span>
              <span className="hidden sm:inline">•</span>
              <span>99.9% Uptime</span>
            </div>
          </div>
          
          {/* Platform Selection */}
          <div className="flex justify-center flex-wrap gap-2 sm:gap-3 lg:gap-4 mb-12 sm:mb-16">
            {Object.entries(platformConfig).map(([key, config]) => (
              <Button
                key={key}
                variant="ghost"
                className={`${selectedPlatform === key 
                  ? 'bg-white/20 text-white border border-white/30 shadow-lg' 
                  : 'bg-white/10 text-white/80 border border-white/20 hover:bg-white/20 hover:text-white'} 
                  px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 rounded-full backdrop-blur-sm transition-all duration-300 font-medium text-sm sm:text-base lg:text-lg`}
                onClick={() => handlePlatformSelect(key as Platform)}
              >
                <span className="mr-2 sm:mr-3">{config.icon}</span>
                {config.name}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section className="px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-12 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full -translate-y-10 translate-x-10 sm:-translate-y-16 sm:translate-x-16 opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-tr from-pink-100 to-yellow-100 rounded-full translate-y-8 -translate-x-8 sm:translate-y-12 sm:-translate-x-12 opacity-50"></div>
          
          <div className="relative z-10">
            <div className="text-center mb-6 sm:mb-8 lg:mb-10">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                Paste Your Video URL
              </h2>
              <p className="text-gray-600 text-base sm:text-lg lg:text-xl leading-relaxed max-w-2xl mx-auto px-2">
                Copy any video link from {currentPlatform.name} and paste it below. 
                <span className="font-semibold text-blue-600"> Download starts instantly!</span>
              </p>
            </div>
            
            <div className="space-y-6 sm:space-y-8">
              <div className="relative">
                <Input
                  type="url"
                  placeholder={currentPlatform.placeholder}
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 text-base sm:text-lg lg:text-xl border-2 sm:border-3 border-gray-200 rounded-xl sm:rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all bg-gray-50 focus:bg-white shadow-inner pr-16 sm:pr-20"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg sm:rounded-xl px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2 font-medium text-xs sm:text-sm"
                  onClick={() => navigator.clipboard.readText().then(setUrl).catch(() => {})}
                >
                  📋 <span className="hidden sm:inline">Paste</span>
                </Button>
              </div>
              
              {/* Simplified Download Section - No Quality Options */}
              <div className="space-y-4">
                {/* Backend Status Indicator */}
                <div className="flex justify-center">
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${
                    backendStatus === 'online' 
                      ? 'bg-green-100 text-green-800' 
                      : backendStatus === 'offline' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      backendStatus === 'online' 
                        ? 'bg-green-500' 
                        : backendStatus === 'offline' 
                        ? 'bg-red-500' 
                        : 'bg-yellow-500'
                    }`}></div>
                    <span>
                      {backendStatus === 'online' 
                        ? 'Backend Online' 
                        : backendStatus === 'offline' 
                        ? 'Backend Offline' 
                        : 'Checking...'}
                    </span>
                  </div>
                </div>

                {/* Single Download Button */}
                <Button
                  onClick={handleDownload}
                  disabled={!url || isDownloading || backendStatus !== 'online'}
                  className="w-full py-4 sm:py-5 lg:py-6 text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 rounded-xl sm:rounded-2xl text-white border-0 shadow-2xl transition-all duration-300 hover:shadow-3xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isDownloading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="hidden sm:inline">Downloading...</span>
                      <span className="sm:hidden">Loading...</span>
                    </>
                  ) : (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 sm:mr-3">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7,10 12,15 17,10"/>
                        <line x1="12" x2="12" y1="15" y2="3"/>
                      </svg>
                      <span className="hidden sm:inline">
                        {url ? '🚀 Download Video Now!' : '⚡ Paste URL to Download'}
                      </span>
                      <span className="sm:hidden">
                        {url ? '🚀 Download!' : '⚡ Paste URL'}
                      </span>
                    </>
                  )}
                </Button>

                {/* Download Results */}
                {downloadResult && (
                  <div className={`mt-6 p-4 rounded-xl border-2 ${
                    downloadResult.success 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    {downloadResult.success ? (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          <h3 className="text-lg font-semibold text-green-800">Download Ready!</h3>
                        </div>
                        
                        {downloadResult.video_info && (
                          <div className="bg-white p-4 rounded-lg space-y-2">
                            <p><strong>Title:</strong> {downloadResult.video_info.title || 'Untitled'}</p>
                            <p><strong>Author:</strong> {downloadResult.video_info.author || 'Unknown'}</p>
                            <p><strong>Views:</strong> {downloadResult.video_info.view_count?.toLocaleString() || 'N/A'}</p>
                            <p><strong>Likes:</strong> {downloadResult.video_info.like_count?.toLocaleString() || 'N/A'}</p>
                          </div>
                        )}
                        
                        {downloadResult.download_url && (
                          <Button
                            asChild
                            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold"
                          >
                            <a 
                              href={downloadResult.download_url} 
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              📥 Download Video
                            </a>
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                        <div>
                          <h3 className="text-lg font-semibold text-red-800">Download Failed</h3>
                          <p className="text-red-600">{downloadResult.error}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-4 sm:px-6 py-16 sm:py-20 lg:py-24 bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-6">
              How It Works
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl text-white/80 max-w-3xl mx-auto px-4">
              Download any video in just <span className="font-bold text-yellow-300">3 simple steps</span>
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
            {[
              {
                step: 1,
                title: "Copy Video Link",
                description: "Find your favorite video on TikTok, Instagram, or Facebook. Copy the video URL from your browser or app.",
                icon: (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-10 sm:h-10">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                  </svg>
                ),
                color: "from-blue-500 to-cyan-500"
              },
              {
                step: 2,
                title: "Paste & Choose Quality",
                description: "Paste the URL in our downloader, select your preferred video quality, and hit the download button.",
                icon: (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-10 sm:h-10">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                  </svg>
                ),
                color: "from-purple-500 to-pink-500"
              },
              {
                step: 3,
                title: "Download Instantly",
                description: "Your video processes in seconds and downloads directly to your device in the highest quality available.",
                icon: (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-10 sm:h-10">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7,10 12,15 17,10"/>
                    <line x1="12" x2="12" y1="15" y2="3"/>
                  </svg>
                ),
                color: "from-green-500 to-emerald-500"
              }
            ].map((item, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-6 sm:mb-8">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto backdrop-blur-sm border border-white/20 group-hover:scale-110 transition-transform duration-300">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-r ${item.color} rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-xl`}>
                      {item.step}
                    </div>
                  </div>
                  {index < 2 && (
                    <div className="hidden md:block absolute top-8 sm:top-10 lg:top-12 left-full w-full h-0.5 bg-gradient-to-r from-white/30 to-transparent"></div>
                  )}
                </div>
                <div className="bg-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 backdrop-blur-sm border border-white/20 group-hover:bg-white/15 transition-all duration-300">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center">
                    {item.icon}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">{item.title}</h3>
                  <p className="text-white/80 leading-relaxed text-base sm:text-lg">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 sm:px-6 py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-6">
              Why TikTokReels is #1 Choice
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl text-white/80 max-w-3xl mx-auto px-4">
              Join millions who trust us for fast, secure video downloads
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              {
                title: "Lightning Fast",
                description: "Download videos in under 10 seconds. Our servers are optimized for speed worldwide.",
                icon: (
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-12 sm:h-12">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                  </svg>
                ),
                color: "from-yellow-400 to-orange-500"
              },
              {
                title: "4K HD Quality",
                description: "Download in original quality up to 4K resolution. Never compromise on video quality.",
                icon: (
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-12 sm:h-12">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                    <line x1="8" x2="16" y1="21" y2="21"/>
                    <line x1="12" x2="12" y1="17" y2="21"/>
                  </svg>
                ),
                color: "from-blue-500 to-purple-600"
              },
              {
                title: "100% Secure",
                description: "No malware, no tracking, no data collection. Your privacy and security come first.",
                icon: (
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-12 sm:h-12">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                ),
                color: "from-green-500 to-emerald-600"
              },
              {
                title: "All Devices",
                description: "Works perfectly on iPhone, Android, PC, Mac. Download anywhere, anytime.",
                icon: (
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-12 sm:h-12">
                    <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
                    <line x1="12" x2="12.01" y1="18" y2="18"/>
                  </svg>
                ),
                color: "from-pink-500 to-rose-600"
              }
            ].map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="bg-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto mb-4 sm:mb-6 bg-gradient-to-r ${feature.color} rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-3 sm:mb-4">{feature.title}</h3>
                  <p className="text-white/80 leading-relaxed text-sm sm:text-base lg:text-lg">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="px-4 sm:px-6 py-16 sm:py-20 lg:py-24 bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">
              What Our Users Say
            </h2>
            <p className="text-lg sm:text-xl text-white/80">
              Join 2M+ happy users worldwide
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                name: "Sarah Chen",
                role: "Content Creator",
                text: "Finally! A downloader that actually works fast and doesn't spam me with ads. I use this daily for my content.",
                rating: 5
              },
              {
                name: "Mike Rodriguez",
                role: "Social Media Manager",
                text: "Best video downloader I've found. Super clean interface and downloads are lightning fast. Highly recommend!",
                rating: 5
              },
              {
                name: "Emma Thompson",
                role: "Student",
                text: "Perfect for saving educational content. No registration needed and it works on my phone perfectly.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white/10 rounded-xl sm:rounded-2xl p-6 sm:p-8 backdrop-blur-sm border border-white/20">
                <div className="flex mb-3 sm:mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-lg sm:text-xl">⭐</span>
                  ))}
                </div>
                <p className="text-white/90 mb-4 sm:mb-6 text-base sm:text-lg leading-relaxed">"{testimonial.text}"</p>
                <div>
                  <p className="text-white font-semibold text-sm sm:text-base">{testimonial.name}</p>
                  <p className="text-white/70 text-xs sm:text-sm">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-4 sm:px-6 py-16 sm:py-20 lg:py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">
              Frequently Asked Questions
            </h2>
          </div>
          
          <div className="space-y-4 sm:space-y-6">
            {[
              {
                question: "Is TikTokReels completely free?",
                answer: "Yes! TikTokReels is 100% free with no hidden costs, subscriptions, or premium features. Download unlimited videos."
              },
              {
                question: "Do I need to create an account?",
                answer: "No registration required! Simply paste your video URL and download instantly. We respect your privacy."
              },
              {
                question: "What video quality can I download?",
                answer: "We support all available qualities from the original video, including HD 1080p, Standard 720p, and Mobile 480p."
              },
              {
                question: "Is it safe to use?",
                answer: "Absolutely! We don't store your videos, collect personal data, or install any software. Your privacy is our priority."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white/10 rounded-xl sm:rounded-2xl p-6 sm:p-8 backdrop-blur-sm border border-white/20">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">{faq.question}</h3>
                <p className="text-white/80 leading-relaxed text-sm sm:text-base lg:text-lg">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage 