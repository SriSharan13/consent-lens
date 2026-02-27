import os
import json
import re
from google import genai
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def analyze_with_gemini(text: str):

    prompt = f"""
You are "ConsentLens AI", a world-class privacy policy analyst. 
Analyze the provided privacy policy and return a detailed, structured JSON response.

Required JSON Structure:
{{
  "summary": "Short 2-sentence overview",
  "is_financial_product": boolean,
  "autopay_detected": boolean,
  "financial_terms": {{
    "apr": "e.g. 24.99%",
    "annual_fee": "e.g. $95",
    "late_fee": "e.g. $40"
  }},
  "categories": {{
    "data_collected": {{ "rank": "low/medium/high", "details": "what they collect" }},
    "sensitive_data": {{ "rank": "low/medium/high", "details": "location, biometrics, etc" }},
    "third_party_sharing": {{ "rank": "low/medium/high", "details": "who gets it" }},
    "retention_duration": {{ "rank": "low/medium/high", "details": "how long they keep it" }},
    "user_rights": {{ "rank": "low/medium/high", "details": "access, delete, port" }},
    "tracking_ads": {{ "rank": "low/medium/high", "details": "pixel, cookies, etc" }}
  }},
  "impact_translations": [
    {{ "legal_text": "text from policy", "real_world_impact": "human-readable consequence" }}
  ],
  "safety_score": 0-100,
  "risky_clauses": [
    {{ "clause": "exact quote", "risk_level": "high/medium", "evidence": "why it is risky" }}
  ],
  "what_if_simulator": [
    {{ "permission": "e.g. Location", "if_rejected": "impact on app functionality" }}
  ],
  "dark_patterns": [
    {{ "type": "vague wording/hidden clause/etc", "evidence": "quote or description" }}
  ],
  "personalized_advice": {{
    "privacy_first": "advice for paranoid users",
    "balanced": "advice for average users",
    "convenience_first": "advice for users who just want it to work"
  }},
  "reasons": ["top 3 summary points - if financial, mention APR and Fees here"]
}}

Special Instructions:
1. Detect if this is a Credit Card Agreement or a Subscription Service.
2. If Credit Card: Extract APR, Annual Fees, and Late Fees.
3. If Subscription/Auto-pay: Identify if 'automatic renewal' or 'automatic billing' is mentioned. Set "autopay_detected" to true.
4. Adjust safety_score: Deduct points for high APR (>25%), hidden annual fees, or aggressive auto-renewal terms.


Privacy Policy Text:
{text[:4000]}
"""

    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt,
    )

    raw_output = response.text
    print("Gemini RAW OUTPUT:", raw_output)

    # Clean up JSON if it contains markdown markers
    clean_json = re.sub(r'```json\n?|\n?```', '', raw_output).strip()
    
    try:
        return json.loads(clean_json)
    except Exception as e:
        # Fallback regex if direct parsing fails
        json_match = re.search(r'\{.*\}', raw_output, re.DOTALL)
        if json_match:
            return json.loads(json_match.group(0))
        raise Exception(f"Failed to parse Gemini response: {str(e)}")