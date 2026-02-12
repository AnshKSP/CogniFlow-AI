import easyocr

class ImageLoader:
    def __init__(self):
        self.reader = easyocr.Reader(['en'], gpu=False)

    def extract_text(self, image_path: str):
        results = self.reader.readtext(image_path)

        extracted_text = ""
        for (_, text, _) in results:
            extracted_text += text + " "

        return extracted_text.strip()
