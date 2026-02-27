import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

try:
    print(f"Supabase URL: {supabase_url}")
    print("Checking Supabase connection and table 'payment_details'...")
    response = supabase.table("payment_details").select("*").limit(1).execute()
    print("SUCCESS: Table 'payment_details' exists and is accessible.")
    print(f"Data sample: {response.data}")
except Exception as e:
    print("FAILURE: Could not access 'payment_details' table.")
    print(f"Error Type: {type(e).__name__}")
    print(f"Error Message: {str(e)}")
