FROM python:3.9-slim

WORKDIR /app

# עדכון חבילות והתקנת Poppler ו-Tesseract
RUN apt-get update && apt-get install -y \
    poppler-utils \
    tesseract-ocr \
    && rm -rf /var/lib/apt/lists/*  # לנקות קבצי apt כדי לחסוך מקום

# התקנת pip והחבילות הנדרשות
RUN python -m ensurepip && pip install --upgrade pip

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5001

ENV FLASK_APP=OCRServesPy.py
CMD ["python", "-m", "flask", "run", "--host=0.0.0.0", "--port=5001"]

