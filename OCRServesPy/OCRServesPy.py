import os
import base64
import tempfile
import re
from flask import Flask, request, jsonify
from flask_cors import CORS
from pdf2image import convert_from_path
import pytesseract

app = Flask(__name__)
CORS(app)

def extract_data_from_text(text):
    """
    פונקציה לחילוץ נתונים מהטקסט שהתקבל מה-OCR ומסידורם במבנה JSON.
    הפונקציה מנקה את הטקסט ומנסה לחלץ את:
      - billOfLadingNumber
      - containerNumber
      - vessel
      - voyageNumber
      - departureDate
      - arrivalDate
      - originPort
      - destinationPort
      - cargoDetails (description, weightKg, quantity, volumeM3, hazardous)
      - shipper, consignee, agent (לכל אחד: name, address, contact)
      - shippingTerms (incoterms, freightCharges, paymentTerms)
    """
    data = {}
    cleaned_text = re.sub(r'\s+', ' ', text)

    def extract_field(pattern, text, group=1, flags=0):
        m = re.search(pattern, text, flags)
        return m.group(group).strip() if m else None

    data['billOfLadingNumber'] = extract_field(r'Bill of Lading Number[:\s]*?(BOL-[0-9\-]+)', cleaned_text, flags=re.IGNORECASE)
    data['containerNumber'] = extract_field(r'Container Number[:\s]*?([A-Z0-9]+)', cleaned_text, flags=re.IGNORECASE)
    data['vessel'] = extract_field(r'Vessel[:\s]*?(.+?)(?=\sVoyage Number|\sDeparture Date|$)', cleaned_text, flags=re.IGNORECASE)
    data['voyageNumber'] = extract_field(r'Voyage Number[:\s]*?([A-Z0-9]+)', cleaned_text, flags=re.IGNORECASE)
    data['departureDate'] = extract_field(r'Departure Date[:\s]*?([\d\-T:Z]+)', cleaned_text, flags=re.IGNORECASE)
    data['arrivalDate'] = extract_field(r'Arrival Date[:\s]*?([\d\-T:Z]+)', cleaned_text, flags=re.IGNORECASE)
    data['originPort'] = extract_field(r'Origin Port[:\s]*?([A-Za-z0-9 ]+)', cleaned_text, flags=re.IGNORECASE)
    data['destinationPort'] = extract_field(r'Destination Port[:\s]*?([A-Za-z0-9 ]+)', cleaned_text, flags=re.IGNORECASE)

    # חילוץ פרטי המטען:
    cargo = {}
    cargo['description'] = extract_field(r'Description[:\s]*?([A-Za-z0-9 ,]+)', cleaned_text, flags=re.IGNORECASE)
    weight = extract_field(r'Weight \(Kg\)[:\s]*?(\d+)', cleaned_text, flags=re.IGNORECASE)
    cargo['weightKg'] = int(weight) if weight and weight.isdigit() else None
    quantity = extract_field(r'Quantity[:\s]*?(\d+)', cleaned_text, flags=re.IGNORECASE)
    cargo['quantity'] = int(quantity) if quantity and quantity.isdigit() else None
    volume = extract_field(r'Volume \(m3\)[:\s]*?(\d+)', cleaned_text, flags=re.IGNORECASE)
    cargo['volumeM3'] = int(volume) if volume and volume.isdigit() else None
    hazardous = extract_field(r'Hazardous[:\s]*?(True|False)', cleaned_text, flags=re.IGNORECASE)
    cargo['hazardous'] = hazardous.capitalize() if hazardous else None
    data['cargoDetails'] = cargo

    def extract_party(party_label):
        pattern = party_label + r'[:\s]*(.*?)(?=\s(?:Shipper|Consignee|Agent|Shipping Terms|$))'
        party_text = extract_field(pattern, cleaned_text, flags=re.IGNORECASE)
        if not party_text:
            return {}
        party = {}
        party['name'] = extract_field(r'Name[:\s]*?([^,]+)', party_text, flags=re.IGNORECASE)
        party['address'] = extract_field(r'Address[:\s]*?([^,]+)', party_text, flags=re.IGNORECASE)
        party['contact'] = extract_field(r'Contact[:\s]*?([^,]+)', party_text, flags=re.IGNORECASE)
        return party

    data['shipper'] = extract_party("Shipper")
    data['consignee'] = extract_party("Consignee")
    data['agent'] = extract_party("Agent")

    shipping = {}
    shipping['incoterms'] = extract_field(r'Incoterms[:\s]*?([A-Z]+)', cleaned_text, flags=re.IGNORECASE)
    shipping['freightCharges'] = extract_field(r'Freight Charges[:\s]*?([A-Za-z]+)', cleaned_text, flags=re.IGNORECASE)
    shipping['paymentTerms'] = extract_field(r'Payment Terms[:\s]*?([\w\s]+)', cleaned_text, flags=re.IGNORECASE)
    data['shippingTerms'] = shipping

    return data

@app.route('/api/ocr', methods=['POST'])
def ocr_endpoint():
    try:
        base64_pdf = request.get_data(as_text=True)
        pdf_bytes = base64.b64decode(base64_pdf)
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_pdf:
            temp_pdf.write(pdf_bytes)
            temp_pdf_path = temp_pdf.name

        images = convert_from_path(temp_pdf_path)
        ocr_text = ""
        for image in images:
            ocr_text += pytesseract.image_to_string(image) + "\n"

        extracted_data = extract_data_from_text(ocr_text)
        os.remove(temp_pdf_path)
        return jsonify({
            "extractedText": ocr_text,
            "extractedData": extracted_data
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)

