package com.zimocr.backend.service;

import com.zimocr.backend.model.BillOfLading;
import com.zimocr.backend.repository.BillOfLadingRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@Service
public class BillOfLadingService {

    private final BillOfLadingRepository billOfLadingRepository;

    public BillOfLadingService(BillOfLadingRepository billOfLadingRepository) {
        this.billOfLadingRepository = billOfLadingRepository;
    }

    public BillOfLading createBillOfLading(Map<String, Object> ocrResponse) {
        Map<String, Object> extractedData = (Map<String, Object>) ocrResponse.get("extractedData");

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        BillOfLading billOfLading = BillOfLading.builder()
                .billOfLadingNumber((String) extractedData.get("billOfLadingNumber"))
                .containerNumber((String) extractedData.get("containerNumber"))
                .vessel((String) extractedData.get("vessel"))
                .voyageNumber((String) extractedData.get("voyageNumber"))

                // המרה של תאריכים מ-String ל-LocalDateTime
                .departureDate(parseDate(extractedData.get("departureDate"), formatter))
                .arrivalDate(parseDate(extractedData.get("arrivalDate"), formatter))

                .originPort((String) extractedData.get("originPort"))
                .destinationPort((String) extractedData.get("destinationPort"))
                .description((String) extractedData.get("description"))

                .weightKg(getInteger(extractedData.get("weightKg")))
                .quantity(getInteger(extractedData.get("quantity")))
                .volumeM3(getInteger(extractedData.get("volumeM3")))
                .hazardous(getBoolean(extractedData.get("hazardous")))

                .shipperName((String) extractedData.get("shipperName"))
                .shipperAddress((String) extractedData.get("shipperAddress"))
                .shipperContact((String) extractedData.get("shipperContact"))

                .consigneeName((String) extractedData.get("consigneeName"))
                .consigneeAddress((String) extractedData.get("consigneeAddress"))
                .consigneeContact((String) extractedData.get("consigneeContact"))

                .agentName((String) extractedData.get("agentName"))
                .agentAddress((String) extractedData.get("agentAddress"))
                .agentContact((String) extractedData.get("agentContact"))

                .incoterms((String) extractedData.get("incoterms"))
                .freightCharges((String) extractedData.get("freightCharges"))
                .paymentTerms((String) extractedData.get("paymentTerms"))

                .createdAt(LocalDateTime.now())
                .build();

        return billOfLadingRepository.save(billOfLading);
    }

    private LocalDateTime parseDate(Object dateObj, DateTimeFormatter formatter) {
        if (dateObj instanceof String && !((String) dateObj).isEmpty()) {
            return LocalDateTime.parse((String) dateObj, formatter);
        }
        return null;
    }

    private Integer getInteger(Object value) {
        if (value instanceof Number) {
            return ((Number) value).intValue();
        }
        return null;
    }

    private Boolean getBoolean(Object value) {
        if (value instanceof Boolean) {
            return (Boolean) value;
        }
        return null;
    }
}
