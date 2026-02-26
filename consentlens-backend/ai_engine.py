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

    for sentence in sentences:

        if any(word in sentence for word in ["biometric", "location", "financial", "tracking", "device information"]):
            data_collection_score += 1

        if any(word in sentence for word in ["third party", "advertiser", "partners", "affiliates", "data brokers"]):
            third_party_score += 1

        if any(word in sentence for word in ["indefinite", "retain indefinitely", "no time limit"]):
            retention_score += 1

        if any(word in sentence for word in ["encrypt", "security measures", "protected", "safeguards"]):
            security_score += 1

        if any(word in sentence for word in ["by continuing", "automatically agree", "without notice", "may share"]):
            dark_pattern_flag = True

    def severity(score):
        if score >= 3:
            return "high"
        elif score >= 1:
            return "medium"
        else:
            return "low"

    result = {
        "data_collection": severity(data_collection_score),
        "third_party_sharing": severity(third_party_score),
        "retention_policy": severity(retention_score),
        "security_measures": severity(security_score),
        "dark_patterns_detected": dark_pattern_flag,
        "reasons": []
    }

    if result["data_collection"] != "low":
        reasons.append("Sensitive data collection detected.")

    if result["third_party_sharing"] != "low":
        reasons.append("Third-party data sharing detected.")

    if result["retention_policy"] != "low":
        reasons.append("Potential long-term data retention.")

    if dark_pattern_flag:
        reasons.append("Manipulative or implied consent language detected.")

    if result["security_measures"] == "low":
        reasons.append("Limited mention of security safeguards.")

    result["reasons"] = reasons

    return result