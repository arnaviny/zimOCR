#!/bin/bash

# נתיב הבסיס של הקוד (עדכן לפי הצורך)
PROJECT_PATH="/Users/amit/Documents/cyberpro/zimOCR/zimOCR_BACKEND"

# נתיב התיקייה שיש לשנות
OLD_PACKAGE_DIR="$PROJECT_PATH/src/main/java/com/zimocr/zimOCR_BACKEND"
NEW_PACKAGE_DIR="$PROJECT_PATH/src/main/java/com/zimocr/backend"

# שלב 1: שינוי שם התיקייה zimOCR_BACKEND ל-backend
if [ -d "$OLD_PACKAGE_DIR" ]; then
    mv "$OLD_PACKAGE_DIR" "$NEW_PACKAGE_DIR"
    echo "✔ שונה שם התיקייה ל-backend"
else
    echo "⚠ התיקייה $OLD_PACKAGE_DIR לא נמצאה!"
    exit 1
fi

# שלב 2: שינוי ה-package בכל קובץ Java
find "$PROJECT_PATH/src/main/java" -type f -name "*.java" -exec sed -i '' 's/package com.zimocr.zimOCR_BACKEND;/package com.zimocr.backend;/g' {} +

echo "✔ עודכן ה-package בכל קובצי ה-Java"

# שלב 3: קומפילציה מחדש של הפרויקט
cd "$PROJECT_PATH" || exit
mvn clean compile

echo "✔ סיום! הפרויקט עודכן בהצלחה."

