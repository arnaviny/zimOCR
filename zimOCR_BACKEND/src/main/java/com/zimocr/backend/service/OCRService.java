package com.zimocr.backend.service;

import com.zimocr.backend.model.BillOfLading;
import com.zimocr.backend.service.BillOfLadingService;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Base64;
import java.util.Map;

@Service
public class OCRService {

    private final BillOfLadingService billOfLadingService;
    private final RestTemplate restTemplate;
    private static final String OCR_SERVICE_URL = "http://zimOCR_ocr_service:5001/api/ocr";

    public OCRService(BillOfLadingService billOfLadingService, RestTemplate restTemplate) {
        this.billOfLadingService = billOfLadingService;
        this.restTemplate = restTemplate;
    }

    public ResponseEntity<?> processDocument(Map<String, String> request) {
        try {
            // בדיקה שהבקשה מכילה את המפתח pdfBase64
            if (!request.containsKey("pdfBase64")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Missing pdfBase64 field"));
            }

            String base64Pdf = fixBase64Padding(request.get("pdfBase64").trim());

            // בדיקה האם ה-Base64 תקין
            if (!isValidBase64(base64Pdf)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid Base64 encoding"));
            }

            // שליחת ה-Base64 ל-OCR Service בפורמט text/plain
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.TEXT_PLAIN);
            HttpEntity<String> requestEntity = new HttpEntity<>(base64Pdf, headers);

            ResponseEntity<Map> responseEntity = restTemplate.exchange(OCR_SERVICE_URL, HttpMethod.POST, requestEntity, Map.class);

            // בדיקה אם ה-OCR Service החזיר תשובה תקינה
            if (responseEntity.getStatusCode() != HttpStatus.OK || responseEntity.getBody() == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "OCR Service response is invalid"));
            }

            Map<String, Object> responseBody = responseEntity.getBody();
            if (!responseBody.containsKey("extractedData")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "OCR response missing extracted data"));
            }

            // יצירת אובייקט ושמירה ב-DB
            BillOfLading billOfLading = billOfLadingService.createBillOfLading(responseBody);
            return ResponseEntity.ok(Map.of("message", "Document processed successfully", "documentId", billOfLading.getId()));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to process document", "details", e.getMessage()));
        }
    }

    /**
     * פונקציה לתיקון חוסר בפדינג ב-Base64
     */
    private String fixBase64Padding(String base64) {
        int missingPadding = (4 - base64.length() % 4) % 4;
        return base64 + "=".repeat(missingPadding);
    }

    /**
     * פונקציה לבדיקת תקינות של מחרוזת Base64
     */
    private boolean isValidBase64(String base64) {
        try {
            byte[] decodedBytes = Base64.getDecoder().decode(base64);
            return decodedBytes.length > 0;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }
}
