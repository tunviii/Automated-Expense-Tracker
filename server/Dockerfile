FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy server code and serialized ML models
COPY main.py .
COPY expense_model.pkl .
COPY vectorizer.pkl .

# Expose port (Render sets $PORT dynamically)
EXPOSE 8000

CMD ["sh", "-c", "uvicorn main.py:app --host 0.0.0.0 --port ${PORT:-8000}"]
