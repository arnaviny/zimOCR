package com.zimocr.backend.service;

import com.zimocr.backend.model.BillOfLading;
import com.zimocr.backend.repository.BillOfLadingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class BillOfLadingServiceTest {

    @Mock
    private BillOfLadingRepository billOfLadingRepository;

    @InjectMocks
    private BillOfLadingService billOfLadingService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testCreateBillOfLading() {
        Map<String, Object> mockOcrResponse = Map.of(
                "extractedData", Map.of(
                        "billOfLadingNumber", "BOL-123456",
                        "containerNumber", "CONT-789",
                        "vessel", "Ship A"
                )
        );

        BillOfLading billOfLading = BillOfLading.builder()
                .billOfLadingNumber("BOL-123456")
                .containerNumber("CONT-789")
                .vessel("Ship A")
                .build();

        when(billOfLadingRepository.save(any(BillOfLading.class))).thenReturn(billOfLading);

        BillOfLading result = billOfLadingService.createBillOfLading(mockOcrResponse);

        assertNotNull(result);
        assertEquals("BOL-123456", result.getBillOfLadingNumber());
        verify(billOfLadingRepository, times(1)).save(any(BillOfLading.class));
    }

    @Test
    void testFindByBillOfLadingNumber() {
        BillOfLading bill = new BillOfLading();
        bill.setBillOfLadingNumber("BOL-123456");

        when(billOfLadingRepository.findByBillOfLadingNumber("BOL-123456")).thenReturn(Optional.of(bill));

        Optional<BillOfLading> found = billOfLadingRepository.findByBillOfLadingNumber("BOL-123456");

        assertTrue(found.isPresent());
        assertEquals("BOL-123456", found.get().getBillOfLadingNumber());
    }
}
