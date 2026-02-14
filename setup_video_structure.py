import os

base = os.path.join("app", "video")
os.makedirs(base, exist_ok=True)

files = [
    "__init__.py",
    "downloader.py",
    "audio_extractor.py",
    "pipeline.py"
]

for f in files:
    path = os.path.join(base, f)
    if not os.path.exists(path):
        open(path, "w").close()
        print("Created:", path)
    else:
        print("Exists:", path)

print("Video module structure ready.")
