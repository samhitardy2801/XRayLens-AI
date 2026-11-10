
import base64
from io import BytesIO

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, UnidentifiedImageError

from backend.backend.services.model_service import predict_image
from backend.backend.services.gradcam_service import generate_gradcam
from backend.backend.services.visualization_service import create_gradcam_overlay


app = FastAPI(
    title="XRayLens AI",
    description="Explainable AI-powered Chest X-ray Pneumonia Detection",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "https://x-ray-lens-ai.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "Welcome to XRayLens AI",
        "status": "Backend is running successfully"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "application": "XRayLens AI"
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...)):

    if file.content_type not in ["image/jpeg", "image/png"]:
        raise HTTPException(
            status_code=400,
            detail="Please upload a JPG or PNG image."
        )

    try:
        contents = await file.read()

        if not contents:
            raise HTTPException(
                status_code=400,
                detail="Uploaded image is empty."
            )

        image = Image.open(BytesIO(contents)).convert("RGB")

        result = predict_image(image)

        cam_result = generate_gradcam(image)

        overlay = create_gradcam_overlay(
            image,
            cam_result["heatmap"]
        )

        image_buffer = BytesIO()
        overlay.save(image_buffer, format="PNG")

        overlay_base64 = base64.b64encode(
            image_buffer.getvalue()
        ).decode("utf-8")

        return {
            "status": "success",
            "result": result,
            "explainability": {
                "method": "Grad-CAM",
                "predicted_class": cam_result["predicted_class"],
                "overlay_image": f"data:image/png;base64,{overlay_base64}"
            },
            "message": "Educational AI prediction only. Not a medical diagnosis."
        }

    except HTTPException:
        raise

    except (UnidentifiedImageError, OSError):
        raise HTTPException(
            status_code=400,
            detail="Invalid or corrupted image."
        )

    except Exception as e:
        print(f"Prediction error: {e}")
        raise HTTPException(
            status_code=500,
            detail="An internal error occurred while processing the image."
        )
