"""
YouTubeDownloader - Downloads audio from YouTube videos using yt-dlp.
Optimized for fast processing with proper error handling.
"""
import yt_dlp
import os
import logging
from pathlib import Path

logger = logging.getLogger(__name__)


class YouTubeDownloader:
    """
    Downloads audio from YouTube videos using yt-dlp.
    """

    def __init__(self, output_dir: str = "video_downloads"):
        """
        Initialize YouTube downloader.
        
        Args:
            output_dir: Directory to save downloaded files
        """
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)

    def download_audio(self, url: str) -> str:
        """
        Download audio from YouTube URL.
        
        Args:
            url: YouTube video URL
            
        Returns:
            str: Path to downloaded audio/video file
            
        Raises:
            ValueError: If URL is invalid or download fails
        """
        if not url or not isinstance(url, str):
            raise ValueError("YouTube URL is required")
        
        if not url.startswith(("http://", "https://")):
            raise ValueError("Invalid URL format. Must start with http:// or https://")
        
        try:
            # Configure yt-dlp options for fast audio-only download
            ydl_opts = {
                'format': 'bestaudio/best',  # Best audio quality available
                'outtmpl': os.path.join(self.output_dir, '%(title)s.%(ext)s'),
                'quiet': True,                # Suppress output
                'no_warnings': True,          # Suppress warnings
                'extractaudio': False,        # Keep original format
                'noplaylist': True,           # Don't download playlists
            }
            
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                # Extract info first to validate URL
                try:
                    info = ydl.extract_info(url, download=False)
                except Exception as e:
                    logger.error(f"Failed to extract video info: {str(e)}")
                    raise ValueError(f"Invalid YouTube URL or video unavailable: {str(e)}")
                
                # Check if video is available
                if not info:
                    raise ValueError("Could not retrieve video information")
                
                # Download the video
                try:
                    ydl.download([url])
                except Exception as e:
                    logger.error(f"Failed to download video: {str(e)}")
                    raise ValueError(f"Failed to download video: {str(e)}")
                
                # Get the filename
                filename = ydl.prepare_filename(info)
                
                # Verify file exists
                if not os.path.exists(filename):
                    raise ValueError("Download completed but file not found")
                
                # Verify file is not empty
                if os.path.getsize(filename) == 0:
                    raise ValueError("Downloaded file is empty")
                
                return filename
        except yt_dlp.utils.DownloadError as e:
            logger.error(f"yt-dlp download error: {str(e)}")
            raise ValueError(f"Failed to download YouTube video: {str(e)}")
        except Exception as e:
            logger.error(f"Error downloading YouTube video: {str(e)}")
            raise ValueError(f"Failed to download YouTube video: {str(e)}")
