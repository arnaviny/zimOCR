# OCRServesPy

OCRServesPy הוא שירות OCR מבוסס Python ו-Flask להמרת קובצי PDF (המועברים כמחרוזת Base64) לטקסט, תוך שימוש ב-Tesseract לזיהוי טקסט וחילוץ נתונים רלוונטיים.

## תכולת הפרויקט

- **API לזיהוי טקסט (OCR API):**

  - מקבל בקשת POST עם קובץ PDF כ-Base64.
  - ממיר את ה-PDF לתמונות באמצעות `pdf2image`.
  - משתמש ב-Tesseract לזיהוי טקסט.
  - מחלץ נתונים ספציפיים באמצעות Regex ומסדר אותם ב-JSON.

- **תמיכת CORS:**

  - Flask-CORS מוגדר כך שכל מקור יוכל לגשת ל-API.

## דרישות מערכת

- **Python 3.9 ומעלה**
- **Poppler** (להמרת PDF לתמונות) – התקנה ב-macOS:
  ```bash
  brew install poppler
  ```
- **Tesseract** (מנוע OCR) – התקנה ב-macOS:
  ```bash
  brew install tesseract
  ```

## התקנה והרצה מקומית

1. **שכפול הפרויקט:**

   ```bash
   git clone <repository_url>
   cd OCRServesPy
   ```

2. **יצירת סביבת פיתוח והתקנת התלויות:**

   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

3. **הרצת השירות:**

   ```bash
   python3 OCRServesPy.py
   ```

   השירות יאזין על `http://localhost:5000`.

## שימוש ב-API

### שליחת בקשה עם curl:

```bash
curl -X POST -H "Content-Type: text/plain" --data-binary "@path/to/BOLdemo_generated_1.pdf.b64" http://localhost:5000/api/ocr
```

### שימוש ב-Postman:

- כתובת: `http://localhost:5000/api/ocr`
- שיטת HTTP: `POST`
- Header: `Content-Type: text/plain`
- גוף הבקשה: תוכן הקובץ Base64 (`.pdf.b64`)

## בדיקות דיוק

### ארגון קובצי הבדיקה:

- `input/` – קובצי Base64 לבדיקה.
- `ground_truth/` – קובצי טקסט עם התוצאה המצופה.

### הרצת סקריפט הבדיקה:

```bash
python3 tests/test_suite.py
```

הסקריפט:

- שולח קבצים לבדיקה ל-API.
- משווה את התוצאה עם הטקסט הצפוי.
- מדפיס אחוזי דיוק.
- שומר את התוצאות בקובץ `accuracy_results.json`.

## הרצה באמצעות Docker

1. **בניית התמונה:**

   ```bash
   docker build -t ocr-service .
   ```

2. **הרצת הקונטיינר:**

    ```bash
    docker run -p 5000:5000 amitbialik1/ocr-service:latest
    ```


3. **משיכת הקונטיינר:**

    ```bash
    docker pull amitbialik1/ocr-service:latest
    ```

## פתרון בעיות

- **Poppler או Tesseract לא מותקנים:** ודא שהתקנת אותם והם זמינים ב-PATH.
- **CORS חסום:** השירות תומך ב-CORS כברירת מחדל.
- **התקנת תלויות חסרה:** ודא שהרצת `pip install -r requirements.txt`.

לשאלות נוספות, ניתן לפתוח Issue בריפוזיטורי.

