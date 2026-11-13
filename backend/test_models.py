import os
import urllib.request
import json
from dotenv import load_dotenv

load_dotenv()
key = os.getenv("GEMINI_API_KEY")
req = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models?key={key}")
try:
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        models = [m['name'] for m in data.get('models', []) if 'generateContent' in m.get('supportedGenerationMethods', [])]
        print(", ".join(models))
except urllib.error.HTTPError as e:
    print(f"Error: {e}")
    print(e.read().decode())
except Exception as e:
    print(f"Error: {e}")
