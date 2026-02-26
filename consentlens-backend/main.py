import os
from fastapi import FastAPI, Body
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Supabase
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

from ai_router import analyze_policy_with_ai

@app.post("/analyze")
def analyze_policy(policy: dict = Body(...)):

    text = policy.get("text", "")
    user_id = policy.get("user_id")
    site_url = policy.get("site_url", "Unknown Site")

    if not text or len(text.strip()) < 50:
        return {
            "score": 0,
            "decision": "Unable to Analyze",
            "reasons": ["Policy content insufficient"]
        }

    ai_result = analyze_policy_with_ai(text)

    # Use AI provided safety score or fallback to 100
    score = ai_result.get("safety_score", 100)
    score = max(0, min(score, 100))

    if score >= 70:
        decision = "Proceed Safely"
    elif score >= 40:
        decision = "Proceed with Caution"
    else:
        decision = "Avoid"

    # Save to Supabase if user_id is present
    if user_id:
        try:
            supabase.table("scans").insert({
                "user_id": user_id,
                "site_url": site_url,
                "risk_score": score,
                "decision": decision,
                "reasons": ai_result.get("reasons", [])
            }).execute()
        except Exception as e:
            print("Supabase Error:", str(e))

    # Return full rich result for extension/UI to consume
    response = {
        "score": score,
        "decision": decision,
        **ai_result
    }
    return response