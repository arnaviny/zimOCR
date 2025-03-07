package com.zimocr.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "bill_of_lading")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BillOfLading {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String billOfLadingNumber;

    private String containerNumber;
    private String vessel;
    private String voyageNumber;

    private LocalDateTime departureDate;
    private LocalDateTime arrivalDate;

    private String originPort;
    private String destinationPort;

    private String description;
    private Integer weightKg;
    private Integer quantity;
    private Integer volumeM3;
    private Boolean hazardous;

    private String shipperName;
    private String shipperAddress;
    private String shipperContact;

    private String consigneeName;
    private String consigneeAddress;
    private String consigneeContact;

    private String agentName;
    private String agentAddress;
    private String agentContact;

    private String incoterms;
    private String freightCharges;
    private String paymentTerms;

    @Column(updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
