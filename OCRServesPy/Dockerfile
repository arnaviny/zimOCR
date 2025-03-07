# שימוש בתמונה קלת משקל שמתאימה ל-ARM
FROM python:3.10-slim

WORKDIR /app

# יצירת תיקיית לוגים
RUN mkdir -p /app/logs

# עדכון והתקנת תלות מערכת – כולל poppler-utils ו-tesseract-ocr
RUN apt-get update && apt-get install -y \
    poppler-utils \
    tesseract-ocr \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# העתקת קובץ הדרישות והתקנתן
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# התקנת חבילות נוספות הדרושות להפעלת הפרויקט
RUN pip install --no-cache-dir torch transformers flask flask-cors pytesseract pdf2image requests supervisor plotext

# העתקת כל קבצי הפרויקט
COPY . .

# חשיפת הפורטים של השירותים (OCR על 5001, LLM על 5002)
EXPOSE 5001 5002

# הפעלת השירותים באמצעות Supervisor
CMD ["supervisord", "-c", "/app/supervisord.conf"]
