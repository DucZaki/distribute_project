package com.ducnm.review.service;

import com.ducnm.common.dto.ApiResponse;
import com.ducnm.common.dto.PageResponse;
import com.ducnm.common.exception.BusinessException;
import com.ducnm.review.client.IdentityClient;
import com.ducnm.review.client.TourClient;
import com.ducnm.review.dto.ReviewDtos.ReviewResponse;
import com.ducnm.review.dto.ReviewDtos.TourReviewSummary;
import com.ducnm.review.entity.DanhGia;
import com.ducnm.review.repository.DanhGiaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminReviewService {

    private final DanhGiaRepository repo;
    private final IdentityClient identityClient;
    private final TourClient tourClient;

    @Transactional(readOnly = true)
    public List<TourReviewSummary> toursWithReviews(String sort) {
        List<Object[]> rows = repo.aggregateByTour();
        List<TourReviewSummary> tours = new ArrayList<>();
        for (Object[] row : rows) {
            Integer tourId = ((Number) row[0]).intValue();
            double avg = row[1] instanceof Number n ? n.doubleValue() : 0.0;
            long total = row[2] instanceof Number n ? n.longValue() : 0L;
            long positive = row[3] instanceof Number n ? n.longValue() : 0L;
            long positivePct = total > 0 ? (positive * 100 / total) : 0L;

            String tieuDe = "Tour #" + tourId;
            String hinhAnh = null;
            try {
                ApiResponse<TourClient.TourBrief> res = tourClient.getTour(tourId);
                if (res != null && res.getData() != null) {
                    if (res.getData().tieuDe() != null) {
                        tieuDe = res.getData().tieuDe().trim();
                    }
                    hinhAnh = res.getData().hinhAnh();
                }
            } catch (Exception ex) {
                log.warn("Cannot resolve tour tourId={}: {}", tourId, ex.getMessage());
            }

            tours.add(TourReviewSummary.builder()
                    .tourId(tourId)
                    .tieuDe(tieuDe)
                    .hinhAnh(hinhAnh)
                    .avgRating(avg)
                    .totalReviews(total)
                    .positivePercentage(positivePct)
                    .build());
        }

        Comparator<TourReviewSummary> cmp = Comparator.comparingDouble(TourReviewSummary::getAvgRating).reversed();
        if ("ratingAsc".equals(sort)) {
            cmp = Comparator.comparingDouble(TourReviewSummary::getAvgRating);
        } else if ("ratingDesc".equals(sort)) {
            cmp = Comparator.comparingDouble(TourReviewSummary::getAvgRating).reversed();
        }
        return tours.stream().sorted(cmp).toList();
    }

    @Transactional(readOnly = true)
    public PageResponse<ReviewResponse> list(
            Integer tourId, Integer diem, String hoTen, String sort, int page, int size) {
        boolean nameFilter = hoTen != null && !hoTen.isBlank();
        if (tourId != null && nameFilter) {
            return listWithNameFilter(tourId, diem, hoTen.trim(), sort, page, size);
        }

        Sort sortOpt = Sort.by(Sort.Direction.DESC, "createdAt");
        if ("scoreAsc".equals(sort)) {
            sortOpt = Sort.by(Sort.Direction.ASC, "diem");
        } else if ("scoreDesc".equals(sort)) {
            sortOpt = Sort.by(Sort.Direction.DESC, "diem");
        }
        Pageable pageable = PageRequest.of(page, size, sortOpt);

        Page<DanhGia> p;
        if (tourId != null && diem != null) {
            p = repo.findByIdChuyenDiAndDiem(tourId, diem, pageable);
        } else if (tourId != null) {
            p = repo.findByIdChuyenDi(tourId, pageable);
        } else {
            p = repo.findAll(pageable);
        }
        return toPageResponse(p, enrich(p.getContent()));
    }

    private PageResponse<ReviewResponse> listWithNameFilter(
            Integer tourId, Integer diem, String hoTen, String sort, int page, int size) {
        List<DanhGia> all = repo.findByIdChuyenDi(tourId);
        if (diem != null) {
            all = all.stream().filter(d -> Objects.equals(d.getDiem(), diem)).toList();
        }
        List<ReviewResponse> enriched = enrich(all);
        String q = hoTen.toLowerCase(Locale.ROOT);
        List<ReviewResponse> filtered = enriched.stream()
                .filter(r -> matchesName(r, q))
                .sorted(reviewComparator(sort))
                .toList();

        int from = Math.min(page * size, filtered.size());
        int to = Math.min(from + size, filtered.size());
        List<ReviewResponse> slice = filtered.subList(from, to);
        int totalPages = size > 0 ? (int) Math.ceil((double) filtered.size() / size) : 1;

        return PageResponse.<ReviewResponse>builder()
                .content(slice)
                .page(page)
                .size(size)
                .totalElements(filtered.size())
                .totalPages(Math.max(totalPages, 1))
                .last(page >= totalPages - 1)
                .build();
    }

    private static boolean matchesName(ReviewResponse r, String q) {
        if (r.getHoTen() != null && r.getHoTen().toLowerCase(Locale.ROOT).contains(q)) {
            return true;
        }
        return r.getTenDangNhap() != null && r.getTenDangNhap().toLowerCase(Locale.ROOT).contains(q);
    }

    private static Comparator<ReviewResponse> reviewComparator(String sort) {
        if ("scoreAsc".equals(sort)) {
            return Comparator.comparingInt(ReviewResponse::getDiem);
        }
        if ("scoreDesc".equals(sort)) {
            return Comparator.comparingInt(ReviewResponse::getDiem).reversed();
        }
        return Comparator.comparing(
                ReviewResponse::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder()));
    }

    private PageResponse<ReviewResponse> toPageResponse(Page<DanhGia> p, List<ReviewResponse> content) {
        return PageResponse.<ReviewResponse>builder()
                .content(content)
                .page(p.getNumber())
                .size(p.getSize())
                .totalElements(p.getTotalElements())
                .totalPages(p.getTotalPages())
                .last(p.isLast())
                .build();
    }

    private List<ReviewResponse> enrich(List<DanhGia> reviews) {
        if (reviews.isEmpty()) {
            return List.of();
        }
        Map<Integer, IdentityClient.UserBrief> users = resolveUsers(reviews);
        Map<Integer, String> tourTitles = resolveTourTitles(reviews);
        return reviews.stream()
                .map(r -> {
                    IdentityClient.UserBrief u = users.get(r.getIdNguoiDung());
                    String hoTen = u != null ? firstNonBlank(u.hoTen(), u.tenDangNhap(), u.email()) : null;
                    String tenDangNhap = u != null ? u.tenDangNhap() : null;
                    return ReviewResponse.builder()
                            .id(r.getId())
                            .idChuyenDi(r.getIdChuyenDi())
                            .idNguoiDung(r.getIdNguoiDung())
                            .hoTen(hoTen)
                            .tenDangNhap(tenDangNhap)
                            .diem(r.getDiem())
                            .noiDung(r.getNoiDung())
                            .createdAt(r.getCreatedAt())
                            .tourTitle(tourTitles.get(r.getIdChuyenDi()))
                            .build();
                })
                .toList();
    }

    private Map<Integer, IdentityClient.UserBrief> resolveUsers(List<DanhGia> reviews) {
        Set<Integer> userIds = reviews.stream()
                .map(DanhGia::getIdNguoiDung)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        Map<Integer, IdentityClient.UserBrief> result = new HashMap<>();
        for (Integer userId : userIds) {
            try {
                ApiResponse<IdentityClient.UserBrief> res = identityClient.getUser(userId);
                if (res != null && res.getData() != null) {
                    result.put(userId, res.getData());
                }
            } catch (Exception ex) {
                log.warn("Cannot resolve reviewer userId={}: {}", userId, ex.getMessage());
            }
        }
        return result;
    }

    private Map<Integer, String> resolveTourTitles(List<DanhGia> reviews) {
        Set<Integer> tourIds = reviews.stream()
                .map(DanhGia::getIdChuyenDi)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        Map<Integer, String> result = new HashMap<>();
        for (Integer tourId : tourIds) {
            try {
                ApiResponse<TourClient.TourBrief> res = tourClient.getTour(tourId);
                if (res != null && res.getData() != null && res.getData().tieuDe() != null) {
                    result.put(tourId, res.getData().tieuDe().trim());
                }
            } catch (Exception ex) {
                log.warn("Cannot resolve tour title tourId={}: {}", tourId, ex.getMessage());
            }
        }
        return result;
    }

    private static String firstNonBlank(String... values) {
        for (String v : values) {
            if (v != null && !v.isBlank()) {
                return v;
            }
        }
        return null;
    }

    @Transactional
    public void delete(Integer id) {
        if (!repo.existsById(id)) throw BusinessException.notFound("Review", id);
        repo.deleteById(id);
    }
}
