from gemini_engine import analyze_with_gemini
from ai_engine import classify_policy


def analyze_policy_with_ai(text: str):

    try:
        # Try Gemini first
        gemini_result = analyze_with_gemini(text)

        # Validate required keys
        required_keys = [
            "data_collection",
            "third_party_sharing",
            "retention_policy",
            "security_measures",
            "dark_patterns_detected",
            "reasons"
        ]

        if all(key in gemini_result for key in required_keys):
            print("Using Gemini AI")
            return gemini_result
        else:
            raise Exception("Gemini output missing fields")

    except Exception as e:
        print("Gemini ERROR:", str(e))
        print("Falling back to local AI.")
        return classify_policy(text)