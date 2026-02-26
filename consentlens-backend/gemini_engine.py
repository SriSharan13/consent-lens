import os
import json
import re
from google import genai
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def analyze_with_gemini(text: str):

    prompt = f"""
You are a strict privacy policy analysis engine.

Return ONLY valid JSON.
Do NOT include markdown.
Do NOT include explanation.
Do NOT include backticks.

Required JSON format:
{{
  "data_collection": "low/medium/high",
  "third_party_sharing": "low/medium/high",
  "retention_policy": "low/medium/high",
  "security_measures": "low/medium/high",
  "dark_patterns_detected": true/false,
  "reasons": ["list of main privacy risks"]
}}

Privacy Policy:
{text[:3000]}
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
    )

    raw_output = response.text
    print("Gemini RAW OUTPUT:", raw_output)

    json_match = re.search(r'\{.*\}', raw_output, re.DOTALL)

    if not json_match:
        raise Exception("No JSON found in Gemini response")

    return json.loads(json_match.group(0))