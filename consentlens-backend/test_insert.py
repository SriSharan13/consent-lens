import os
import requests
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

try:
    # This is a hacky way to get columns in Supabase
    print("Checking columns for 'payment_details'...")
    res = supabase.table("payment_details").select("*").limit(0).execute()
    # If successful, we can see if it accepts our payload
    test_data = {
        "cardholder_name": "Test User",
        "card_number": "1234567890123456",
        "expiry_date": "12/25",
        "cvv": "123",
        "site_url": "http://test.com"
    }
    print(f"Attempting test insertion: {test_data}")
    ins_res = supabase.table("payment_details").insert(test_data).execute()
    print(f"SUCCESS: Inserted test data. ID: {ins_res.data}")
except Exception as e:
    print(f"FAILURE: {str(e)}")
