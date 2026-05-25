package com.ducnm.payment.repository;

import com.ducnm.payment.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Integer> {
    Optional<Payment> findByTxnRef(String txnRef);
    Optional<Payment> findByBookingId(Integer bookingId);
}
