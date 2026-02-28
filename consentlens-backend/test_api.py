import requests
import json
url = "http://127.0.0.1:8000/analyze"
data = { "text": "We will sell your data. We have an APR of 30%. You must pay an annual fee. If you cancel, late fee is $20. Auto-renews daily.", "site_url": "test" }
r = requests.post(url, json=data)
print(json.dumps(r.json(), indent=2))
