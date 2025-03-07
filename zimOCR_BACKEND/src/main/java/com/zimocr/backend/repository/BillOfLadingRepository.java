package com.zimocr.backend.repository;

import com.zimocr.backend.model.BillOfLading;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BillOfLadingRepository extends JpaRepository<BillOfLading, Long> {

    Optional<BillOfLading> findByBillOfLadingNumber(String billOfLadingNumber);
}
