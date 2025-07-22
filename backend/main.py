import base64
import requests
import time
from backend.beam_client import run_sam2_on_beam
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow frontend to connect to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["*"] for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


BEAM_API_URL = "https://inference-9a8cae6-v1.app.beam.cloud"
BEAM_TASK_URL = "https://api.beam.cloud/v2/task/"
BEAM_AUTH_HEADER = {
    "Authorization": "Bearer 9rK-Vb5cTqdCQvvvPLvvSIUJDMVztE40-VPp5rihcAoKJI3HRua-0DKFxSpAoyK1eeHMgXFUhVh3Fec0FqCWhg==",
    "Content-Type": "application/json",
}

@app.post("/segments")
async def segments(file: UploadFile = File(...)):
    # Read image as base64
    print("reached backend ")
    image_bytes = await file.read()
    image_base64 = base64.b64encode(image_bytes).decode()

    # Step 1: Send to Beam
    response = requests.post(
        BEAM_API_URL,
        headers=BEAM_AUTH_HEADER,
        json={"image_base64": image_base64},
    )
    task = response.json()
    task_id = str(task["result"])

    # Step 2: Poll status
    for _ in range(10):
        time.sleep(2)
        status_res = requests.get(BEAM_TASK_URL + task_id + "/", headers=BEAM_AUTH_HEADER)
        status_data = status_res.json()

        if status_data.get("status") == "completed":
            return status_data["result"]
        elif status_data.get("status") == "failed":
            return {"error": "Beam processing failed."}

    return {"error": "Beam did not complete in time."}

@app.get("/")
def read_root():
    return {"message": "FastAPI is working!"}

@app.get("/run-task")
def run_task():
    return {"message": "FastAPI function executed successfully"}
