import os
import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split


def train_and_export():
    dataset_path = os.path.join(os.path.dirname(__file__), "..", "expense_dataset_v1.csv")
    if not os.path.exists(dataset_path):
        dataset_path = "expense_dataset_v1.csv"

    print(f"Loading dataset from: {dataset_path}")
    df = pd.read_csv(dataset_path)

    # Clean missing values if any
    df = df.dropna(subset=["raw_text", "category"])

    X = df["raw_text"]
    y = df["category"]

    print(f"Total samples: {len(X)} across {y.nunique()} categories")

    # Split dataset
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print("Fitting TF-IDF vectorizer...")
    vectorizer = TfidfVectorizer(
        lowercase=True,
        stop_words="english",
        ngram_range=(1, 2)
    )
    X_train_tfidf = vectorizer.fit_transform(X_train)
    X_test_tfidf = vectorizer.transform(X_test)

    print("Training Logistic Regression model...")
    model = LogisticRegression(max_iter=2000)
    model.fit(X_train_tfidf, y_train)

    # Evaluate
    predictions = model.predict(X_test_tfidf)
    print("\n--- Model Evaluation ---")
    print(classification_report(y_test, predictions))

    # Save artifacts in the server directory
    server_dir = os.path.dirname(__file__)
    model_path = os.path.join(server_dir, "expense_model.pkl")
    vectorizer_path = os.path.join(server_dir, "vectorizer.pkl")

    joblib.dump(model, model_path)
    joblib.dump(vectorizer, vectorizer_path)

    print(f"\nArtifacts successfully saved:")
    print(f" - Model: {model_path}")
    print(f" - Vectorizer: {vectorizer_path}")


if __name__ == "__main__":
    train_and_export()
