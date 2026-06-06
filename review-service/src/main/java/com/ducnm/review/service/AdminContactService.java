package com.ducnm.review.service;

import com.ducnm.common.dto.PageResponse;
import com.ducnm.common.exception.BusinessException;
import com.ducnm.review.entity.Contact;
import com.ducnm.review.repository.ContactRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminContactService {

    private final ContactRepository repo;

    @Transactional(readOnly = true)
    public PageResponse<Contact> list(String trangThai, int page, int size) {
        Page<Contact> p = trangThai != null && !trangThai.isBlank()
                ? repo.findByTrangThai(trangThai, PageRequest.of(page, size))
                : repo.findAll(PageRequest.of(page, size));
        return PageResponse.<Contact>builder()
                .content(p.getContent())
                .page(p.getNumber())
                .size(p.getSize())
                .totalElements(p.getTotalElements())
                .totalPages(p.getTotalPages())
                .last(p.isLast())
                .build();
    }

    @Transactional
    public Contact get(Integer id) {
        Contact c = repo.findById(id).orElseThrow(() -> BusinessException.notFound("Contact", id));
        if ("NEW".equals(c.getTrangThai())) {
            c.setTrangThai("READ");
            c = repo.save(c);
        }
        return c;
    }

    @Transactional
    public Contact updateStatus(Integer id, String trangThai) {
        Contact c = repo.findById(id).orElseThrow(() -> BusinessException.notFound("Contact", id));
        c.setTrangThai(trangThai);
        return c;
    }

    @Transactional
    public void delete(Integer id) {
        if (!repo.existsById(id)) throw BusinessException.notFound("Contact", id);
        repo.deleteById(id);
    }
}
