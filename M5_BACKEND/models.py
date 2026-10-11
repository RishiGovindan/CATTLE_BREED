from datetime import datetime, timezone
from typing import Any, Optional

from sqlalchemy import (
    Column,
    JSON,
    UniqueConstraint,
)

from sqlmodel import (
    Field,
    SQLModel,
)


# =========================================================
# USER
# =========================================================

class User(SQLModel, table=True):

    __tablename__ = "users"

    id: Optional[int] = Field(
        default=None,
        primary_key=True,
    )

    email: str = Field(
        index=True,
        unique=True,
    )

    hashed_password: str

    active_mode: str = Field(
        default="buyer",
    )


# =========================================================
# PROFILE
# =========================================================

class Profile(SQLModel, table=True):

    __tablename__ = "profiles"

    id: Optional[int] = Field(
        default=None,
        primary_key=True,
    )

    full_name: str

    phone: str

    location: str

    user_type: str

    profile_image: Optional[str] = None

    user_id: int = Field(
        foreign_key="users.id",
        unique=True,
        index=True,
    )


# =========================================================
# LISTING
# =========================================================

class Listing(SQLModel, table=True):

    __tablename__ = "listings"

    id: Optional[int] = Field(
        default=None,
        primary_key=True,
    )

    title: str = Field(
        default=""
    )

    animal_type: str

    breed: str

    breed_id: Optional[str] = None

    gender: str

    age: str

    location: str

    price: float

    description: str

    health_status: Optional[str] = None

    vaccination_status: Optional[str] = None

    image: Optional[str] = None


    # =====================================================
    # AI BREED VERIFICATION
    # =====================================================

    ai_verification_status: Optional[str] = None

    ai_top_breed: Optional[str] = None

    ai_top_confidence: Optional[float] = None

    ai_seller_breed_in_top_3: Optional[bool] = None

    ai_seller_breed_confidence: Optional[float] = None

    ai_message: Optional[str] = None


    # AI Top-3 predictions
    # Example:
    # [
    #     {
    #         "breed": "Murrah",
    #         "confidence": 0.91
    #     },
    #     {
    #         "breed": "Mehsana",
    #         "confidence": 0.06
    #     }
    # ]

    ai_top_predictions: Optional[
        list[dict[str, Any]]
    ] = Field(
        default=None,
        sa_column=Column(JSON),
    )


    # =====================================================
    # CREATED DATE
    # =====================================================

    created_at: datetime = Field(
        default_factory=lambda:
            datetime.now(timezone.utc)
    )


    # =====================================================
    # SELLER
    # =====================================================

    seller_id: int = Field(
        foreign_key="users.id",
        index=True,
    )


# =========================================================
# SAVED LISTINGS
# =========================================================

class SavedListing(SQLModel, table=True):

    __tablename__ = "saved_listings"

    __table_args__ = (

        UniqueConstraint(
            "user_id",
            "listing_id",
            name="uq_saved_user_listing",
        ),

    )

    id: Optional[int] = Field(
        default=None,
        primary_key=True,
    )

    user_id: int = Field(
        foreign_key="users.id",
        index=True,
    )

    listing_id: int = Field(
        foreign_key="listings.id",
        index=True,
    )


# =========================================================
# RECOGNITION HISTORY
# =========================================================

class RecognitionHistory(SQLModel, table=True):

    __tablename__ = "recognition_history"

    id: Optional[int] = Field(
        default=None,
        primary_key=True,
    )

    user_id: int = Field(
        foreign_key="users.id",
        index=True,
    )

    image_url: Optional[str] = None

    created_at: datetime = Field(
        default_factory=lambda:
            datetime.now(timezone.utc),
    )

    raw_response: Optional[
        dict[str, Any]
    ] = Field(
        default=None,
        sa_column=Column(JSON),
    )