package com.ducnm.tour.service;

import com.ducnm.common.dto.PageResponse;
import com.ducnm.common.exception.BusinessException;
import com.ducnm.tour.client.BookingStatsClient;
import com.ducnm.tour.client.ReviewClient;
import com.ducnm.tour.dto.NearbyToursResponse;
import com.ducnm.tour.dto.NearbyToursResponse.NearbyTourItem;
import com.ducnm.tour.dto.TourDtos.*;
import com.ducnm.tour.entity.*;
import com.ducnm.tour.mapper.TourMapper;
import com.ducnm.tour.repository.*;
import com.ducnm.tour.specification.ChuyenDiSpecification;
import com.ducnm.tour.util.CityCoordinates;
import com.ducnm.tour.util.GeoUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TourService {

    /** Số tour hiển thị block "được yêu thích nhất" trên trang chủ. */
    public static final int HOME_FEATURED_LIMIT = 3;

    private final ChuyenDiRepository chuyenDiRepo;
    private final DiemDenRepository diemDenRepo;
    private final DiemDonRepository diemDonRepo;
    private final PhuongTienRepository phuongTienRepo;
    private final NoiLuuTruRepository noiLuuTruRepo;
    private final NgayKhoiHanhRepository ngayKhoiHanhRepo;
    private final LichTrinhRepository lichTrinhRepo;
    private final TourMapper mapper;
    private final LichTrinhPresenter lichTrinhPresenter;
    private final ReviewClient reviewClient;
    private final BookingStatsClient bookingStatsClient;

    @Cacheable(value = "tours", key = "#id")
    @Transactional(readOnly = true)
    public TourResponse getById(Integer id) {
        ChuyenDi tour = chuyenDiRepo.findDetailedById(id)
                .orElseThrow(() -> BusinessException.notFound("Tour", id));
        TourResponse response = mapper.toResponse(tour);
        response.setLichTrinhs(loadItineraryDtos(id));
        response.setDiemDons(mapper.toDiemDonDtos(tour.getDiemDons()));
        List<NgayKhoiHanh> bookable = ngayKhoiHanhRepo.findByChuyenDi_IdAndTrangThai(id, "ACTIVE").stream()
                .filter(n -> !n.getNgayKhoiHanh().isBefore(LocalDate.now()))
                .sorted(Comparator.comparing(NgayKhoiHanh::getNgayKhoiHanh))
                .toList();
        response.setNgayKhoiHanhs(mapper.toNgayDtos(bookable));
        return response;
    }

    @Transactional(readOnly = true)
    public List<TourSummary> getFeatured(int limit) {
        int cap = Math.min(Math.max(limit, 1), 12);
        List<TourSummary> list = mapper.toSummaryList(
                chuyenDiRepo.findAll(Sort.by(Sort.Direction.DESC, "id")));
        enrichStats(list);
        sortByMostBooked(list);
        return list.stream().limit(cap).toList();
    }

    @Transactional(readOnly = true)
    public PageResponse<TourSummary> search(SearchRequest req, int page, int size, String sort) {
        if (isPopularitySort(sort)) {
            List<ChuyenDi> all = chuyenDiRepo.findAll(ChuyenDiSpecification.filter(req));
            List<TourSummary> summaries = mapper.toSummaryList(all);
            enrichStats(summaries);
            sortByPopularity(summaries);
            return paginate(summaries, page, size);
        }
        Pageable pageable = PageRequest.of(page, size, Sort.by(parseSort(sort)));
        Page<ChuyenDi> result = chuyenDiRepo.findAll(ChuyenDiSpecification.filter(req), pageable);
        List<TourSummary> content = mapper.toSummaryList(result.getContent());
        enrichStats(content);
        return PageResponse.<TourSummary>builder()
                .content(content)
                .page(result.getNumber())
                .size(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .last(result.isLast())
                .build();
    }

    @CacheEvict(value = {"tours", "tours-featured", "tours-featured-v2"}, allEntries = true)
    @Transactional
    public TourResponse create(CreateTourRequest req) {
        DiemDen diemDen = diemDenRepo.findById(req.getIdDiemDen())
                .orElseThrow(() -> BusinessException.notFound("DiemDen", req.getIdDiemDen()));
        ChuyenDi tour = ChuyenDi.builder()
                .tieuDe(req.getTieuDe())
                .moTa(req.getMoTa())
                .gia(req.getGia())
                .ngayKhoiHanh(req.getNgayKhoiHanh())
                .ngayKetThuc(req.getNgayKetThuc())
                .diemDen(diemDen)
                .noiBat(Boolean.TRUE.equals(req.getNoiBat()))
                .hinhAnh(req.getHinhAnh())
                .highlight(req.getHighlight())
                .build();

        if (req.getIdPhuongTien() != null) {
            tour.setPhuongTien(phuongTienRepo.findById(req.getIdPhuongTien())
                    .orElseThrow(() -> BusinessException.notFound("PhuongTien", req.getIdPhuongTien())));
        }
        if (req.getIdNoiLuuTru() != null) {
            tour.setNoiLuuTru(noiLuuTruRepo.findById(req.getIdNoiLuuTru())
                    .orElseThrow(() -> BusinessException.notFound("NoiLuuTru", req.getIdNoiLuuTru())));
        }
        if (req.getIdDiemDonDefault() != null) {
            tour.setDiemDonDefault(diemDonRepo.findById(req.getIdDiemDonDefault())
                    .orElseThrow(() -> BusinessException.notFound("DiemDon", req.getIdDiemDonDefault())));
        }
        if (req.getDiemDonIds() != null && !req.getDiemDonIds().isEmpty()) {
            Set<DiemDon> diemDons = new HashSet<>(diemDonRepo.findAllById(req.getDiemDonIds()));
            tour.setDiemDons(diemDons);
        }

        ChuyenDi saved = chuyenDiRepo.save(tour);

        if (req.getLichTrinhs() != null) {
            ChuyenDi finalTour = saved;
            req.getLichTrinhs().forEach(lt -> {
                LichTrinh entity = mapper.fromLichTrinhDto(lt);
                entity.setChuyenDi(finalTour);
                finalTour.getLichTrinhs().add(entity);
            });
        }

        log.info("Created tour id={} title={}", saved.getId(), saved.getTieuDe());
        return mapper.toResponse(saved);
    }

    /**
     * Tour có điểm đón gần vị trí user — giống monolith {@code TourService#findNearbyTours}.
     */
    @Transactional(readOnly = true)
    public NearbyToursResponse findNearbyTours(
            Double lat, Double lng, String city, double radiusKm, int limit, int page) {
        int safeLimit = Math.max(1, Math.min(limit, 20));
        int safePage = Math.max(0, page);

        NearbyToursResponse.NearbyToursResponseBuilder result = NearbyToursResponse.builder()
                .tours(List.of())
                .inRange(false)
                .page(safePage)
                .limit(safeLimit)
                .total(0)
                .totalPages(0)
                .hasPrev(false)
                .hasNext(false)
                .count(0);

        if (lat == null || lng == null) {
            if (city == null || city.isBlank()) {
                return result.message("Thiếu vị trí").build();
            }
            Optional<double[]> coords = CityCoordinates.resolve(city);
            if (coords.isEmpty()) {
                return result.message("Chưa hỗ trợ thành phố này").build();
            }
            lat = coords.get()[0];
            lng = coords.get()[1];
        }

        List<DiemDon> diemDons = diemDonRepo.findAll();
        if (diemDons.isEmpty()) {
            return result.message("Chưa có điểm đón").build();
        }

        final double userLat = lat;
        final double userLng = lng;

        record RankedDon(DiemDon diemDon, double distanceKm) {
        }

        List<RankedDon> ranked = diemDons.stream()
                .map(d -> CityCoordinates.resolve(d.getTen())
                        .map(c -> new RankedDon(d, GeoUtils.haversineKm(userLat, userLng, c[0], c[1])))
                        .orElse(null))
                .filter(Objects::nonNull)
                .sorted(Comparator.comparingDouble(RankedDon::distanceKm))
                .toList();

        if (ranked.isEmpty()) {
            return result.message("Chưa có tọa độ cho điểm đón").build();
        }

        RankedDon nearest = ranked.get(0);
        double nearestDist = nearest.distanceKm();

        result.nearestDepartureCity(nearest.diemDon().getTen())
                .nearestDistanceKm(roundKm(nearestDist))
                .radiusKm(radiusKm);

        if (nearestDist > radiusKm) {
            return result.message(
                            "Không có điểm xuất phát tour trong bán kính " + (int) radiusKm + " km quanh bạn.")
                    .build();
        }

        result.departureCity(nearest.diemDon().getTen())
                .distanceKm(roundKm(nearestDist))
                .inRange(true);

        List<Integer> inRangeDonIds = ranked.stream()
                .filter(r -> r.distanceKm() <= radiusKm)
                .map(r -> r.diemDon().getId())
                .distinct()
                .toList();

        List<ChuyenDi> tours = inRangeDonIds.isEmpty()
                ? List.of()
                : chuyenDiRepo.findByDiemDonIdsAndBookable(inRangeDonIds, LocalDate.now());

        List<NearbyTourItem> allItems = tours.stream()
                .map(t -> toNearbyItem(t, userLat, userLng, nearestDist))
                .collect(Collectors.toList());
        enrichNearbyItems(allItems);
        sortNearbyByPopularity(allItems);

        int total = allItems.size();
        int totalPages = (int) Math.ceil(total / (double) safeLimit);
        if (totalPages > 0 && safePage > totalPages - 1) {
            safePage = totalPages - 1;
        }
        int from = safePage * safeLimit;
        int to = Math.min(from + safeLimit, total);
        List<NearbyTourItem> pageItems =
                (from >= 0 && from < to) ? allItems.subList(from, to) : List.of();

        NearbyToursResponse built = result.page(safePage)
                .limit(safeLimit)
                .total(total)
                .totalPages(totalPages)
                .hasPrev(safePage > 0)
                .hasNext(safePage + 1 < totalPages)
                .tours(pageItems)
                .count(pageItems.size())
                .build();

        if (pageItems.isEmpty()) {
            built.setMessage(
                    "Chưa có tour khả dụng xuất phát từ " + nearest.diemDon().getTen()
                            + " trong bán kính " + (int) radiusKm + " km.");
        }
        return built;
    }

    private NearbyTourItem toNearbyItem(ChuyenDi t, double userLat, double userLng, double fallbackDist) {
        String nearestDep = null;
        double best = Double.MAX_VALUE;
        Set<DiemDon> dons = t.getDiemDons() != null ? t.getDiemDons() : Set.of();
        if (t.getDiemDonDefault() != null) {
            dons = new HashSet<>(dons);
            dons.add(t.getDiemDonDefault());
        }
        for (DiemDon d : dons) {
            Optional<double[]> dc = CityCoordinates.resolve(d.getTen());
            if (dc.isEmpty()) {
                continue;
            }
            double dist = GeoUtils.haversineKm(userLat, userLng, dc.get()[0], dc.get()[1]);
            if (dist < best) {
                best = dist;
                nearestDep = d.getTen();
            }
        }
        if (nearestDep == null) {
            nearestDep = resolveTourDepartureCity(t).orElse(null);
            best = CityCoordinates.resolve(nearestDep)
                    .map(c -> GeoUtils.haversineKm(userLat, userLng, c[0], c[1]))
                    .orElse(fallbackDist);
        }
        String diemDen = t.getDiemDen() != null ? t.getDiemDen().getTen() : null;
        return NearbyTourItem.builder()
                .id(t.getId())
                .tieuDe(t.getTieuDe())
                .gia(t.getGia())
                .hinhAnh(t.getHinhAnh())
                .diemDon(nearestDep)
                .diemDen(diemDen)
                .distanceKm(roundKm(best))
                .noiBat(Boolean.TRUE.equals(t.getNoiBat()))
                .averageRating(0.0)
                .ratingCount(0L)
                .bookingCount(0L)
                .build();
    }

    private Optional<String> resolveTourDepartureCity(ChuyenDi tour) {
        if (tour.getDiemDonDefault() != null && tour.getDiemDonDefault().getTen() != null
                && !tour.getDiemDonDefault().getTen().isBlank()) {
            return Optional.of(tour.getDiemDonDefault().getTen());
        }
        return CityCoordinates.inferDepartureFromText(tour.getTieuDe());
    }

    private static double roundKm(double km) {
        return Math.round(km * 10.0) / 10.0;
    }

    @Transactional(readOnly = true)
    public PageResponse<TourSummary> listAdmin(String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        LocalDate today = LocalDate.now();
        Page<ChuyenDi> result = "completed".equalsIgnoreCase(status)
                ? chuyenDiRepo.findByNgayKetThucLessThan(today, pageable)
                : chuyenDiRepo.findByNgayKetThucGreaterThanEqualOrNgayKetThucIsNull(today, pageable);
        return PageResponse.<TourSummary>builder()
                .content(mapper.toSummaryList(result.getContent()))
                .page(result.getNumber())
                .size(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .last(result.isLast())
                .build();
    }

    @CacheEvict(value = {"tours", "tours-featured", "tours-featured-v2"}, allEntries = true)
    @Transactional
    public TourResponse update(Integer id, CreateTourRequest req) {
        ChuyenDi tour = chuyenDiRepo.findDetailedById(id)
                .orElseThrow(() -> BusinessException.notFound("Tour", id));
        if (req.getTieuDe() != null) tour.setTieuDe(req.getTieuDe());
        if (req.getMoTa() != null) tour.setMoTa(req.getMoTa());
        if (req.getGia() != null) tour.setGia(req.getGia());
        if (req.getNgayKhoiHanh() != null) tour.setNgayKhoiHanh(req.getNgayKhoiHanh());
        if (req.getNgayKetThuc() != null) tour.setNgayKetThuc(req.getNgayKetThuc());
        if (req.getHinhAnh() != null) tour.setHinhAnh(req.getHinhAnh());
        if (req.getHighlight() != null) tour.setHighlight(req.getHighlight());
        if (req.getNoiBat() != null) tour.setNoiBat(req.getNoiBat());
        if (req.getIdDiemDen() != null) {
            tour.setDiemDen(diemDenRepo.findById(req.getIdDiemDen())
                    .orElseThrow(() -> BusinessException.notFound("DiemDen", req.getIdDiemDen())));
        }
        if (req.getIdPhuongTien() != null) {
            tour.setPhuongTien(phuongTienRepo.findById(req.getIdPhuongTien())
                    .orElseThrow(() -> BusinessException.notFound("PhuongTien", req.getIdPhuongTien())));
        }
        if (req.getIdNoiLuuTru() != null) {
            tour.setNoiLuuTru(noiLuuTruRepo.findById(req.getIdNoiLuuTru())
                    .orElseThrow(() -> BusinessException.notFound("NoiLuuTru", req.getIdNoiLuuTru())));
        }
        if (req.getIdDiemDonDefault() != null) {
            tour.setDiemDonDefault(diemDonRepo.findById(req.getIdDiemDonDefault())
                    .orElseThrow(() -> BusinessException.notFound("DiemDon", req.getIdDiemDonDefault())));
        }
        if (req.getDiemDonIds() != null) {
            tour.getDiemDons().clear();
            if (!req.getDiemDonIds().isEmpty()) {
                tour.getDiemDons().addAll(new HashSet<>(diemDonRepo.findAllById(req.getDiemDonIds())));
            }
        }
        if (req.getLichTrinhs() != null) {
            List<LichTrinh> current = new ArrayList<>(lichTrinhRepo.findByChuyenDi_IdOrderByNgayThuAsc(id));
            tour.setLichTrinhs(current);
            tour.getLichTrinhs().clear();
            req.getLichTrinhs().forEach(lt -> {
                LichTrinh entity = mapper.fromLichTrinhDto(lt);
                entity.setChuyenDi(tour);
                tour.getLichTrinhs().add(entity);
            });
        }
        ChuyenDi saved = chuyenDiRepo.save(tour);
        TourResponse response = mapper.toResponse(saved);
        response.setLichTrinhs(loadItineraryDtos(id));
        response.setDiemDons(mapper.toDiemDonDtos(saved.getDiemDons()));
        return response;
    }

    @Transactional(readOnly = true)
    public TourFormOptions formOptions() {
        return TourFormOptions.builder()
                .destinations(diemDenRepo.findAll().stream().map(mapper::toDiemDenSummary).toList())
                .vehicles(phuongTienRepo.findDistinctLoai().stream().map(mapper::toPhuongTienSummary).toList())
                .pickups(diemDonRepo.findAll().stream().map(mapper::toDiemDonDto).toList())
                .accommodations(noiLuuTruRepo.findAll().stream()
                        .map(n -> NoiLuuTruSummary.builder().id(n.getId()).ten(n.getTen()).loai(n.getLoai()).build())
                        .toList())
                .build();
    }

    @CacheEvict(value = {"tours", "tours-featured", "tours-featured-v2"}, allEntries = true)
    @Transactional
    public void delete(Integer id) {
        if (!chuyenDiRepo.existsById(id)) {
            throw BusinessException.notFound("Tour", id);
        }
        chuyenDiRepo.deleteById(id);
    }

    private void enrichStats(List<TourSummary> tours) {
        for (TourSummary t : tours) {
            applyReviewStats(t.getId(), t::setAverageRating, t::setRatingCount);
            applyBookingStats(t.getId(), t::setBookingCount);
        }
    }

    private void enrichNearbyItems(List<NearbyTourItem> items) {
        for (NearbyTourItem item : items) {
            applyReviewStats(item.getId(), item::setAverageRating, item::setRatingCount);
            applyBookingStats(item.getId(), item::setBookingCount);
        }
    }

    private void applyReviewStats(
            Integer tourId,
            java.util.function.Consumer<Double> setAvg,
            java.util.function.Consumer<Long> setCount) {
        setAvg.accept(0.0);
        setCount.accept(0L);
        try {
            Map<String, Object> summary = reviewClient.summary(tourId).getData();
            if (summary != null) {
                Object avg = summary.get("averageRating");
                Object total = summary.get("totalReviews");
                if (avg instanceof Number n) {
                    setAvg.accept(n.doubleValue());
                }
                if (total instanceof Number n) {
                    setCount.accept(n.longValue());
                }
            }
        } catch (Exception ex) {
            log.debug("Review stats unavailable for tour {}: {}", tourId, ex.getMessage());
        }
    }

    private void applyBookingStats(Integer tourId, java.util.function.Consumer<Long> setCount) {
        setCount.accept(0L);
        try {
            Long count = bookingStatsClient.participantsByTour(tourId).getData();
            if (count != null) {
                setCount.accept(count);
            }
        } catch (Exception ex) {
            log.debug("Booking stats unavailable for tour {}: {}", tourId, ex.getMessage());
        }
    }

    private boolean isPopularitySort(String sort) {
        return sort == null || sort.isBlank() || "popular".equalsIgnoreCase(sort);
    }

    /** Trang chủ: nhiều người đặt nhất → đánh giá cao (không ưu tiên cờ HOT). */
    private void sortByMostBooked(List<TourSummary> tours) {
        tours.sort((a, b) -> compareMostBooked(
                a.getBookingCount(),
                a.getAverageRating(),
                a.getId(),
                b.getBookingCount(),
                b.getAverageRating(),
                b.getId()));
    }

    /** HOT trước → nhiều người đặt → điểm đánh giá cao. */
    private void sortByPopularity(List<TourSummary> tours) {
        tours.sort((a, b) -> comparePopularity(
                Boolean.TRUE.equals(a.getNoiBat()),
                a.getBookingCount(),
                a.getAverageRating(),
                a.getId(),
                Boolean.TRUE.equals(b.getNoiBat()),
                b.getBookingCount(),
                b.getAverageRating(),
                b.getId()));
    }

    private void sortNearbyByPopularity(List<NearbyTourItem> items) {
        items.sort((a, b) -> comparePopularity(
                Boolean.TRUE.equals(a.getNoiBat()),
                a.getBookingCount(),
                a.getAverageRating(),
                a.getId(),
                Boolean.TRUE.equals(b.getNoiBat()),
                b.getBookingCount(),
                b.getAverageRating(),
                b.getId()));
    }

    private static int compareMostBooked(
            Long bookingsA, Double ratingA, Integer idA,
            Long bookingsB, Double ratingB, Integer idB) {
        long bA = bookingsA != null ? bookingsA : 0L;
        long bB = bookingsB != null ? bookingsB : 0L;
        int booked = Long.compare(bB, bA);
        if (booked != 0) {
            return booked;
        }
        double rA = ratingA != null ? ratingA : 0.0;
        double rB = ratingB != null ? ratingB : 0.0;
        int rating = Double.compare(rB, rA);
        if (rating != 0) {
            return rating;
        }
        return Integer.compare(idB != null ? idB : 0, idA != null ? idA : 0);
    }

    private static int comparePopularity(
            boolean hotA, Long bookingsA, Double ratingA, Integer idA,
            boolean hotB, Long bookingsB, Double ratingB, Integer idB) {
        int hot = Boolean.compare(hotB, hotA);
        if (hot != 0) {
            return hot;
        }
        long bA = bookingsA != null ? bookingsA : 0L;
        long bB = bookingsB != null ? bookingsB : 0L;
        int booked = Long.compare(bB, bA);
        if (booked != 0) {
            return booked;
        }
        double rA = ratingA != null ? ratingA : 0.0;
        double rB = ratingB != null ? ratingB : 0.0;
        int rating = Double.compare(rB, rA);
        if (rating != 0) {
            return rating;
        }
        return Integer.compare(idB != null ? idB : 0, idA != null ? idA : 0);
    }

    private PageResponse<TourSummary> paginate(List<TourSummary> all, int page, int size) {
        int safeSize = Math.max(1, size);
        int total = all.size();
        int totalPages = total == 0 ? 0 : (int) Math.ceil(total / (double) safeSize);
        int safePage = Math.max(0, page);
        if (totalPages > 0 && safePage > totalPages - 1) {
            safePage = totalPages - 1;
        }
        int from = safePage * safeSize;
        int to = Math.min(from + safeSize, total);
        List<TourSummary> content = (from >= 0 && from < to) ? all.subList(from, to) : List.of();
        return PageResponse.<TourSummary>builder()
                .content(content)
                .page(safePage)
                .size(safeSize)
                .totalElements(total)
                .totalPages(totalPages)
                .last(totalPages == 0 || safePage >= totalPages - 1)
                .build();
    }

    private List<LichTrinhDto> loadItineraryDtos(Integer tourId) {
        return lichTrinhPresenter.toDtos(lichTrinhRepo.findByChuyenDi_IdOrderByNgayThuAsc(tourId));
    }

    private Sort.Order parseSort(String sort) {
        if (sort == null || sort.isBlank() || "popular".equalsIgnoreCase(sort)) {
            return Sort.Order.desc("id");
        }
        if ("priceAsc".equalsIgnoreCase(sort)) return Sort.Order.asc("gia");
        if ("priceDesc".equalsIgnoreCase(sort)) return Sort.Order.desc("gia");
        String[] parts = sort.split(",");
        Sort.Direction dir = parts.length > 1 && "asc".equalsIgnoreCase(parts[1])
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        return new Sort.Order(dir, parts[0]);
    }
}
