import os
import joblib
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(
    title="Expense Tracker ML API",
    description="Categorizes financial transaction SMS messages using TF-IDF + Logistic Regression",
    version="1.0.0"
)

# Enable CORS so the React Native / Expo app can communicate with the server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SERVER_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(SERVER_DIR, "expense_model.pkl")
VECTORIZER_PATH = os.path.join(SERVER_DIR, "vectorizer.pkl")

model = None
vectorizer = None


def load_artifacts():
    global model, vectorizer
    if not os.path.exists(MODEL_PATH) or not os.path.exists(VECTORIZER_PATH):
        print("Model or vectorizer artifacts not found. Please run train.py first.")
        return False
    try:
        model = joblib.load(MODEL_PATH)
        vectorizer = joblib.load(VECTORIZER_PATH)
        print("ML model and vectorizer loaded successfully!")
        return True
    except Exception as e:
        print(f"Error loading model artifacts: {e}")
        return False


# Load artifacts upon module load
load_artifacts()


@app.get("/health")
def health_check():
    return {
        "status": "healthy" if model is not None else "model_not_loaded",
        "model_loaded": model is not None,
        "classes": list(model.classes_) if model is not None else []
    }


class PredictRequest(BaseModel):
    raw_text: str
    merchant: Optional[str] = None
    amount: Optional[float] = None


class CategoryProbability(BaseModel):
    category: str
    probability: float


class PredictResponse(BaseModel):
    category: str
    confidence: float
    top_categories: List[CategoryProbability]


class BatchPredictRequest(BaseModel):
    messages: List[str]


class BatchPredictResponse(BaseModel):
    predictions: List[PredictResponse]


@app.get("/health")
def health_check():
    return {
        "status": "healthy" if model is not None else "model_not_loaded",
        "model_loaded": model is not None,
        "classes": list(model.classes_) if model is not None else []
    }


@app.post("/predict", response_model=PredictResponse)
def predict_category(request: PredictRequest):
    if model is None or vectorizer is None:
        # Attempt reloading once if artifacts were created after startup
        if not load_artifacts():
            raise HTTPException(
                status_code=503,
                detail="Model artifacts are not loaded. Train the model first."
            )

    text = request.raw_text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="raw_text cannot be empty")

    # Transform text using TF-IDF
    features = vectorizer.transform([text])

    # Predict category probabilities
    probabilities = model.predict_proba(features)[0]
    classes = model.classes_

    # Sort categories by probability descending
    top_indices = np.argsort(probabilities)[::-1]
    best_idx = top_indices[0]
    best_category = str(classes[best_idx])
    best_confidence = float(probabilities[best_idx])

    top_categories = [
        CategoryProbability(
            category=str(classes[idx]),
            probability=round(float(probabilities[idx]), 4)
        )
        for idx in top_indices[:3]
    ]

    return PredictResponse(
        category=best_category,
        confidence=round(best_confidence, 4),
        top_categories=top_categories
    )


@app.post("/predict-batch", response_model=BatchPredictResponse)
def predict_batch(request: BatchPredictRequest):
    if model is None or vectorizer is None:
        if not load_artifacts():
            raise HTTPException(
                status_code=503,
                detail="Model artifacts are not loaded. Train the model first."
            )

    if not request.messages:
        return BatchPredictResponse(predictions=[])

    features = vectorizer.transform(request.messages)
    all_probabilities = model.predict_proba(features)
    classes = model.classes_

    results = []
    for probs in all_probabilities:
        top_indices = np.argsort(probs)[::-1]
        best_idx = top_indices[0]
        best_category = str(classes[best_idx])
        best_confidence = float(probs[best_idx])

        top_categories = [
            CategoryProbability(
                category=str(classes[idx]),
                probability=round(float(probs[idx]), 4)
            )
            for idx in top_indices[:3]
        ]

        results.append(PredictResponse(
            category=best_category,
            confidence=round(best_confidence, 4),
            top_categories=top_categories
        ))

    return BatchPredictResponse(predictions=results)
