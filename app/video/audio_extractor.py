import subprocess
import os


class AudioExtractor:

    def __init__(self, output_dir="extracted_audio"):
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)

    def extract_audio(self, video_path: str):
        output_path = os.path.join(
            self.output_dir,
            os.path.splitext(os.path.basename(video_path))[0] + ".wav"
        )

        command = [
            "ffmpeg",
            "-i", video_path,
            "-vn",
            "-acodec", "pcm_s16le",
            "-ar", "16000",
            "-ac", "1",
            output_path
        ]

        subprocess.run(command, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

        return output_path
