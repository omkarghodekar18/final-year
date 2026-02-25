import sys
import os

sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

print("Starting job fetch...")
try:
    from utils.job_fetcher import fetch_jobs
    fetch_jobs()
    print("Job fetch completed successfully.")
except Exception as e:
    import traceback
    traceback.print_exc()
    print(f"Error occurred: {e}")
