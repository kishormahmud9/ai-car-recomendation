import os
import sys
import json
import requests
import tempfile
from dotenv import load_dotenv

# Add current and parent directories to path
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
sys.path.append(current_dir)
sys.path.append(project_root)

# Load environment variables
load_dotenv()

# Import scraper and converter
from autoscout24_working_scraper import main as run_scraper
from scripts.convert_scraped_data import convert_all_data

import time

def push_to_backend(data_file):
    """Send converted data to Node.js backend one by one"""
    node_url = os.getenv("NODE_API_URL", "http://localhost:5000/ai/import-cars")
    print(f"\n📡 Pushing data to: {node_url}")
    
    if not os.path.exists(data_file):
        print(f"❌ Data file not found: {data_file}")
        return False

    with open(data_file, 'r', encoding='utf-8') as f:
        cars_data = json.load(f)

    print(f"📦 Total cars to sync: {len(cars_data)}")
    success_count = 0
    error_count = 0

    for i, car in enumerate(cars_data, 1):
        try:
            # Send one car at a time, disable individual notifications
            payload = {
                "cars": [car],
                "notify": False 
            } 
            response = requests.post(node_url, json=payload, timeout=30)
            
            if response.status_code == 200:
                success_count += 1
                if i % 10 == 0 or i == len(cars_data):
                    print(f"  ✅ Progress: {i}/{len(cars_data)} synced...", end="\r")
            else:
                print(f"\n❌ Error at car {i} ({car.get('title')}): {response.text}")
                error_count += 1
            
            # Small delay to prevent overwhelming the server
            time.sleep(0.1)

        except Exception as e:
            print(f"\n❌ Connection error at car {i}: {e}")
            error_count += 1
            time.sleep(1) # Wait longer on error

    # 4. Trigger Summary Notification
    if success_count > 0:
        try:
            summary_url = node_url.replace("/import-cars", "/import-summary")
            requests.post(summary_url, json={"count": success_count}, timeout=10)
            print(f"\n🔔 Summary notification sent for {success_count} cars.")
        except:
            print("\n⚠️  Failed to send summary notification.")

    print(f"\n\n📊 Sync Results:")
    print(f"   - Success: {success_count}")
    print(f"   - Failed:  {error_count}")
    
    return success_count > 0

LOCK_FILE = os.path.join(tempfile.gettempdir(), "ai_scraper.lock")

def run_automation():
    # Double-run protection
    if os.path.exists(LOCK_FILE):
        # Check if process is actually running (optional but safer)
        print(f"⚠️  Scraper is already running (Lock file found: {LOCK_FILE})")
        return

    # Create lock file
    with open(LOCK_FILE, "w") as f:
        f.write(str(os.getpid()))

    try:
        print("\n🚀 Starting Full Automation Cycle...")
        
        # 1. Run Scraper (Headless)
        try:
            print("\nStep 1: Running Scraper...")
            run_scraper(headless=True)
            print("✅ Scraper Finished Successfully")
        except Exception as e:
            print(f"❌ Scraper Failed: {e}")
            return

        # 2. Run Data Converter
        try:
            print("\nStep 2: Converting Data for API...")
            input_file = os.path.join(project_root, 'scrapers', 'output.json')
            output_file = os.path.join(project_root, 'data', 'raw', 'cars_data.json')
            convert_all_data(input_file, output_file)
            print("✅ Data Conversion Finished Successfully")
        except Exception as e:
            print(f"❌ Data Conversion Failed: {e}")
            return

        # 3. Push to Database via API
        try:
            print("\nStep 3: Syncing with Database...")
            output_file = os.path.join(project_root, 'data', 'raw', 'cars_data.json')
            success = push_to_backend(output_file)
            if success:
                print("✅ Database Sync Finished Successfully")
            else:
                print("⚠️  Database Sync Failed (Check backend status)")
        except Exception as e:
            print(f"❌ Database Sync Error: {e}")

        print("\n🎉 Automation Cycle Completed Successfully!")

    finally:
        # Always remove lock file on exit
        if os.path.exists(LOCK_FILE):
            os.remove(LOCK_FILE)

if __name__ == "__main__":
    run_automation()
