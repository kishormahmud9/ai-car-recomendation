
import os
import sys
import json
import requests

# Add current and project root to path
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
sys.path.append(current_dir)
sys.path.append(project_root)

from scrapers.automator import push_to_backend
from scripts.convert_scraped_data import convert_all_data

def test_full_sync():
    print("🚀 Starting Manual Sync Test...")
    
    # 1. Convert
    input_file = os.path.join(current_dir, 'scrapers', 'output.json')
    output_file = os.path.join(current_dir, 'data', 'raw', 'cars_data_test.json')
    
    # Create a small subset for testing
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    subset = data[:5] # Just 5 cars
    temp_input = os.path.join(current_dir, 'scrapers', 'output_test.json')
    with open(temp_input, 'w', encoding='utf-8') as f:
        json.dump(subset, f, indent=2)
        
    print("Step 1: Converting subset...")
    convert_all_data(temp_input, output_file)
    
    # 2. Sync
    print("\nStep 2: Syncing...")
    push_to_backend(output_file)
    
    print("\n✅ Test Completed")

if __name__ == "__main__":
    test_full_sync()
