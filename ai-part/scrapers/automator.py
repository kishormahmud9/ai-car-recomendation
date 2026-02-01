import os
import sys
import json
import requests
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

def push_to_backend(data_file):
    """Send converted data to Node.js backend"""
    node_url = os.getenv("NODE_API_URL", "http://localhost:5000/ai/import-cars")
    print(f"\n📡 Pushing data to: {node_url}")
    
    if not os.path.exists(data_file):
        print(f"❌ Data file not found: {data_file}")
        return False

    with open(data_file, 'r', encoding='utf-8') as f:
        cars_data = json.load(f)

    try:
        # Send only the new/converted cars (the ones from convert_all_data)
        # However, for simplicity, we send the whole file, backend handles upserts
        payload = {"cars": cars_data}
        response = requests.post(node_url, json=payload, timeout=60)
        
        if response.status_code == 200:
            print(f"✅ Successfully synced {len(cars_data)} cars to database")
            return True
        else:
            print(f"❌ Backend error ({response.status_code}): {response.text}")
            return False
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return False

def run_automation():
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

if __name__ == "__main__":
    run_automation()
