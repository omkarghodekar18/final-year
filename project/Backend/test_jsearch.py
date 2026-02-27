import os
import requests
from dotenv import load_dotenv
import json

load_dotenv()

JSEARCH_API_KEY = os.getenv("JSEARCH_API_KEY")
JSEARCH_URL = "https://jsearch.p.rapidapi.com/search"

headers = {
    "X-RapidAPI-Key": JSEARCH_API_KEY,
    "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
}

params = {
    "query": "software engineer fresher",
    "page": "1",
    "num_pages": "1",
    "country": "in",
    "date_posted": "month",
}

response = requests.get(JSEARCH_URL, headers=headers, params=params)
if response.status_code == 200:
    data = response.json().get("data", [])
    if data:
        # print first job keys to see what's available
        print(json.dumps(list(data[0].keys()), indent=2))
        
        # print specific fields related to expiration
        print("job_is_expired:", data[0].get("job_is_expired"))
        print("job_offer_expiration_datetime_utc:", data[0].get("job_offer_expiration_datetime_utc"))
else:
    print("Error:", response.text)
