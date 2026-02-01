import schedule
import time
import os
import sys
from datetime import datetime

# Add current directory to path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

from automator import run_automation

def job():
    print(f"\n[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] ⏰ Starting Scheduled Task...")
    run_automation()
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] 😴 Task finished. Next run in 7 days.")

def main():
    print("\n" + "="*60)
    print("🕒 AI Scraper Scheduler Started")
    print(f"📅 Current Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("🔄 Interval: Every 7 Days")
    print("="*60 + "\n")

    # Schedule the job every 7 days
    schedule.every(7).days.do(job)
    
    # Run once immediately on startup
    print("🚀 Running initial scrape and convert cycle...")
    job()

    print("\n⏳ Scheduler is now running in the background...")
    print("   (Keep this terminal open for the automation to continue)")
    
    while True:
        schedule.run_pending()
        time.sleep(60) # Check every minute

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n🛑 Scheduler stopped by user.")
    except Exception as e:
        print(f"\n❌ Scheduler crashed: {e}")
