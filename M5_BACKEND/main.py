from contextlib import asynccontextmanager
from typing import Any
import os
from dotenv import load_dotenv
import requests

from fastapi import (
    FastAPI,
    HTTPException,
    Depends,
    UploadFile,
    File,
    Form,
)

from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import text
from sqlmodel import Session, select, SQLModel

from database import engine

from models import (
    User,
    Listing,
    SavedListing,
    Profile,
    RecognitionHistory,
)

from auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user_id,
)


# =========================================================
# M3 BREED RECOGNITION AI
# =========================================================

load_dotenv()

M3_API_URL = os.getenv(
    "M3_API_URL",
    "http://10.181.83.74:8000/predict",
)

# =========================================================
# DATABASE MIGRATION
# =========================================================

def migrate_database():

    SQLModel.metadata.create_all(engine)

    statements = [

        "ALTER TABLE listings ADD COLUMN IF NOT EXISTS title VARCHAR NOT NULL DEFAULT ''",

        "ALTER TABLE listings ADD COLUMN IF NOT EXISTS breed_id VARCHAR",

        "ALTER TABLE listings ADD COLUMN IF NOT EXISTS health_status VARCHAR",

        "ALTER TABLE listings ADD COLUMN IF NOT EXISTS vaccination_status VARCHAR",

        "ALTER TABLE listings ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW()",


        # AI VERIFICATION

        "ALTER TABLE listings ADD COLUMN IF NOT EXISTS ai_verification_status VARCHAR",

        "ALTER TABLE listings ADD COLUMN IF NOT EXISTS ai_top_breed VARCHAR",

        "ALTER TABLE listings ADD COLUMN IF NOT EXISTS ai_top_confidence DOUBLE PRECISION",

        "ALTER TABLE listings ADD COLUMN IF NOT EXISTS ai_seller_breed_in_top_3 BOOLEAN",

        "ALTER TABLE listings ADD COLUMN IF NOT EXISTS ai_seller_breed_confidence DOUBLE PRECISION",

        "ALTER TABLE listings ADD COLUMN IF NOT EXISTS ai_message VARCHAR",

        "ALTER TABLE listings ADD COLUMN IF NOT EXISTS ai_top_predictions JSON",

    ]

    with engine.begin() as connection:

        for statement in statements:

            connection.execute(
                text(statement)
            )


@asynccontextmanager
async def lifespan(app: FastAPI):

    migrate_database()

    yield


# =========================================================
# FASTAPI APPLICATION
# =========================================================

app = FastAPI(
    title="BreedDex API",
    lifespan=lifespan,
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ] + [
        origin.strip()
        for origin in os.getenv("CORS_ORIGINS", "").split(",")
        if origin.strip()
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# REQUEST MODELS
# =========================================================

class RegisterRequest(BaseModel):

    email: str

    password: str

    active_mode: str = "buyer"


class LoginRequest(BaseModel):

    email: str

    password: str


class ProfilePayload(BaseModel):

    full_name: str

    phone_number: str

    location: str

    user_type: str

    profile_image: str | None = None


class ModePayload(BaseModel):

    active_mode: str


class ListingCreate(BaseModel):

    title: str

    animal_type: str

    breed: str

    breed_id: str | None = None

    gender: str

    age: str

    location: str

    price: float

    description: str

    health_status: str | None = None

    vaccination_status: str | None = None

    image: str | None = None


    # AI VERIFICATION DATA

    ai_verification_status: str | None = None

    ai_top_breed: str | None = None

    ai_top_confidence: float | None = None

    ai_seller_breed_in_top_3: bool | None = None

    ai_seller_breed_confidence: float | None = None

    ai_message: str | None = None

    ai_top_predictions: list[dict[str, Any]] | None = None


class RecognitionCreate(BaseModel):

    image_url: str | None = None

    raw_response: dict | None = None


# =========================================================
# HELPER FUNCTIONS
# =========================================================

def profile_dict(
    profile: Profile | None,
    user: User | None = None,
):

    if not profile:

        return None

    return {

        "id": profile.id,

        "user_id": profile.user_id,

        "full_name": profile.full_name,

        "email": (
            user.email
            if user
            else None
        ),

        "phone_number": profile.phone,

        "location": profile.location,

        "user_type": profile.user_type,

        "profile_image": (
            profile.profile_image
            or ""
        ),

    }


def seller_dict(
    session: Session,
    user_id: int,
):

    user = session.get(
        User,
        user_id,
    )

    if not user:

        return None


    profile = session.exec(

        select(Profile).where(
            Profile.user_id == user_id
        )

    ).first()


    full_name = (

        profile.full_name

        if profile

        else user.email

    )


    return {

        "id": user.id,

        "email": user.email,

        "full_name": full_name,

        "farmName": full_name,

        "location": (

            profile.location

            if profile

            else ""

        ),

        "image": (

            profile.profile_image

            if profile

            else None

        ),

        "profile_image": (

            profile.profile_image

            if profile

            else None

        ),

        "bio": "",

        "experience": 0,

        "verified": False,

    }


def listing_dict(
    session: Session,
    listing: Listing,
):

    seller = seller_dict(
        session,
        listing.seller_id,
    )


    age_value = listing.age


    if (
        str(listing.age)
        .replace(".", "", 1)
        .isdigit()
    ):

        age_value = float(
            listing.age
        )


    return {


        # ID

        "id": str(
            listing.id
        ),


        # BASIC LISTING DATA

        "title": (

            listing.title

            or listing.breed

        ),

        "animalType":
            listing.animal_type,

        "breed":
            listing.breed,

        "breedId": (

            listing.breed_id

            or ""

        ),

        "gender":
            listing.gender,

        "age":
            age_value,

        "ageLabel":
            f"{listing.age} years",

        "location":
            listing.location,

        "price":
            listing.price,

        "description":
            listing.description,

        "healthStatus": (

            listing.health_status

            or "Not specified."

        ),

        "vaccinationStatus": (

            listing.vaccination_status

            or "Not specified."

        ),

        "images": (

            [listing.image]

            if listing.image

            else []

        ),


        # SELLER

        "sellerId": str(
            listing.seller_id
        ),

        "sellerName": (

            seller["full_name"]

            if seller

            else "Private Seller"

        ),

        "seller":
            seller,


        # AI BREED VERIFICATION

        "aiVerificationStatus": (

            listing.ai_verification_status

            or "NOT_VERIFIED"

        ),

        "aiTopBreed": (

            listing.ai_top_breed

            or ""

        ),

        "aiTopConfidence":
            listing.ai_top_confidence,

        "aiSellerBreedInTop3":
            listing.ai_seller_breed_in_top_3,

        "aiSellerBreedConfidence":
            listing.ai_seller_breed_confidence,

        "aiMessage": (

            listing.ai_message

            or ""

        ),

        "aiTopPredictions": (

            listing.ai_top_predictions

            or []

        ),


        # CREATED DATE

        "createdAt": (

            listing.created_at.isoformat()

            if listing.created_at

            else ""

        ),

    }


# =========================================================
# BASIC HEALTH ENDPOINTS
# =========================================================

@app.get("/")
def root():

    return {

        "message":
            "BreedDex API is running"

    }


@app.get("/health")
def health():

    return {

        "status": "ok"

    }


@app.get("/db-test")
def db_test():

    with engine.connect() as connection:

        result = connection.execute(
            text("SELECT 1")
        ).scalar()

    return {

        "database": "connected",

        "result": result,

    }


# =========================================================
# M3 AI CONNECTION TEST
# =========================================================

@app.post("/test-m3")
async def test_m3(

    image: UploadFile = File(...)

):

    try:

        image_bytes = await image.read()


        if not image_bytes:

            raise HTTPException(

                status_code=400,

                detail=(
                    "Uploaded image is empty."
                ),

            )


        files = {

            "image": (

                image.filename,

                image_bytes,

                image.content_type
                or "image/jpeg",

            )

        }


        response = requests.post(

            M3_API_URL,

            files=files,

            timeout=60,

        )


        if response.status_code != 200:

            raise HTTPException(

                status_code=502,

                detail=(
                    f"M3 server returned status "
                    f"{response.status_code}: "
                    f"{response.text}"
                ),

            )


        return response.json()


    except requests.exceptions.RequestException as error:

        raise HTTPException(

            status_code=503,

            detail=(
                f"Could not connect to "
                f"M3 AI server: {str(error)}"
            ),

        )


# =========================================================
# NORMAL BREED RECOGNITION
# FOR BUYER / USER / GUEST
# =========================================================

@app.post("/recognition/analyze")
async def analyze_breed(

    image: UploadFile = File(...)

):

    # -----------------------------------------------------
    # VALIDATE IMAGE
    # -----------------------------------------------------

    if (

        not image.content_type

        or not image.content_type.startswith(
            "image/"
        )

    ):

        raise HTTPException(

            status_code=400,

            detail=(
                "Please upload a valid image file."
            ),

        )


    # -----------------------------------------------------
    # READ IMAGE
    # -----------------------------------------------------

    image_bytes = await image.read()


    if not image_bytes:

        raise HTTPException(

            status_code=400,

            detail=(
                "Uploaded image is empty."
            ),

        )


    # -----------------------------------------------------
    # SEND IMAGE TO M3 AI
    # -----------------------------------------------------

    try:

        files = {

            "image": (

                image.filename,

                image_bytes,

                image.content_type,

            )

        }


        response = requests.post(

            M3_API_URL,

            files=files,

            timeout=60,

        )


        response.raise_for_status()


        ai_result = response.json()


    except requests.exceptions.RequestException as error:

        raise HTTPException(

            status_code=503,

            detail=(
                "Breed recognition service "
                f"is unavailable: {str(error)}"
            ),

        )


    # -----------------------------------------------------
    # HANDLE UNSUPPORTED ANIMAL
    # -----------------------------------------------------

    if ai_result.get("status") == "unsupported":

        raise HTTPException(

            status_code=400,

            detail=(
                ai_result.get(
                    "message",
                    "This image is not supported."
                )
            ),

        )


    # -----------------------------------------------------
    # HANDLE AI ERROR
    # -----------------------------------------------------

    if ai_result.get("status") != "success":

        raise HTTPException(

            status_code=500,

            detail=(
                ai_result.get(
                    "message",
                    "Breed prediction failed."
                )
            ),

        )


    # -----------------------------------------------------
    # EXTRACT AI DATA
    # -----------------------------------------------------

    breed = ai_result.get(
        "breed"
    )


    confidence = ai_result.get(
        "confidence",
        0.0,
    )


    animal_type = ai_result.get(
        "animal_type"
    )


    top_predictions = ai_result.get(
        "top_predictions",
        [],
    )


    # -----------------------------------------------------
    # RETURN DATA FOR REACT FRONTEND
    # -----------------------------------------------------

    return {

        "breed":
            breed,

        "breedId":
            ai_result.get(
                "breed_id"
            ),

        "animalType":
            animal_type,

        "confidence":
            confidence,

        "message": (
            f"The AI predicts this animal "
            f"is most likely {breed}."
        ),

        "matches":
            top_predictions,

        "modelVersion":
            ai_result.get(
                "model_version"
            ),

    }


# =========================================================
# AUTHENTICATION
# =========================================================

@app.post("/register")
def register(
    request: RegisterRequest
):

    email = (
        request.email
        .strip()
        .lower()
    )


    if request.active_mode not in (
        "buyer",
        "seller",
    ):

        raise HTTPException(

            status_code=400,

            detail="Invalid active mode",

        )


    with Session(engine) as session:


        existing_user = session.exec(

            select(User).where(
                User.email == email
            )

        ).first()


        if existing_user:

            raise HTTPException(

                status_code=400,

                detail=(
                    "Email already registered"
                ),

            )


        user = User(

            email=email,

            hashed_password=hash_password(
                request.password
            ),

            active_mode=request.active_mode,

        )


        session.add(user)

        session.commit()

        session.refresh(user)


        token = create_access_token({

            "sub":
                str(user.id),

        })


        return {

            "id":
                user.id,

            "email":
                user.email,

            "active_mode":
                user.active_mode,

            "access_token":
                token,

            "token_type":
                "bearer",

        }


@app.post("/login")
def login(
    request: LoginRequest
):

    email = (
        request.email
        .strip()
        .lower()
    )


    with Session(engine) as session:


        user = session.exec(

            select(User).where(
                User.email == email
            )

        ).first()


        if (

            not user

            or not verify_password(

                request.password,

                user.hashed_password,

            )

        ):

            raise HTTPException(

                status_code=401,

                detail=(
                    "Invalid email or password"
                ),

            )


        profile = session.exec(

            select(Profile).where(

                Profile.user_id
                == user.id

            )

        ).first()


        token = create_access_token({

            "sub":
                str(user.id),

        })


        return {

            "access_token":
                token,

            "token_type":
                "bearer",

            "user": {

                "id":
                    user.id,

                "email":
                    user.email,

                "active_mode":
                    user.active_mode,

                "profile":
                    profile_dict(
                        profile,
                        user,
                    ),

            },

        }


@app.get("/me")
def get_me(

    current_user_id: int = Depends(
        get_current_user_id
    )

):

    with Session(engine) as session:


        user = session.get(

            User,

            current_user_id,

        )


        if not user:

            raise HTTPException(

                status_code=404,

                detail="User not found",

            )


        profile = session.exec(

            select(Profile).where(

                Profile.user_id
                == current_user_id

            )

        ).first()


        return {

            "id":
                user.id,

            "email":
                user.email,

            "active_mode":
                user.active_mode,

            "profile":
                profile_dict(
                    profile,
                    user,
                ),

        }


@app.patch("/me/mode")
def update_mode(

    payload: ModePayload,

    current_user_id: int = Depends(
        get_current_user_id
    ),

):

    if payload.active_mode not in (
        "buyer",
        "seller",
    ):

        raise HTTPException(

            status_code=400,

            detail="Invalid mode",

        )


    with Session(engine) as session:


        user = session.get(

            User,

            current_user_id,

        )


        if not user:

            raise HTTPException(

                status_code=404,

                detail="User not found",

            )


        user.active_mode = (
            payload.active_mode
        )


        session.add(user)

        session.commit()

        session.refresh(user)


        return {

            "active_mode":
                user.active_mode

        }


# =========================================================
# PROFILE
# =========================================================

@app.get("/profiles/me")
def get_my_profile(

    current_user_id: int = Depends(
        get_current_user_id
    )

):

    with Session(engine) as session:


        user = session.get(
            User,
            current_user_id,
        )


        profile = session.exec(

            select(Profile).where(

                Profile.user_id
                == current_user_id

            )

        ).first()


        if not profile:

            raise HTTPException(

                status_code=404,

                detail=(
                    "Profile not found"
                ),

            )


        return profile_dict(
            profile,
            user,
        )


@app.put("/profiles/me")
@app.post("/profiles")
def save_my_profile(

    payload: ProfilePayload,

    current_user_id: int = Depends(
        get_current_user_id
    ),

):

    if payload.user_type not in (
        "buyer",
        "seller",
    ):

        raise HTTPException(

            status_code=400,

            detail=(
                "Invalid user type"
            ),

        )


    with Session(engine) as session:


        profile = session.exec(

            select(Profile).where(

                Profile.user_id
                == current_user_id

            )

        ).first()


        data = {

            "full_name":

                payload.full_name.strip(),

            "phone":

                payload.phone_number.strip(),

            "location":

                payload.location.strip(),

            "user_type":

                payload.user_type,

            "profile_image":

                payload.profile_image
                or None,

        }


        if profile:

            for key, value in data.items():

                setattr(
                    profile,
                    key,
                    value,
                )

        else:

            profile = Profile(

                user_id=current_user_id,

                **data,

            )


        user = session.get(

            User,

            current_user_id,

        )


        if not user:

            raise HTTPException(

                status_code=404,

                detail="User not found",

            )


        user.active_mode = (
            payload.user_type
        )


        session.add(profile)

        session.add(user)

        session.commit()

        session.refresh(profile)


        return profile_dict(
            profile,
            user,
        )


@app.get("/profiles/public/{user_id}")
def get_public_profile(
    user_id: int
):

    with Session(engine) as session:


        seller = seller_dict(
            session,
            user_id,
        )


        if not seller:

            raise HTTPException(

                status_code=404,

                detail=(
                    "Seller not found"
                ),

            )


        return seller


# =========================================================
# LISTINGS
# =========================================================

@app.get("/listings")
def get_listings():

    with Session(engine) as session:


        rows = session.exec(

            select(Listing)

            .order_by(
                Listing.created_at.desc()
            )

        ).all()


        return [

            listing_dict(
                session,
                row,
            )

            for row in rows

        ]


@app.get("/listings/mine/me")
def get_my_listings(

    current_user_id: int = Depends(
        get_current_user_id
    )

):

    with Session(engine) as session:


        rows = session.exec(

            select(Listing)

            .where(

                Listing.seller_id
                == current_user_id

            )

            .order_by(

                Listing.created_at.desc()

            )

        ).all()


        return [

            listing_dict(
                session,
                row,
            )

            for row in rows

        ]


@app.get("/listings/seller/{seller_id}")
def get_seller_listings(
    seller_id: int
):

    with Session(engine) as session:


        rows = session.exec(

            select(Listing)

            .where(

                Listing.seller_id
                == seller_id

            )

            .order_by(

                Listing.created_at.desc()

            )

        ).all()


        return [

            listing_dict(
                session,
                row,
            )

            for row in rows

        ]


@app.get("/listings/{listing_id}")
def get_listing(
    listing_id: int
):

    with Session(engine) as session:


        listing = session.get(
            Listing,
            listing_id,
        )


        if not listing:

            raise HTTPException(

                status_code=404,

                detail="Listing not found",

            )


        return listing_dict(
            session,
            listing,
        )


@app.post("/listings")
def create_listing(

    payload: ListingCreate,

    current_user_id: int = Depends(
        get_current_user_id
    ),

):

    with Session(engine) as session:


        listing = Listing(

            **payload.model_dump(),

            seller_id=current_user_id,

        )


        session.add(listing)

        session.commit()

        session.refresh(listing)


        return listing_dict(
            session,
            listing,
        )


@app.put("/listings/{listing_id}")
def update_listing(

    listing_id: int,

    payload: ListingCreate,

    current_user_id: int = Depends(
        get_current_user_id
    ),

):

    with Session(engine) as session:


        listing = session.get(

            Listing,

            listing_id,

        )


        if not listing:

            raise HTTPException(

                status_code=404,

                detail="Listing not found",

            )


        if (

            listing.seller_id
            != current_user_id

        ):

            raise HTTPException(

                status_code=403,

                detail=(
                    "You can only edit "
                    "your own listings."
                ),

            )


        data = payload.model_dump()


        for key, value in data.items():

            setattr(
                listing,
                key,
                value,
            )


        session.add(listing)

        session.commit()

        session.refresh(listing)


        return listing_dict(
            session,
            listing,
        )


# =========================================================
# SAVED LISTINGS
# =========================================================

@app.get("/saved-listings")
def get_saved_listings(

    current_user_id: int = Depends(
        get_current_user_id
    )

):

    with Session(engine) as session:


        saved = session.exec(

            select(SavedListing)

            .where(

                SavedListing.user_id
                == current_user_id

            )

        ).all()


        result = []


        for row in saved:


            listing = session.get(

                Listing,

                row.listing_id,

            )


            if listing:

                result.append(

                    listing_dict(
                        session,
                        listing,
                    )

                )


        return result


@app.get("/saved-listings/ids")
def get_saved_ids(

    current_user_id: int = Depends(
        get_current_user_id
    )

):

    with Session(engine) as session:


        rows = session.exec(

            select(SavedListing)

            .where(

                SavedListing.user_id
                == current_user_id

            )

        ).all()


        return [

            str(row.listing_id)

            for row in rows

        ]


@app.post("/saved-listings/{listing_id}")
def save_listing(

    listing_id: int,

    current_user_id: int = Depends(
        get_current_user_id
    ),

):

    with Session(engine) as session:


        listing = session.get(

            Listing,

            listing_id,

        )


        if not listing:

            raise HTTPException(

                status_code=404,

                detail="Listing not found",

            )


        existing = session.exec(

            select(SavedListing)

            .where(

                SavedListing.user_id
                == current_user_id,

                SavedListing.listing_id
                == listing_id,

            )

        ).first()


        if not existing:

            session.add(

                SavedListing(

                    user_id=current_user_id,

                    listing_id=listing_id,

                )

            )

            session.commit()


        return {

            "listing_id":
                str(listing_id),

            "saved":
                True,

        }


@app.delete(
    "/saved-listings/{listing_id}",
    status_code=204,
)
def remove_saved_listing(

    listing_id: int,

    current_user_id: int = Depends(
        get_current_user_id
    ),

):

    with Session(engine) as session:


        row = session.exec(

            select(SavedListing)

            .where(

                SavedListing.user_id
                == current_user_id,

                SavedListing.listing_id
                == listing_id,

            )

        ).first()


        if row:

            session.delete(row)

            session.commit()


# =========================================================
# RECOGNITION HISTORY
# =========================================================

@app.get("/recognition-history")
def get_history(

    current_user_id: int = Depends(
        get_current_user_id
    )

):

    with Session(engine) as session:


        rows = session.exec(

            select(RecognitionHistory)

            .where(

                RecognitionHistory.user_id
                == current_user_id

            )

            .order_by(

                RecognitionHistory.created_at.desc()

            )

        ).all()


        return [

            {

                "id":
                    str(r.id),

                "timestamp":

                    r.created_at.isoformat(),

                "image":
                    r.image_url,

                **(
                    r.raw_response
                    or {}
                ),

            }

            for r in rows

        ]


@app.post("/recognition-history")
def create_history(

    payload: RecognitionCreate,

    current_user_id: int = Depends(
        get_current_user_id
    ),

):

    with Session(engine) as session:


        row = RecognitionHistory(

            user_id=current_user_id,

            image_url=payload.image_url,

            raw_response=payload.raw_response,

        )


        session.add(row)

        session.commit()

        session.refresh(row)


        return {

            **(
                row.raw_response
                or {}
            ),

            "id":
                str(row.id),

            "timestamp":
                row.created_at.isoformat(),

            "image":
                row.image_url,

        }


@app.delete(
    "/recognition-history/{entry_id}",
    status_code=204,
)
def delete_history(

    entry_id: int,

    current_user_id: int = Depends(
        get_current_user_id
    ),

):

    with Session(engine) as session:


        row = session.get(

            RecognitionHistory,

            entry_id,

        )


        if (

            not row

            or row.user_id
            != current_user_id

        ):

            raise HTTPException(

                status_code=404,

                detail=(
                    "History item not found"
                ),

            )


        session.delete(row)

        session.commit()


@app.delete(
    "/recognition-history",
    status_code=204,
)
def clear_history(

    current_user_id: int = Depends(
        get_current_user_id
    )

):

    with Session(engine) as session:


        rows = session.exec(

            select(RecognitionHistory)

            .where(

                RecognitionHistory.user_id
                == current_user_id

            )

        ).all()


        for row in rows:

            session.delete(row)


        session.commit()


# =========================================================
# SELLER BREED VERIFICATION
# =========================================================

@app.post("/verify-listing-breed")
async def verify_listing_breed(

    seller_breed: str = Form(...),

    image: UploadFile = File(...),

):


    # -----------------------------------------------------
    # VALIDATE IMAGE
    # -----------------------------------------------------

    if (

        not image.content_type

        or not image.content_type.startswith(
            "image/"
        )

    ):

        raise HTTPException(

            status_code=400,

            detail=(
                "Please upload a valid image file."
            ),

        )


    # -----------------------------------------------------
    # READ IMAGE
    # -----------------------------------------------------

    image_bytes = await image.read()


    if not image_bytes:

        raise HTTPException(

            status_code=400,

            detail=(
                "Uploaded image is empty."
            ),

        )


    # -----------------------------------------------------
    # SEND TO M3 AI
    # -----------------------------------------------------

    try:


        files = {

            "image": (

                image.filename,

                image_bytes,

                image.content_type,

            )

        }


        response = requests.post(

            M3_API_URL,

            files=files,

            timeout=60,

        )


        response.raise_for_status()


        ai_result = response.json()


    except requests.exceptions.RequestException as error:

        raise HTTPException(

            status_code=503,

            detail={

                "message": (
                    "Breed recognition service "
                    "is unavailable."
                ),

                "error":
                    str(error),

            },

        )


    # -----------------------------------------------------
    # UNSUPPORTED ANIMAL
    # -----------------------------------------------------

    if ai_result.get("status") == "unsupported":

        return {

            "verification_status":
                "UNSUPPORTED",

            "seller_breed":
                seller_breed,

            "animal":

                ai_result.get(
                    "animal"
                ),

            "confidence":

                ai_result.get(
                    "confidence"
                ),

            "error_code":

                ai_result.get(
                    "error_code"
                ),

            "message":

                ai_result.get(

                    "message",

                    "The AI could not "
                    "verify this image."

                ),

        }


    # -----------------------------------------------------
    # AI ERROR
    # -----------------------------------------------------

    if ai_result.get("status") != "success":

        return {

            "verification_status":
                "ERROR",

            "seller_breed":
                seller_breed,

            "message":

                ai_result.get(

                    "message",

                    "Breed prediction failed."

                ),

        }


    # -----------------------------------------------------
    # EXTRACT AI PREDICTION
    # -----------------------------------------------------

    ai_breed = ai_result.get(
        "breed"
    )


    top_predictions = ai_result.get(

        "top_predictions",

        [],

    )


    top_confidence = ai_result.get(

        "confidence",

        0.0,

    )


    seller_breed_normalized = (

        seller_breed

        .strip()

        .lower()

    )


    ai_breed_normalized = (

        ai_breed

        .strip()

        .lower()

        if ai_breed

        else ""

    )


    # -----------------------------------------------------
    # CHECK TOP 3
    # -----------------------------------------------------

    seller_breed_in_top_3 = False

    seller_breed_confidence = None


    for prediction in top_predictions:


        predicted_breed = (

            prediction.get(
                "breed",
                "",
            )

            .strip()

            .lower()

        )


        if (

            predicted_breed
            == seller_breed_normalized

        ):


            seller_breed_in_top_3 = True


            seller_breed_confidence = (

                prediction.get(
                    "confidence"
                )

            )


            break


    # -----------------------------------------------------
    # DETERMINE STATUS
    # -----------------------------------------------------

    if (

        ai_breed_normalized
        == seller_breed_normalized

        and top_confidence >= 0.70

    ):


        verification_status = (
            "VERIFIED"
        )


        message = (

            "AI prediction strongly matches "
            "the seller-selected breed."

        )


    elif (

        ai_breed_normalized
        == seller_breed_normalized

    ):


        verification_status = (
            "LOW_CONFIDENCE_MATCH"
        )


        message = (

            "AI prediction matches the "
            "seller-selected breed, but "
            "confidence is below 70%."

        )


    elif seller_breed_in_top_3:


        verification_status = (
            "REVIEW_REQUIRED"
        )


        message = (

            "Seller-selected breed appears "
            "in the AI Top-3 predictions, "
            "but is not the top prediction."

        )


    else:


        verification_status = (
            "MISMATCH"
        )


        message = (

            "Seller-selected breed does not "
            "appear in the AI Top-3 predictions."

        )


    # -----------------------------------------------------
    # RETURN RESULT
    # -----------------------------------------------------

    return {

        "verification_status":
            verification_status,

        "seller_breed":
            seller_breed,

        "ai_top_breed":
            ai_breed,

        "ai_top_confidence":
            top_confidence,

        "seller_breed_in_top_3":
            seller_breed_in_top_3,

        "seller_breed_confidence":
            seller_breed_confidence,

        "animal_type":

            ai_result.get(
                "animal_type"
            ),

        "top_predictions":
            top_predictions,

        "model_version":

            ai_result.get(
                "model_version"
            ),

        "message":
            message,

    }