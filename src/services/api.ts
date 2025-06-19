const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://tiktokreels-backend.vercel.app/'  // Replace with your deployed backend URL
  : 'http://localhost:5000';

export interface VideoDownloadResponse {
  success: boolean;
  download_url?: string;
  video_info?: {
    title: string;
    author: string;
    duration: number;
    view_count: number;
    like_count: number;
    share_count: number;
  };
  error?: string;
  message?: string;
  platform?: string;
}

// Universal download function with auto-platform detection
export const downloadVideo = async (url: string): Promise<VideoDownloadResponse> => {
  try {
    console.log('📤 Sending download request for:', url);
    
    const response = await fetch(`${API_BASE_URL}/api/download`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('📥 Download response:', result);
    
    return result;
  } catch (error) {
    console.error('❌ Download error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Download failed'
    };
  }
};

export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    const data = await response.json();
    console.log('💚 Backend health:', data);
    return response.ok;
  } catch (error) {
    console.error('❌ Backend health check failed:', error);
    return false;
  }
};
