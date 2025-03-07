package com.zimocr.backend.repository;

import com.zimocr.backend.model.BillOfLading;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;


import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class BillOfLadingRepositoryTest {

    @Autowired
    private BillOfLadingRepository billOfLadingRepository;

    @Test
    void testSaveAndFindByBillOfLadingNumber() {
        BillOfLading bill = new BillOfLading();
        bill.setBillOfLadingNumber("BOL-123456");

        billOfLadingRepository.save(bill);

        Optional<BillOfLading> found = billOfLadingRepository.findByBillOfLadingNumber("BOL-123456");
        assertTrue(found.isPresent());
        assertEquals("BOL-123456", found.get().getBillOfLadingNumber());
    }
}
