import re

def classify_policy(text: str):

    text = text.lower()
    sentences = re.split(r'[.!?]\s+', text)

    data_collection_score = 0
    third_party_score = 0
    retention_score = 0
    security_score = 0
    dark_pattern_flag = False

    reasons = []

    score_deductions = []

    for sentence in sentences:
        if any(word in sentence for word in ["biometric", "location", "financial", "tracking", "device information"]):
            data_collection_score += 1
            if len(score_deductions) < 5 and not any(d["term"] in sentence for d in score_deductions):
                term_found = next(word for word in ["biometric", "location", "financial", "tracking", "device information"] if word in sentence)
                score_deductions.append({"term": term_found, "impact": -5, "reason": "Mentions sensitive data collection"})

        if any(word in sentence for word in ["third party", "advertiser", "partners", "affiliates", "data brokers"]):
            third_party_score += 1
            if len(score_deductions) < 5 and not any(d["term"] in sentence for d in score_deductions):
                term_found = next(word for word in ["third party", "advertiser", "partners", "affiliates", "data brokers"] if word in sentence)
                score_deductions.append({"term": term_found, "impact": -5, "reason": "Sells or shares data to third parties"})

        if any(word in sentence for word in ["indefinite", "retain indefinitely", "no time limit"]):
            retention_score += 1
            if len(score_deductions) < 5 and not any(d["term"] in sentence for d in score_deductions):
                term_found = next(word for word in ["indefinite", "retain indefinitely", "no time limit"] if word in sentence)
                score_deductions.append({"term": term_found, "impact": -5, "reason": "Keeps your data indefinitely"})

        if any(word in sentence for word in ["encrypt", "security measures", "protected", "safeguards"]):
            security_score += 1

        if any(word in sentence for word in ["by continuing", "automatically agree", "without notice", "may share"]):
            dark_pattern_flag = True
            if not any(d["term"] == "automatically agree" for d in score_deductions):
               term_found = next(word for word in ["by continuing", "automatically agree", "without notice", "may share"] if word in sentence)
               score_deductions.append({"term": term_found, "impact": -10, "reason": "Implied auto-consent tracking"})

    def severity(score):
        if score >= 3:
            return "high"
        elif score >= 1:
            return "medium"
        else:
            return "low"

    # Populate reasons based on initial scores
    if severity(data_collection_score) != "low":
        reasons.append("Sensitive data collection detected.")

    if severity(third_party_score) != "low":
        reasons.append("Third-party data sharing detected.")

    if severity(retention_score) != "low":
        reasons.append("Potential long-term data retention.")

    if dark_pattern_flag:
        reasons.append("Manipulative or implied consent language detected.")

    if severity(security_score) == "low":
        reasons.append("Limited mention of security safeguards.")

    result = {
        "summary": "Local analysis performed (Gemini offline).",
        "categories": {
            "data_collected": { "rank": severity(data_collection_score), "details": "Detected based on keyword matching." },
            "sensitive_data": { "rank": "medium" if data_collection_score > 1 else "low", "details": "Potential sensitive data points found." },
            "third_party_sharing": { "rank": severity(third_party_score), "details": "Mention of third parties or affiliates found." },
            "retention_duration": { "rank": severity(retention_score), "details": "Mention of data retention periods found." },
            "user_rights": { "rank": "medium", "details": "General mention of user rights found." },
            "tracking_ads": { "rank": "medium" if "cookie" in text else "low", "details": "Tracking technologies mentioned." }
        },
        "impact_translations": [
            { "legal_text": "May share with affiliates", "real_world_impact": "Your data might be used for cross-platform marketing." }
        ],
        "safety_score": 100 - (data_collection_score * 10 + third_party_score * 10 + (20 if dark_pattern_flag else 0)),
        "score_deductions": score_deductions,
        "risky_clauses": [],
        "what_if_simulator": [
            { "permission": "Tracking", "if_rejected": "May limit personalized content." }
        ],
        "dark_patterns": [],
        "personalized_advice": {
            "privacy_first": "Consider limiting data sharing in settings.",
            "balanced": "Accept necessary cookies only.",
            "convenience_first": "Accept all for best experience."
        },
        "reasons": reasons
    }

    if dark_pattern_flag:
        result["dark_patterns"].append({ "type": "Implied Consent", "evidence": "Language suggests automatic agreement." })

    return result