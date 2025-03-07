package com.zimocr.backend.controller;

import java.util.Map;

import com.zimocr.backend.service.BillOfLadingService;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/ocr")
@CrossOrigin(origins = "http://zimOCR_frontend:5173") // מתיר גישה מה-Frontend
public class OCRController {

    private final BillOfLadingService billOfLadingService;
    private final RestTemplate restTemplate;
    private static final String OCR_SERVICE_URL = "http://zimOCR_ocr_service:5001/api/ocr"; // כתובת ה-OCR בתוך Docker

    public OCRController(BillOfLadingService billOfLadingService, RestTemplate restTemplate) {
        this.billOfLadingService = billOfLadingService;
        this.restTemplate = restTemplate;
    }

    @PostMapping
    public ResponseEntity<?> processDocument(@RequestBody String base64Pdf) {
        try {
            // בדיקת תקינות בסיסית
            if (base64Pdf == null || base64Pdf.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Missing PDF data"));
            }

            // שליחת הבקשה כ-text/plain
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.TEXT_PLAIN);
            HttpEntity<String> requestEntity = new HttpEntity<>(base64Pdf.trim(), headers);

            // קריאה לשירות ה-OCR
            ResponseEntity<String> responseEntity = restTemplate.exchange(OCR_SERVICE_URL, HttpMethod.POST, requestEntity, String.class);

            if (responseEntity.getStatusCode() != HttpStatus.OK || responseEntity.getBody() == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "OCR Service response is invalid"));
            }

            return ResponseEntity.ok(responseEntity.getBody());

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to process document", "details", e.getMessage()));
        }
    }
}
