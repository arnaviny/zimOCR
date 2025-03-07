# OCR and LLM Service

This project provides an OCR and LLM service using a containerized setup. It includes an OCR API on port 5001 and an LLM API on port 5002. Below are the details for setting up, running, and testing the service.

## Installation and Setup

### Prerequisites
- Docker
- Python 3.10+
- `pip` for package management

### Running the Service

To build and run the containerized services, use the following commands:

```sh
# Build the Docker image
docker build -t zimocr_ocr_service .

# Run the container
docker run -p 5001:5001 -p 5002:5002 --name zimocr_container zimocr_ocr_service
```

## API Reference

### OCR API (Port 5001)

#### **Endpoint:** `/api/ocr`
**Method:** `POST`
**Content-Type:** `text/plain`

##### **Request:**
```json
{
  "file": "base64-encoded PDF content"
}
```

##### **Response:**
Returns a structured JSON object with extracted information.

```json
{
  "billOfLadingNumber": "string",
  "containerNumber": "string",
  "vessel": "string",
  "voyageNumber": "string",
  "departureDate": "string (ISO 8601 format)",
  "arrivalDate": "string (ISO 8601 format)",
  "originPort": "string",
  "destinationPort": "string",
  "description": "string",
  "weightKg": "integer",
  "quantity": "integer",
  "volumeM3": "integer",
  "hazardous": "boolean",
  "shipperName": "string",
  "shipperAddress": "string",
  "shipperContact": "string",
  "consigneeName": "string",
  "consigneeAddress": "string",
  "consigneeContact": "string",
  "agentName": "string",
  "agentAddress": "string",
  "agentContact": "string",
  "incoterms": "string",
  "freightCharges": "string",
  "paymentTerms": "string"
}
```

### LLM API (Port 5002)

#### **Endpoint:** `/api/llm`
**Method:** `POST`
**Content-Type:** `application/json`

##### **Request:**
```json
{
  "prompt": "Your input text here"
}
```

##### **Response:**
```json
{
  "response": "Generated text from LLM"
}
```

## Running Tests

The `test/` directory contains scripts for stress testing and validation.

### **Automated Tests**

Run the test scripts to verify the service:

```sh
python3 test/stress_test.py
```

This script performs:
- Load testing with increasing concurrency levels
- Real-time monitoring of Docker container performance
- Failure rate analysis
- Visual graph updates in real-time

### **Manual Testing via cURL**

To manually test the OCR API:
```sh
curl -X POST "http://localhost:5001/api/ocr" \
     -H "Content-Type: text/plain" \
     --data-binary "@test/sample_document.pdf.b64"
```

To manually test the LLM API:
```sh
curl -X POST "http://localhost:5002/api/llm" \
     -H "Content-Type: application/json" \
     -d '{"prompt": "Hello, generate text!"}'
```

## Using on Windows and Linux

### **Windows**
- Install Docker Desktop.
- Use `Git Bash` or `PowerShell` for running commands.
- Ensure `python` and `pip` are installed.

### **Linux**
- Install Docker using `apt` or `yum`.
- Use `bash` to execute commands.
- Ensure `python3` and `pip3` are installed.

## Debugging and Logs
For any issues, refer to the `logs/` directory inside the container for detailed debugging information. Running `docker logs zimocr_container` can also provide insights into service failures.

---
This document provides an overview of using and testing the OCR and LLM services. If you encounter issues, check the logs or run the test scripts for further analysis.