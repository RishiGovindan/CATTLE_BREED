from typing import Optional, List
from pydantic import BaseModel


class TopPrediction(BaseModel):
    breed: str
    confidence: float


class PredictionResponse(BaseModel):

    # --------------------------------------------------------
    # General status
    # --------------------------------------------------------

    status: str

    # --------------------------------------------------------
    # Used when YOLO detects cat/dog
    # --------------------------------------------------------

    animal: Optional[str] = None

    # --------------------------------------------------------
    # Breed prediction
    # --------------------------------------------------------

    animal_type: Optional[str] = None

    breed: Optional[str] = None

    # BRD000 - BRD014
    breed_code: Optional[str] = None

    # --------------------------------------------------------
    # Prediction confidence
    # --------------------------------------------------------

    confidence: Optional[float] = None

    # --------------------------------------------------------
    # Top predictions
    # --------------------------------------------------------

    top_predictions: Optional[List[TopPrediction]] = None

    # --------------------------------------------------------
    # Model information
    # --------------------------------------------------------

    model_version: Optional[str] = None

    # --------------------------------------------------------
    # Error information
    # --------------------------------------------------------

    error_code: Optional[str] = None

    message: Optional[str] = None