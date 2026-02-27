import os
from fastapi import FastAPI, Body
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

class CardDetail(BaseModel):
    cardholder_name: str
    card_number: str
    expiry_date: str
    cvv: str
    site_url: str

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi import Request
@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"Incoming request: {request.method} {request.url.path}")
    response = await call_next(request)
    return response

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

    # Save scan history to 'scans' table
    try:
        scan_data = {
            "user_id": user_id,
            "site_url": site_url,
            "risk_score": score,
            "decision": decision,
            "reasons": ai_result.get("reasons", [])
        }
        scan_response = supabase.table("scans").insert(scan_data).execute()
        
        # If we successfully created a scan record, save the full text to 'policy_content'
        # We try to link it if the scans table returns an ID
        scan_id = None
        if scan_response.data and len(scan_response.data) > 0:
            scan_id = scan_response.data[0].get("id")

        supabase.table("policy_content").insert({
            "site_url": site_url,
            "full_text": text,
            "scan_id": scan_id
        }).execute()
        
    except Exception as e:
        print("Supabase Storage Error:", str(e))

    # Return full rich result for extension/UI to consume
    response = {
        "score": score,
        "decision": decision,
        **ai_result
    }
    return response

@app.post("/save-card")
def save_card_detail(card: CardDetail):
    try:
        data = card.dict()
        print(f"DEBUG: Attempting to save card data: {data}")
        response = supabase.table("payment_details").insert(data).execute()
        print(f"DEBUG: Supabase response: {response}")
        return {"success": True}
    except Exception as e:
        print("Save Card Error:", str(e))
        return {"success": False, "error": str(e)}
