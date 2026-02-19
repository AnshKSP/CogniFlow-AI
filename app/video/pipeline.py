from app.video.downloader import YouTubeDownloader
from app.video.audio_extractor import AudioExtractor
from app.video.transcriber import Transcriber


class VideoPipeline:

    def __init__(self):
        self.downloader = YouTubeDownloader()
        self.audio_extractor = AudioExtractor()
        self.transcriber = Transcriber(model_size="base")

    def process_youtube(self, url: str):
        video_path = self.downloader.download_audio(url)
        audio_path = self.audio_extractor.extract_audio(video_path)
        transcript = self.transcriber.transcribe(audio_path)
        return transcript

    def process_uploaded_video(self, video_path: str):
        audio_path = self.audio_extractor.extract_audio(video_path)
        transcript = self.transcriber.transcribe(audio_path)
        return transcript
