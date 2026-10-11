from fastapi import FastAPI, UploadFile, File, HTTPException

from app.schemas import PredictionResponse
from app.predictor import predict_breed
from app.detector import detect_cat_dog

from PIL import Image
from io import BytesIO

import tempfile
import os


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="Breed Recognition API",
    version="1.0.0"
)


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():

    return {
        "message": "Breed Recognition API is running",
        "version": "1.0.0"
    }


# ============================================================
# PREDICTION ENDPOINT
# ============================================================

@app.post(
    "/predict",
    response_model=PredictionResponse
)
async def predict(
    image: UploadFile = File(...)
):

    # ========================================================
    # 1. CHECK CONTENT TYPE
    # ========================================================

    if (
        not image.content_type
        or not image.content_type.startswith("image/")
    ):

        raise HTTPException(
            status_code=400,
            detail="Please upload a valid image file."
        )

    # ========================================================
    # 2. READ IMAGE
    # ========================================================

    image_bytes = await image.read()

    # ========================================================
    # 3. CHECK EMPTY FILE
    # ========================================================

    if not image_bytes:

        raise HTTPException(
            status_code=400,
            detail="Uploaded image is empty."
        )

    # ========================================================
    # 4. VERIFY IMAGE
    # ========================================================

    try:

        uploaded_image = Image.open(
            BytesIO(image_bytes)
        )

        uploaded_image.verify()

    except Exception:

        raise HTTPException(
            status_code=400,
            detail=(
                "Uploaded file is not a valid "
                "or readable image."
            )
        )

    temp_path = None

    try:

        # ====================================================
        # 5. SAVE IMAGE TEMPORARILY
        # ====================================================

        suffix = os.path.splitext(
            image.filename or ".jpg"
        )[1]

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=suffix
        ) as temp_file:

            temp_file.write(image_bytes)

            temp_path = temp_file.name

        # ====================================================
        # 6. CAT / DOG DETECTION
        # ====================================================

        detections = detect_cat_dog(
            temp_path
        )

        # ====================================================
        # 7. REJECT CAT / DOG
        # ====================================================

        if detections:

            detected = detections[0]

            return {
                "status": "unsupported",

                "animal": detected["animal"],

                "error_code": "UNSUPPORTED_ANIMAL",

                "confidence": detected["confidence"],

                "message": (
                    "The uploaded image appears to contain "
                    "a cat or dog, which is not supported."
                )
            }

        # ====================================================
        # 8. SEND IMAGE TO M2 MODEL
        # ====================================================

        breed_result = predict_breed(
            temp_path
        )

        # ====================================================
        # 9. HANDLE MODEL ERROR
        # ====================================================

        if breed_result["status"] != "success":

            return {
                "status": breed_result["status"],
                "message": breed_result.get(
                    "message",
                    "Prediction failed."
                )
            }

        # ====================================================
        # 10. SUCCESSFUL PREDICTION
        # ====================================================

        return {

            "status": "success",

            "animal_type": breed_result[
                "animal_type"
            ],

            "breed": breed_result[
                "breed"
            ],

            "breed_code": breed_result[
                "breed_code"
            ],

            "confidence": breed_result[
                "confidence"
            ],

            "top_predictions": breed_result[
                "top_predictions"
            ],

            "model_version": breed_result[
                "model_version"
            ]
        }

    finally:

        # ====================================================
        # 11. DELETE TEMPORARY IMAGE
        # ====================================================

        if (
            temp_path
            and os.path.exists(temp_path)
        ):

            os.remove(temp_path)