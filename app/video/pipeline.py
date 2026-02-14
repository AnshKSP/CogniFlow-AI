from app.video.downloader import YouTubeDownloader
from app.video.audio_extractor import AudioExtractor


class VideoPipeline:

    def __init__(self):
        self.downloader = YouTubeDownloader()
        self.audio_extractor = AudioExtractor()

    def process_youtube(self, url: str):
        video_path = self.downloader.download_audio(url)
        audio_path = self.audio_extractor.extract_audio(video_path)
        return audio_path

    def process_uploaded_video(self, video_path: str):
        audio_path = self.audio_extractor.extract_audio(video_path)
        return audio_path
