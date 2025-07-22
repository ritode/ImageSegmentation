import requests
import base64
import json

BEAM_URL = "https://inference-9a8cae6-v1.app.beam.cloud"
BEAM_API_KEY = "9rK-Vb5cTqdCQvvvPLvvSIUJDMVztE40-VPp5rihcAoKJI3HRua-0DKFxSpAoyK1eeHMgXFUhVh3Fec0FqCWhg=="

def run_sam2_on_beam(image_bytes: bytes):
    print("Sending request to Beam...")

    image_b64 = base64.b64encode(image_bytes).decode("utf-8")
    payload = {"image_base64": image_b64}
    headers = {
        "Authorization": f"Bearer {BEAM_API_KEY}",
        "Content-Type": "application/json"
    }

    response = requests.post(BEAM_URL, headers=headers, data=json.dumps(payload))
    print(f"Beam Response Status: {response.status_code}")

    if response.ok:
        print("Beam responded successfully")
        return response.json()
    else:
        print("Beam error:", response.text)
        response.raise_for_status()
