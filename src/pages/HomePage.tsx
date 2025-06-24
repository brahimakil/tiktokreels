import { useState, useEffect } from 'react'
import { Platform } from '../App'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { downloadVideo, VideoDownloadResponse, checkBackendHealth, downloadVideoTwoStep } from '../services/api'

interface HomePageProps {
  selectedPlatform: Platform
}

const HomePage = ({ selectedPlatform }: HomePageProps) => {
  const [url, setUrl] = useState('')
  const [isDownloading, setIsDownloading] = useState(false)
  const [isLoadingInfo, setIsLoadingInfo] = useState(false)
  const [isGettingDownloadUrl, setIsGettingDownloadUrl] = useState(false)
  const [downloadResult, setDownloadResult] = useState<VideoDownloadResponse | null>(null)
  const [hasDownloadUrl, setHasDownloadUrl] = useState(false)
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking')
  const [processingTime, setProcessingTime] = useState(0)

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
    },
    youtube: {
      name: 'YouTube',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      ),
      color: 'bg-red-600',
      placeholder: 'https://www.youtube.com/watch?v=...'
    }
  }

  const currentPlatform = platformConfig[selectedPlatform]

  const handlePlatformSelect = (platform: Platform) => {
    window.dispatchEvent(new CustomEvent('platformChange', { detail: platform }))
  }

  useEffect(() => {
    const checkStatus = async () => {
      console.log('🔍 Starting backend health check...');
      const isOnline = await checkBackendHealth()
      console.log('🔍 Health check result:', isOnline);
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
    setIsLoadingInfo(true)
    setDownloadResult(null)
    setHasDownloadUrl(false)
    setProcessingTime(0)
    
    // Start timer for Instagram processing
    let timer: NodeJS.Timeout | null = null
    if (isInstagramUrl(url)) {
      timer = setInterval(() => {
        setProcessingTime(prev => prev + 1)
      }, 1000)
    }
    
    try {
      // Step 1: Get video info (fast)
      const { infoResult, downloadResult: immediateDownload } = await downloadVideoTwoStep(url)
      
      setDownloadResult(infoResult)
      setIsLoadingInfo(false)
      
      if (immediateDownload) {
        // For TikTok/Instagram/Facebook - we already have the download URL
        setHasDownloadUrl(true)
        setDownloadResult(immediateDownload)
      } else {
        // For YouTube - we need to fetch the download URL separately
        setIsGettingDownloadUrl(true)
        
        // Step 2: Get download URL (slower)
        const fullResult = await downloadVideo(url)
        setDownloadResult(fullResult)
        setHasDownloadUrl(true)
        setIsGettingDownloadUrl(false)
      }
      
    } catch (error) {
      console.error('💥 Download error:', error)
      setDownloadResult({
        success: false,
        error: 'Something went wrong. Please try again.'
      })
      setIsLoadingInfo(false)
      setIsGettingDownloadUrl(false)
    } finally {
      setIsDownloading(false)
      if (timer) {
        clearInterval(timer)
      }
    }
  }

  // Enhanced function to handle download button click - Updated for new Instagram API
  const handleDownloadClick = async () => {
    if (!downloadResult?.data) return;

    console.log('🔍 Full download result:', downloadResult);
    console.log('🔍 Download result data:', downloadResult.data);

    // Get the download URL based on media type
    let downloadUrl: string | undefined;
    let filename: string;
    
    if (downloadResult.data.platform === 'instagram') {
      // For Instagram, use video_url for videos, display_url for images
      downloadUrl = downloadResult.data.is_video 
        ? downloadResult.data.video_url || downloadResult.data.downloadUrl
        : downloadResult.data.display_url || downloadResult.data.downloadUrl;
      
      filename = downloadResult.data.safeTitle || 
                `${downloadResult.data.owner?.username || 'instagram'}_${downloadResult.data.shortcode || 'media'}`;
      
      // Add appropriate extension
      if (downloadResult.data.is_video) {
        filename += '.mp4';
      } else {
        filename += '.jpg';
      }
    } else {
      // For other platforms
      downloadUrl = downloadResult.data.downloadUrl || downloadResult.data.videoUrl;
      filename = downloadResult.data.safeTitle || downloadResult.data.title || 'video';
      if (!filename.includes('.')) {
        filename += '.mp4';
      }
    }
    
    if (!downloadUrl) {
      console.error('❌ No download URL available in API response');
      alert('No download URL received from the API. Please try again.');
      return;
    }

    console.log('🔗 Using download URL:', downloadUrl);
    console.log('📁 Filename:', filename);

    try {
      // Create download link
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      
      // Add to DOM temporarily
      link.style.display = 'none';
      document.body.appendChild(link);
      
      // Trigger download
      link.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
      }, 1000);
      
      console.log('✅ Download initiated successfully');
      
      // Also open in new tab as backup for Instagram CDN URLs
      if (downloadResult.data.platform === 'instagram') {
        setTimeout(() => {
          window.open(downloadUrl, '_blank');
        }, 500);
      }
      
    } catch (error) {
      console.error('❌ Download failed:', error);
      
      // Fallback: try to open in new tab
      try {
        window.open(downloadUrl, '_blank');
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError);
        
        // Last resort: copy URL to clipboard
        try {
          await navigator.clipboard.writeText(downloadUrl);
          alert('Download method failed, but the media URL has been copied to your clipboard. Paste it in a new tab to download.');
        } catch (clipboardError) {
          alert(`Download failed. Here's the direct media URL:\n\n${downloadUrl}`);
        }
      }
    }
  };

  // Helper function to get download URL for display purposes
  const getDisplayDownloadUrl = () => {
    if (!downloadResult?.data) return null;
    return downloadResult.data.downloadUrl || downloadResult.data.videoUrl;
  };

  // Helper function to check if URL is valid Instagram CDN URL
  const isValidInstagramUrl = (url: string | null | undefined): boolean => {
    if (!url) return false;
    return url.includes('fbcdn.net') || url.includes('instagram.f');
  };

  // Helper function to detect if URL is Instagram
  const isInstagramUrl = (url: string): boolean => {
    return url.toLowerCase().includes('instagram.com')
  }

  // Helper function to truncate long URLs for display
  const truncateUrl = (url: string, maxLength: number = 50): string => {
    if (url.length <= maxLength) return url
    return url.substring(0, maxLength - 3) + '...'
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
            The fastest, most reliable video downloader for TikTok, Instagram, Facebook & YouTube. 
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
          
          {/* Platform Selection - Updated to include YouTube */}
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
                {selectedPlatform === 'instagram' && (
                  <span className="block text-sm text-green-600 mt-2 font-medium">
                    ⚡ Instagram now uses fast GraphQL API (2-5 seconds)
                  </span>
                )}
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

                {/* Download Button */}
                <Button
                  onClick={handleDownload}
                  disabled={!url || isDownloading || backendStatus !== 'online'}
                  className="w-full py-4 sm:py-5 lg:py-6 text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 rounded-xl sm:rounded-2xl text-white border-0 shadow-2xl transition-all duration-300 hover:shadow-3xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoadingInfo ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="hidden sm:inline">
                        {isInstagramUrl(url) 
                          ? `Processing Instagram Video... ${processingTime}s` 
                          : 'Loading Video Info...'}
                      </span>
                      <span className="sm:hidden">
                        {isInstagramUrl(url) 
                          ? `Processing... ${processingTime}s` 
                          : 'Loading...'}
                      </span>
                    </>
                  ) : (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 sm:mr-3">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7,10 12,15 17,10"/>
                        <line x1="12" x2="12" y1="15" y2="3"/>
                      </svg>
                      <span className="hidden sm:inline">
                        {url ? '🚀 Get Video Info!' : '⚡ Paste URL to Continue'}
                      </span>
                      <span className="sm:hidden">
                        {url ? '🚀 Get Info!' : '⚡ Paste URL'}
                      </span>
                    </>
                  )}
                </Button>

                {/* Updated Download Results for New Instagram API */}
                {downloadResult && (
                  <div className={`mt-6 p-6 rounded-xl border-2 ${
                    downloadResult.success 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    {downloadResult.success && downloadResult.data ? (
                      <div className="space-y-6">
                        {/* Success Header */}
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-green-800">
                              {downloadResult.data.platform === 'instagram' 
                                ? `Instagram ${downloadResult.data.is_video ? 'Video' : 'Image'} Found!` 
                                : 'Video Found!'}
                            </h3>
                            <p className="text-green-600">
                              {downloadResult.data.platform === 'instagram' 
                                ? `Retrieved in ${downloadResult.method === 'graphql-api' ? '2-5' : '1-3'} seconds`
                                : 'Ready to download'}
                            </p>
                          </div>
                        </div>
                        
                        {/* Enhanced Media Information Card */}
                        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                          {/* Instagram Media Preview */}
                          {downloadResult.data.platform === 'instagram' && (
                            <div className="mb-6">
                              {downloadResult.data.is_video ? (
                                <video 
                                  src={downloadResult.data.video_url} 
                                  poster={downloadResult.data.thumbnail_src}
                                  controls 
                                  className="w-full max-w-md mx-auto rounded-lg border border-gray-200"
                                  style={{ maxHeight: '400px' }}
                                >
                                  Your browser does not support the video tag.
                                </video>
                              ) : (
                                <img 
                                  src={downloadResult.data.display_url} 
                                  alt="Instagram post"
                                  className="w-full max-w-md mx-auto rounded-lg border border-gray-200"
                                  style={{ maxHeight: '400px', objectFit: 'contain' }}
                                />
                              )}
                            </div>
                          )}
                          
                          {/* Title and Caption */}
                          <div className="mb-4">
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">
                              {downloadResult.data.platform === 'instagram' ? 'Caption' : 'Video Title'}
                            </h4>
                            <p className="text-gray-700 leading-relaxed">
                              {downloadResult.data.caption || downloadResult.data.title || 'No caption available'}
                            </p>
                          </div>
                          
                          {/* Instagram Creator Info */}
                          {downloadResult.data.platform === 'instagram' && downloadResult.data.owner && (
                            <div className="mb-6">
                              <h4 className="text-lg font-semibold text-gray-900 mb-3">Creator</h4>
                              <div className="flex items-center space-x-4">
                                <img 
                                  src={downloadResult.data.owner.profile_pic_url} 
                                  alt={`@${downloadResult.data.owner.username}`}
                                  className="w-16 h-16 rounded-full border-2 border-gray-200"
                                  onError={(e) => {
                                    e.currentTarget.src = 'https://via.placeholder.com/64x64/gray/white?text=IG';
                                  }}
                                />
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <p className="font-bold text-lg text-gray-900">
                                      {downloadResult.data.owner.full_name}
                                    </p>
                                    {downloadResult.data.owner.is_verified && (
                                      <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                      </svg>
                                    )}
                                  </div>
                                  <p className="text-gray-600 text-base">@{downloadResult.data.owner.username}</p>
                                  <p className="text-sm text-gray-500 mt-1">
                                    {downloadResult.data.owner.follower_count?.toLocaleString()} followers • {downloadResult.data.owner.post_count?.toLocaleString()} posts
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Instagram Statistics */}
                          {downloadResult.data.platform === 'instagram' && (
                            <div className="mb-6">
                              <h4 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h4>
                              
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {downloadResult.data.like_count !== undefined && (
                                  <div className="text-center bg-red-50 p-4 rounded-lg">
                                    <div className="text-2xl font-bold text-red-600">
                                      {downloadResult.data.like_count.toLocaleString()}
                                    </div>
                                    <div className="text-sm text-red-800 font-medium mt-1">
                                      ❤️ Likes
                                    </div>
                                  </div>
                                )}
                                
                                {downloadResult.data.comment_count !== undefined && (
                                  <div className="text-center bg-blue-50 p-4 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600">
                                      {downloadResult.data.comment_count.toLocaleString()}
                                    </div>
                                    <div className="text-sm text-blue-800 font-medium mt-1">
                                      💬 Comments
                                    </div>
                                  </div>
                                )}
                                
                                {downloadResult.data.video_view_count !== undefined && (
                                  <div className="text-center bg-green-50 p-4 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">
                                      {downloadResult.data.video_view_count.toLocaleString()}
                                    </div>
                                    <div className="text-sm text-green-800 font-medium mt-1">
                                      👀 Views
                                    </div>
                                  </div>
                                )}
                                
                                {downloadResult.data.video_duration !== undefined && (
                                  <div className="text-center bg-purple-50 p-4 rounded-lg">
                                    <div className="text-2xl font-bold text-purple-600">
                                      {downloadResult.data.video_duration.toFixed(1)}s
                                    </div>
                                    <div className="text-sm text-purple-800 font-medium mt-1">
                                      ⏱️ Duration
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {/* Instagram Music Info */}
                          {downloadResult.data.platform === 'instagram' && downloadResult.data.clips_music_attribution_info && (
                            <div className="mb-6">
                              <h4 className="text-lg font-semibold text-gray-900 mb-3">Music</h4>
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="font-medium text-gray-800">
                                  🎵 {downloadResult.data.clips_music_attribution_info.song_name}
                                </p>
                                <p className="text-gray-600 text-sm mt-1">
                                  by {downloadResult.data.clips_music_attribution_info.artist_name}
                                </p>
                                {downloadResult.data.clips_music_attribution_info.uses_original_audio && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-2">
                                    Original Audio
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {/* Carousel Items */}
                          {downloadResult.data.platform === 'instagram' && downloadResult.data.sidecar && downloadResult.data.sidecar.length > 0 && (
                            <div className="mb-6">
                              <h4 className="text-lg font-semibold text-gray-900 mb-3">
                                Carousel Items ({downloadResult.data.sidecar.length})
                              </h4>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {downloadResult.data.sidecar.map((item, index) => (
                                  <div key={index} className="relative group">
                                    {item.is_video ? (
                                      <video 
                                        src={item.video_url} 
                                        poster={item.thumbnail_src}
                                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                                      />
                                    ) : (
                                      <img 
                                        src={item.display_url} 
                                        alt={`Carousel item ${index + 1}`}
                                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                                      />
                                    )}
                                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                                      <button 
                                        onClick={() => {
                                          const link = document.createElement('a');
                                          link.href = item.is_video ? item.video_url! : item.display_url;
                                          link.download = `${downloadResult.data?.owner?.username}_${downloadResult.data?.shortcode}_${index + 1}.${item.is_video ? 'mp4' : 'jpg'}`;
                                          link.click();
                                        }}
                                        className="bg-white text-gray-800 px-3 py-1 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors"
                                      >
                                        📥 Download
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Technical Info */}
                          {downloadResult.data.platform === 'instagram' && (
                            <div className="mb-4 space-y-2 text-sm">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <span className="font-medium text-gray-700">Post ID:</span>
                                  <span className="ml-2 text-gray-600 font-mono">{downloadResult.data.shortcode}</span>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-700">Type:</span>
                                  <span className="ml-2 text-gray-600">{downloadResult.data.product_type || (downloadResult.data.is_video ? 'Video' : 'Image')}</span>
                                </div>
                                {downloadResult.data.dimensions && (
                                  <div>
                                    <span className="font-medium text-gray-700">Dimensions:</span>
                                    <span className="ml-2 text-gray-600">{downloadResult.data.dimensions.width} × {downloadResult.data.dimensions.height}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Enhanced Download Button */}
                        <div className="text-center">
                          <div className="space-y-3">
                            <button
                              onClick={handleDownloadClick}
                              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                            >
                              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Download {downloadResult.data.platform === 'instagram' 
                                ? `Instagram ${downloadResult.data.is_video ? 'Video' : 'Image'}` 
                                : 'Video'}
                            </button>
                            
                            {downloadResult.data.platform === 'instagram' && (
                              <div className="space-y-2">
                                <p className="text-sm text-green-600 flex items-center justify-center">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                                  </svg>
                                   High Quality • No Watermark
                                </p>
                                <p className="text-xs text-gray-500">
                                  Direct download from Instagram CDN
                                </p>
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-3">
                            High Quality • No Watermark • Fast Download
                          </p>
                        </div>
                      </div>
                    ) : (
                      // Error State
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-red-800">Download Failed</h3>
                          <p className="text-red-600">{downloadResult.error}</p>
                          {downloadResult.retryAfter && (
                            <p className="text-sm text-red-500 mt-1">
                              Please wait {downloadResult.retryAfter} before trying again.
                            </p>
                          )}
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
                description: "Find your favorite video on TikTok, Instagram, Facebook, or YouTube. Copy the video URL from your browser or app.",
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
                title: "Paste & Get Info",
                description: "Paste the URL in our downloader and we'll instantly fetch video information, statistics, and prepare your download.",
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
                    <rect x="3" y="3" width="18" height="14" rx="2" ry="2"></rect>
                    <path d="M7 7h.01M7 11h6"></path>
                  </svg>
                ),
                color: "from-blue-400 to-cyan-500"
              },
              {
                title: "No Watermarks",
                description: "Download videos without any watermarks or branding. Get clean, original content.",
                icon: (
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-12 sm:h-12">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                ),
                color: "from-green-400 to-emerald-500"
              },
              {
                title: "100% Free",
                description: "No hidden fees, no subscriptions. Enjoy unlimited downloads completely free.",
                icon: (
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-12 sm:h-12">
                    <path d="M5 12l7 7 7-7M5 5l7 7 7-7"></path>
                  </svg>
                ),
                color: "from-purple-400 to-fuchsia-500"
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 backdrop-blur-sm border border-white/20">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">{feature.title}</h3>
                <p className="text-white/80 leading-relaxed text-base sm:text-lg">
                  {feature.description}
                </p>
              </div>
            ))}
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
                description: "Find your favorite video on TikTok, Instagram, Facebook, or YouTube. Copy the video URL from your browser or app.",
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
                title: "Paste & Get Info",
                description: "Paste the URL in our downloader and we'll instantly fetch video information, statistics, and prepare your download.",
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
    </div>
  )
}

export default HomePage