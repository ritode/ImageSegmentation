import requests
import imghdr

def run_sam2_on_beam(image_bytes: bytes):
    AUTH_TOKEN = "9rK-Vb5cTqdCQvvvPLvvSIUJDMVztE40-VPp5rihcAoKJI3HRua-0DKFxSpAoyK1eeHMgXFUhVh3Fec0FqCWhg=="
    BEAM_ENDPOINT = "https://inference-9a8cae6-v1.app.beam.cloud"  # Actual inference URL

    image_type = imghdr.what(None, h=image_bytes)
    if image_type is None:
        raise ValueError("Unsupported or corrupted image format")

    mime_type = f'image/{image_type}'
    file_extension = 'png' if image_type == 'png' else 'jpg'

    files = {
        'image': (f'image.{file_extension}', image_bytes, mime_type)
    }

    headers = {
        "Authorization": f"Bearer {AUTH_TOKEN}"
    }

    # Try with just `/` as path
    response = requests.post(
        f"{BEAM_ENDPOINT}/",  # <-- the model might live at root path
        headers=headers,
        files=files
    )

    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Beam API error: {response.status_code} - {response.text}")
