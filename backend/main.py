from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from backend.beam_client import run_sam2_on_beam

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can restrict this to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/segment")
async def segment_image(file: UploadFile = File(...)):
    image_bytes = await file.read()
    
    try:
        mask_data = run_sam2_on_beam(image_bytes)
        return {"success": True, "masks": mask_data}
    except Exception as e:
        return {"success": False, "error": str(e)}