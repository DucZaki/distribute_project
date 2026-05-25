package com.ducnm.payment.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "payment", indexes = {
        @Index(name = "idx_booking", columnList = "booking_id"),
        @Index(name = "idx_txn_ref", columnList = "txn_ref", unique = true)
})
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "booking_id", nullable = false)
    private Integer bookingId;

    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Column(name = "amount", precision = 12, scale = 2, nullable = false)
    private BigDecimal amount;

    @Column(name = "currency", length = 10, nullable = false)
    @Builder.Default
    private String currency = "VND";

    @Column(name = "provider", length = 30, nullable = false)
    @Builder.Default
    private String provider = "VNPAY";

    @Column(name = "txn_ref", length = 64, nullable = false)
    private String txnRef;

    @Column(name = "provider_txn_id", length = 100)
    private String providerTxnId;

    @Column(name = "status", length = 30, nullable = false)
    @Builder.Default
    private String status = "PENDING";

    @Column(name = "bank_code", length = 30)
    private String bankCode;

    @Column(name = "response_code", length = 10)
    private String responseCode;

    @Column(name = "raw_response", columnDefinition = "TEXT")
    private String rawResponse;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}
