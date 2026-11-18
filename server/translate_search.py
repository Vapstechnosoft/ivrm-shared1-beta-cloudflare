import sys
import json
import unicodedata
from googletrans import Translator
from langdetect import detect

translator = Translator()

def translate_to_english_if_needed(text: str) -> str:
    try:
        # Normalize Unicode (FIX)
        text = unicodedata.normalize("NFC", text)

        # Direct Suggestion
        if text and text[0].isascii() and text[0].isalpha():
            return text

        lang = detect(text)
        if lang != "en":
            translated = translator.translate(text, dest="en").text
            return translated
        return text

    except Exception as e:
        return text

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"text": ""}))
        sys.exit(0)
    
    raw_input = sys.argv[1]
    translated = translate_to_english_if_needed(raw_input)
    print(json.dumps({"text": translated}, default=str))
