import sys
import os
import json

# Python 3.14 compatibility patch for googletrans
# This fixes the 'ModuleNotFoundError: No module named cgi' error
if sys.version_info >= (3, 14):
    import types
    cgi = types.ModuleType('cgi')
    cgi.escape = lambda x: x # Minimal mock
    sys.modules['cgi'] = cgi

import speech_recognition as sr
from googletrans import Translator

def process_voice(audio_file_path):
    recognizer = sr.Recognizer()
    translator = Translator()

    try:
        # Configuration for better recognition
        recognizer.energy_threshold = 300 
        recognizer.dynamic_energy_threshold = True
        
        if not os.path.exists(audio_file_path):
            return {"success": False, "error": f"File not found: {audio_file_path}"}
            
        with sr.AudioFile(audio_file_path) as source:
            # Adjust for ambient noise within the file
            recognizer.adjust_for_ambient_noise(source, duration=0.5)
            audio = recognizer.record(source)
            
            # Multi-pass Strategy: Try common languages one by one
            target_languages = ['en-IN', 'kn-IN', 'hi-IN']
            spoken_text = None
            detected_lang_code = "auto"

            for lang in target_languages:
                try:
                    # Request recognition for this specific language
                    text = recognizer.recognize_google(audio, language=lang)
                    if text and len(text.strip()) > 0:
                        spoken_text = text
                        detected_lang_code = lang
                        break # Successfully recognized!
                except Exception:
                    continue # Try next language

            if not spoken_text:
                return {"success": False, "error": "Speech not recognized."}
            
            # Translate from detected language to english using googletrans
            translation = translator.translate(spoken_text, src='auto', dest='en')
            
            return {
                "success": True,
                "original_text": spoken_text,
                "text": translation.text,
                "detected_lang": translation.src
            }

    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    # Silence any unexpected output
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except AttributeError:
        pass
    
    # Check arguments
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "No audio file provided"}))
        sys.exit(1)

    file_path = sys.argv[1]
    result = process_voice(file_path)
    
    # Use markers to help Node.js extract the JSON if something else prints
    print(f"RESULTJSON:{json.dumps(result)}:ENDJSON")
