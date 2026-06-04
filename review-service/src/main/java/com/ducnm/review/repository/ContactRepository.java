package com.ducnm.review.repository;

import com.ducnm.review.entity.Contact;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ContactRepository extends JpaRepository<Contact, Integer> {
    Page<Contact> findByTrangThai(String trangThai, Pageable pageable);

    long countByTrangThai(String trangThai);
}
