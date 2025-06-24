// API Configuration matching tiktokapis.md, youtubeapis.md, facebookapis.md, and NEW instagramapis.md specifications
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://tiktokreels-backend.vercel.app' // Update this to your production domain
  : 'http://localhost:3000';

const TIKTOK_API_URL = `${API_BASE_URL}/api/v1/tiktok`;
const YOUTUBE_API_URL = `${API_BASE_URL}/api/v1/youtube`;
const FACEBOOK_API_URL = `${API_BASE_URL}/api/v1/facebook/download`;
const INSTAGRAM_API_URL = `${API_BASE_URL}/api/v1/instagram`; // Updated Instagram GraphQL API

// Default headers as specified in the documentation
const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

// Updated interface to support new Instagram GraphQL API response structure
export interface VideoDownloadResponse {
  success: boolean;
  message?: string;
  method?: string;
  error?: string;
  retryAfter?: string;
  data?: {
    // Common fields
    downloadUrl?: string;
    videoUrl?: string;
    imageUrl?: string;
    id: string;
    title: string;
    type?: string;
    
    // NEW Instagram GraphQL API fields (as per updated instagramapis.md)
    __typename?: string;
    shortcode?: string;
    dimensions?: {
      height: number;
      width: number;
    };
    display_url?: string;
    has_audio?: boolean;
    video_url?: string;
    video_view_count?: number;
    video_play_count?: number;
    is_video?: boolean;
    caption?: string;
    is_paid_partnership?: boolean;
    location?: any;
    owner?: {
      id: string;
      username: string;
      full_name: string;
      profile_pic_url: string;
      is_verified: boolean;
      is_private: boolean;
      follower_count: number;
      following_count: number;
      post_count: number;
    };
    product_type?: string;
    video_duration?: number;
    thumbnail_src?: string;
    clips_music_attribution_info?: {
      artist_name: string;
      song_name: string;
      uses_original_audio: boolean;
      should_mute_audio: boolean;
      audio_id: string;
    };
    sidecar?: Array<{
      is_video: boolean;
      video_url?: string;
      display_url: string;
      thumbnail_src?: string;
    }>;
    like_count?: number;
    comment_count?: number;
    taken_at_timestamp?: number;
    accessibility_caption?: string;
    
    // Legacy fields for backward compatibility
    postId?: string;
    safeTitle?: string;
    url?: string;
    postUrl?: string;
    platform?: string;
    
    // TikTok specific fields
    author?: {
      uid?: string;
      username?: string;
      uniqueId?: string;
      nickname?: string;
      signature?: string;
      region?: string;
      avatarThumb?: string[];
      avatarMedium?: string[];
      avatar?: string;
      url?: string;
      name?: string;
      channel?: string;
      channelId?: string;
      thumbnail?: string;
    };
    statistics?: {
      playCount?: number;
      likeCount?: number;
      shareCount?: number;
      commentCount?: number;
      downloadCount?: number;
      views?: number;
      likes?: number;
      rating?: number;
    };
    music?: {
      title: string;
      url?: string;
    };
    createTime?: number;
    hashtags?: string[];
    isADS?: boolean;

    // YouTube specific fields
    description?: string;
    duration?: number;
    thumbnail?: string;
    uploadDate?: string;
    category?: string;
    format?: {
      quality: string;
      container: string;
      videoCodec: string;
      audioCodec: string;
      filesize: string;
    };
    originalUrlLength?: number;
    shortUrlLength?: number;
    compressionRatio?: string;
    directUrl?: string;

    // Facebook specific fields
    hd?: string;
    sd?: string;
    downloadUrlHD?: string;
    downloadUrlSD?: string;
    qualities?: {
      hd?: boolean;
      sd?: boolean;
    };
  };
}

// Platform detection function
const detectPlatform = (url: string): 'youtube' | 'tiktok' | 'instagram' | 'facebook' => {
  const lowerUrl = url.toLowerCase();
  
  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
    return 'youtube';
  } else if (lowerUrl.includes('tiktok.com')) {
    return 'tiktok';
  } else if (lowerUrl.includes('instagram.com')) {
    return 'instagram';
  } else if (lowerUrl.includes('facebook.com') || lowerUrl.includes('fb.watch')) {
    return 'facebook';
  } else {
    return 'tiktok';
  }
};

// Universal download function with auto-platform detection
export const downloadVideo = async (url: string): Promise<VideoDownloadResponse> => {
  try {
    const platform = detectPlatform(url);
    
    if (platform === 'youtube') {
      return await downloadYouTubeVideo(url);
    } else if (platform === 'facebook') {
      return await downloadFacebookVideo(url);
    } else if (platform === 'instagram') {
      return await downloadInstagramMedia(url);
    } else {
      return await downloadTikTokVideo(url);
    }
  } catch (error) {
    console.error('❌ Download error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Download failed'
    };
  }
};

// NEW Instagram GraphQL API function - Fast and reliable (2-5 seconds)
const downloadInstagramMedia = async (url: string): Promise<VideoDownloadResponse> => {
  try {
    console.log('📤 Fetching Instagram media data using GraphQL API for:', url);
    console.log('⚡ Using fast GraphQL method (2-5 seconds)...');
    
    // Use the new /media endpoint for full data
    const response = await fetch(`${INSTAGRAM_API_URL}/media?url=${encodeURIComponent(url)}`, {
      method: 'GET',
      headers: defaultHeaders
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || `HTTP error! status: ${response.status}`
      };
    }

    const data = await response.json();
    console.log('📥 Instagram GraphQL response:', data);
    
    if (data.success && data.data) {
      const mediaData = data.data;
      
      // Transform GraphQL response to our interface
      return {
        success: true,
        message: 'Instagram media retrieved successfully',
        method: 'graphql-api',
        data: {
          // Primary fields
          id: mediaData.shortcode || mediaData.id || 'instagram-media',
          title: mediaData.caption || `Instagram ${mediaData.is_video ? 'Video' : 'Image'} by @${mediaData.owner?.username}`,
          type: mediaData.is_video ? 'video' : 'image',
          
          // Download URLs
          downloadUrl: mediaData.is_video ? mediaData.video_url : mediaData.display_url,
          videoUrl: mediaData.video_url,
          imageUrl: mediaData.display_url,
          
          // Instagram GraphQL data (full structure)
          __typename: mediaData.__typename,
          shortcode: mediaData.shortcode,
          dimensions: mediaData.dimensions,
          display_url: mediaData.display_url,
          has_audio: mediaData.has_audio,
          video_url: mediaData.video_url,
          video_view_count: mediaData.video_view_count,
          video_play_count: mediaData.video_play_count,
          is_video: mediaData.is_video,
          caption: mediaData.caption,
          is_paid_partnership: mediaData.is_paid_partnership,
          location: mediaData.location,
          owner: mediaData.owner,
          product_type: mediaData.product_type,
          video_duration: mediaData.video_duration,
          thumbnail_src: mediaData.thumbnail_src,
          clips_music_attribution_info: mediaData.clips_music_attribution_info,
          sidecar: mediaData.sidecar,
          like_count: mediaData.like_count,
          comment_count: mediaData.comment_count,
          taken_at_timestamp: mediaData.taken_at_timestamp,
          accessibility_caption: mediaData.accessibility_caption,
          
          // Legacy compatibility fields
          postId: mediaData.shortcode,
          safeTitle: mediaData.owner?.username ? `${mediaData.owner.username}_${mediaData.shortcode}` : mediaData.shortcode,
          url: url,
          postUrl: `https://instagram.com/p/${mediaData.shortcode}`,
          platform: 'instagram',
          createTime: mediaData.taken_at_timestamp
        }
      };
    } else {
      return {
        success: false,
        error: data.error || 'No media data found. Post may be private or deleted.'
      };
    }
  } catch (error) {
    console.error('❌ Instagram GraphQL API error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch Instagram media'
    };
  }
};

// Alternative: Get just video URL (simple endpoint)
export const getInstagramVideoUrl = async (url: string): Promise<VideoDownloadResponse> => {
  try {
    console.log('📤 Getting Instagram video URL (simple method):', url);
    
    const response = await fetch(`${INSTAGRAM_API_URL}/video?url=${encodeURIComponent(url)}`, {
      method: 'GET',
      headers: defaultHeaders
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || `HTTP error! status: ${response.status}`
      };
    }

    const data = await response.json();
    console.log('📥 Instagram video URL response:', data);
    
    if (data.success !== false) {
      return {
        success: true,
        message: 'Instagram video URL retrieved successfully',
        method: 'graphql-simple',
        data: {
          id: 'instagram-video',
          title: 'Instagram Video',
          type: data.isVideo ? 'video' : 'image',
          downloadUrl: data.videoUrl,
          videoUrl: data.videoUrl,
          imageUrl: data.imageUrl,
          is_video: data.isVideo,
          platform: 'instagram'
        }
      };
    } else {
      return {
        success: false,
        error: data.error || 'Failed to get Instagram video URL'
      };
    }
  } catch (error) {
    console.error('❌ Instagram video URL fetch error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch Instagram video URL'
    };
  }
};

// TikTok download function
const downloadTikTokVideo = async (url: string): Promise<VideoDownloadResponse> => {
  try {
    console.log('📤 Sending TikTok download request for:', url);
    
    const response = await fetch(`${TIKTOK_API_URL}/download`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({ url })
    });

    const data = await response.json();
    console.log('📥 TikTok download response:', data);
    
    // Handle rate limiting (429 status code)
    if (response.status === 429) {
      return {
        success: false,
        error: data.message || 'Too many requests, please wait before trying again.',
        retryAfter: data.retryAfter
      };
    }

    // Handle other HTTP errors
    if (!response.ok) {
      return {
        success: false,
        error: data.message || `HTTP error! status: ${response.status}`
      };
    }

    return data;
  } catch (error) {
    console.error('❌ TikTok download error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Download failed'
    };
  }
};

// YouTube download function with info + download URL separation
const downloadYouTubeVideo = async (url: string): Promise<VideoDownloadResponse> => {
  try {
    console.log('📤 Sending YouTube download request for:', url);
    
    const response = await fetch(`${YOUTUBE_API_URL}/download`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({ url })
    });

    const data = await response.json();
    console.log('📥 YouTube download response:', data);
    
    // Handle rate limiting (429 status code)
    if (response.status === 429) {
      return {
        success: false,
        error: data.message || 'Too many requests, please wait before trying again.',
        retryAfter: data.retryAfter
      };
    }

    // Handle other HTTP errors
    if (!response.ok) {
      return {
        success: false,
        error: data.message || `HTTP error! status: ${response.status}`
      };
    }

    return data;
  } catch (error) {
    console.error('❌ YouTube download error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Download failed'
    };
  }
};

// Facebook download function - Updated to use direct API as per facebookapis.md
const downloadFacebookVideo = async (url: string): Promise<VideoDownloadResponse> => {
  try {
    console.log('📤 Sending Facebook download request to:', FACEBOOK_API_URL);
    console.log('📤 Facebook URL:', url);
    
    const response = await fetch(FACEBOOK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ url })
    });

    console.log('📥 Facebook API response status:', response.status);
    
    // Handle service unavailable (503 status code)
    if (response.status === 503) {
      return {
        success: false,
        error: 'Facebook video service temporarily unavailable. The API service is currently down. Please try again later.'
      };
    }

    const data = await response.json();
    console.log('📥 Facebook download response:', data);
    
    // Handle rate limiting (429 status code)
    if (response.status === 429) {
      return {
        success: false,
        error: data.message || 'Too many requests, please wait before trying again.',
        retryAfter: data.retryAfter
      };
    }

    // Handle other HTTP errors
    if (!response.ok) {
      return {
        success: false,
        error: data.message || `HTTP error! status: ${response.status}`
      };
    }

    // Transform the Facebook API response to match our interface
    if (data.success && data.data) {
      return {
        success: true,
        message: data.message,
        data: {
          id: data.data.url || 'facebook-video',
          title: data.data.title || 'Facebook Video',
          safeTitle: data.data.safeTitle || 'Facebook_Video',
          downloadUrl: data.data.hd || data.data.sd || data.data.downloadUrl,
          hd: data.data.hd,
          sd: data.data.sd,
          downloadUrlHD: data.data.downloadUrlHD || data.data.hd,
          downloadUrlSD: data.data.downloadUrlSD || data.data.sd,
          qualities: data.data.qualities || {
            hd: !!data.data.hd,
            sd: !!data.data.sd
          }
        }
      };
    }

    return data;
  } catch (error) {
    console.error('❌ Facebook download error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Facebook video download failed'
    };
  }
};

// YouTube info-only function (faster)
export const getYouTubeInfo = async (url: string): Promise<VideoDownloadResponse> => {
  try {
    console.log('📤 Sending YouTube info request for:', url);
    
    const response = await fetch(`${YOUTUBE_API_URL}/info`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({ url })
    });

    const data = await response.json();
    console.log('📥 YouTube info response:', data);
    
    if (!response.ok) {
      return {
        success: false,
        error: data.message || `HTTP error! status: ${response.status}`
      };
    }

    return data;
  } catch (error) {
    console.error('❌ YouTube info fetch failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Info fetch failed'
    };
  }
};

// Updated two-step download for Instagram
export const downloadVideoTwoStep = async (url: string): Promise<{
  infoResult: VideoDownloadResponse;
  downloadResult?: VideoDownloadResponse;
}> => {
  try {
    const platform = detectPlatform(url);
    
    if (platform === 'youtube') {
      // Step 1: Get video info quickly
      const infoResult = await getYouTubeInfo(url);
      
      return {
        infoResult,
        downloadResult: undefined // Will be filled later when user clicks download
      };
    } else {
      // For TikTok/Instagram/Facebook, use single request (they return download URLs immediately)
      let result: VideoDownloadResponse;
      
      if (platform === 'facebook') {
        result = await downloadFacebookVideo(url);
      } else if (platform === 'instagram') {
        // Use the new fast GraphQL method
        result = await downloadInstagramMedia(url);
      } else {
        result = await downloadTikTokVideo(url);
      }
      
      return {
        infoResult: result,
        downloadResult: result
      };
    }
  } catch (error) {
    console.error('❌ Two-step download error:', error);
    return {
      infoResult: {
        success: false,
        error: error instanceof Error ? error.message : 'Download failed'
      }
    };
  }
};

// Updated health check
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    console.log('🔍 Checking backend health...');
    
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(5000)
    });
    
    console.log('📊 Backend health check status:', response.status);
    return response.ok;
  } catch (error) {
    console.error('❌ Backend health check failed:', error);
    return false;
  }
};

// Get API usage statistics
export const getApiStats = async () => {
  try {
    const response = await fetch(`${TIKTOK_API_URL}/stats`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('📊 API Stats:', data);
      return data;
    } else {
      console.warn('⚠️ Failed to fetch API stats');
      return null;
    }
  } catch (error) {
    console.error('❌ API stats fetch failed:', error);
    return null;
  }
};
