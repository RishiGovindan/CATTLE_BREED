from pathlib import Path

import numpy as np
from PIL import Image
from tensorflow.keras.models import load_model


# ============================================================
# PROJECT ROOT
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parent.parent


# ============================================================
# MODEL
# ============================================================

MODEL_PATH = PROJECT_ROOT / "models" / "breed_model_v1_best.keras"


# ============================================================
# CLASS MAPPING
# ============================================================

CLASS_NAMES = [
    "Ayrshire",
    "Gir",
    "Kangayam",
    "Kenkatha",
    "Mewati",
    "Nari",
    "Ongole",
    "Poda Thirupu",
    "Purnea",
    "Red Kandhari",
    "Banni",
    "Bhadawari",
    "Jaffarabadi",
    "Murrah",
    "Nagpuri",
]


# ============================================================
# BRD CODE MAPPING
# ============================================================

BREED_CODE_MAP = {
    "Ayrshire": "BRD000",
    "Gir": "BRD001",
    "Kangayam": "BRD002",
    "Kenkatha": "BRD003",
    "Mewati": "BRD004",
    "Nari": "BRD005",
    "Ongole": "BRD006",
    "Poda Thirupu": "BRD007",
    "Purnea": "BRD008",
    "Red Kandhari": "BRD009",
    "Banni": "BRD010",
    "Bhadawari": "BRD011",
    "Jaffarabadi": "BRD012",
    "Murrah": "BRD013",
    "Nagpuri": "BRD014",
}


# ============================================================
# ANIMAL TYPE MAPPING
# ============================================================

ANIMAL_TYPE_MAP = {
    "Ayrshire": "cattle",
    "Gir": "cattle",
    "Kangayam": "cattle",
    "Kenkatha": "cattle",
    "Mewati": "cattle",
    "Nari": "cattle",
    "Ongole": "cattle",
    "Poda Thirupu": "cattle",
    "Purnea": "cattle",
    "Red Kandhari": "cattle",
    "Banni": "buffalo",
    "Bhadawari": "buffalo",
    "Jaffarabadi": "buffalo",
    "Murrah": "buffalo",
    "Nagpuri": "buffalo",
}


# ============================================================
# MODEL LOADING
# ============================================================

_model = None


def get_model():
    """
    Load the model once and reuse it.
    """

    global _model

    if _model is None:
        if not MODEL_PATH.exists():
            raise FileNotFoundError(
                f"Model file not found: {MODEL_PATH}"
            )

        _model = load_model(MODEL_PATH)

    return _model


# ============================================================
# IMAGE PREPARATION
# ============================================================

def prepare_image(image_path):
    """
    Prepare image exactly as expected by the M2 model.
    """

    image = Image.open(image_path).convert("RGB")

    image = image.resize((224, 224))

    image_array = np.array(image).astype("float32")

    # Keep pixel range 0-255.
    # This matches the preprocessing verified in the
    # direct M2 vs M3 comparison.
    image_array = np.expand_dims(image_array, axis=0)

    return image_array


# ============================================================
# BREED PREDICTION
# ============================================================

def predict_breed(image_path):
    """
    Predict cattle/buffalo breed from an image.
    """

    try:

        # ----------------------------------------------------
        # Load model
        # ----------------------------------------------------

        model = get_model()

        # ----------------------------------------------------
        # Prepare image
        # ----------------------------------------------------

        input_image = prepare_image(image_path)

        # ----------------------------------------------------
        # Prediction
        # ----------------------------------------------------

        predictions = model.predict(
            input_image,
            verbose=0
        )

        probabilities = predictions[0]

        # ----------------------------------------------------
        # Top prediction
        # ----------------------------------------------------

        top_index = int(np.argmax(probabilities))

        predicted_breed = CLASS_NAMES[top_index]

        confidence = float(probabilities[top_index])

        # ----------------------------------------------------
        # Top 3 predictions
        # ----------------------------------------------------

        top_indices = np.argsort(probabilities)[::-1][:3]

        top_predictions = []

        for index in top_indices:
            index = int(index)

            top_predictions.append({
                "breed": CLASS_NAMES[index],
                "confidence": float(probabilities[index])
            })

        # ----------------------------------------------------
        # Animal type
        # ----------------------------------------------------

        animal_type = ANIMAL_TYPE_MAP.get(
            predicted_breed,
            "unknown"
        )

        # ----------------------------------------------------
        # BRD code
        # ----------------------------------------------------

        breed_code = BREED_CODE_MAP.get(
            predicted_breed
        )

        # ----------------------------------------------------
        # Final result
        # ----------------------------------------------------

        return {
            "status": "success",
            "animal_type": animal_type,
            "breed": predicted_breed,
            "breed_code": breed_code,
            "confidence": confidence,
            "top_predictions": top_predictions,
            "model_version": "M2-V1"
        }

    except Exception as e:

        return {
            "status": "error",
            "message": str(e)
        }