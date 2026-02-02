
import requests

def test_summary():
    url = "http://localhost:5000/ai/import-summary"
    payload = {"count": 10}
    try:
        response = requests.post(url, json=payload)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_summary()
