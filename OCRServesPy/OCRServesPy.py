import os
import base64
import tempfile
import re
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from pdf2image import convert_from_path
import pytesseract
from datetime import datetime

app = Flask(__name__)
CORS(app)

LLM_API_URL = "http://localhost:5002/api/llm"  # הפנייה לשירות ה-LLM

def validate_llm_output(data):
    validation_rules = {
        "billOfLadingNumber": r"^BOL-\d{6}$",
        "containerNumber": r"^[A-Z]{3}[UJZ]{1}\d{7}$",
        "vessel": r"^[\w\s\-]+$",
        "voyageNumber": r"^[A-Z0-9\-]+$",
        "departureDate": r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$",
        "arrivalDate": r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$",
        "originPort": r"^[\w\s\-]+$",
        "destinationPort": r"^[\w\s\-]+$",
        "description": r"^[\w\s\-,.]+$",
        "weightKg": int,
        "quantity": int,
        "volumeM3": int,
        "hazardous": bool,
        "shipperName": r"^[\w\s\-]+$",
        "shipperAddress": r"^[\w\s\-.,]+$",
        "shipperContact": r"^[\w\s\-.,]+$",
        "consigneeName": r"^[\w\s\-]+$",
        "consigneeAddress": r"^[\w\s\-.,]+$",
        "consigneeContact": r"^[\w\s\-.,]+$",
        "agentName": r"^[\w\s\-]+$",
        "agentAddress": r"^[\w\s\-.,]+$",
        "agentContact": r"^[\w\s\-.,]+$",
        "incoterms": r"^[A-Z]{3}$",
        "freightCharges": r"^[\w\s\-]+$",
        "paymentTerms": r"^[\w\s\-]+$"
    }

    validated_data = {}

    for key, rule in validation_rules.items():
        value = data.get(key, None)
        if value is None:
            validated_data[key] = None
            continue

        if isinstance(rule, str):
            if not re.match(rule, str(value)):
                validated_data[key] = None
            else:
                validated_data[key] = value
        elif rule == int:
            try:
                validated_data[key] = int(value)
            except ValueError:
                validated_data[key] = None
        elif rule == bool:
            validated_data[key] = True if str(value).lower() == "true" else False if str(value).lower() == "false" else None

    return validated_data

@app.route('/api/ocr', methods=['POST'])
def ocr_endpoint():
    try:
        base64_pdf = request.get_data(as_text=True)
        pdf_bytes = base64.b64decode(base64_pdf)
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_pdf:
            temp_pdf.write(pdf_bytes)
            temp_pdf_path = temp_pdf.name

        # ציון נתיב מפורש ל-poppler, במקרה שהבינארי pdftoppm אינו נמצא ב-PATH
        images = convert_from_path(temp_pdf_path, poppler_path="/usr/bin")
        ocr_text = "".join([pytesseract.image_to_string(image) for image in images])

        # שולחים את הטקסט ל-LLM לקבלת JSON מובנה
        prompt = f"Extract structured JSON from the following:\n{ocr_text}"
        response = requests.post(LLM_API_URL, json={"prompt": prompt})
        structured_data = response.json().get("response", {})

        # ולידציה של הנתונים
        validated_data = validate_llm_output(structured_data)

        os.remove(temp_pdf_path)

        return jsonify({
            "extractedText": ocr_text,
            "structuredData": validated_data
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
