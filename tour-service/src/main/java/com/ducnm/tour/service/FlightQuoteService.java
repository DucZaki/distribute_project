package com.ducnm.tour.service;

import com.ducnm.common.dto.ApiResponse;
import com.ducnm.common.exception.BusinessException;
import com.ducnm.tour.client.IntegrationClient;
import com.ducnm.tour.dto.FlightQuoteResponse;
import com.ducnm.tour.entity.ChuyenDi;
import com.ducnm.tour.entity.DiemDon;
import com.ducnm.tour.entity.DiemDen;
import com.ducnm.tour.entity.NgayKhoiHanh;
import com.ducnm.tour.repository.ChuyenDiRepository;
import com.ducnm.tour.repository.NgayKhoiHanhRepository;
import com.ducnm.tour.util.AirportIata;
import com.ducnm.tour.util.DomesticTransport;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.Map;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class FlightQuoteService {

    private final ChuyenDiRepository tourRepo;
    private final NgayKhoiHanhRepository scheduleRepo;
    private final IntegrationClient integrationClient;

    @Cacheable(value = "flight-quote", key = "#tourId + ':' + #nkhId + ':' + #diemDonId", condition = "!#refresh")
    @Transactional(readOnly = true)
    public FlightQuoteResponse quote(Integer tourId, Integer nkhId, Integer diemDonId, boolean refresh) {
        ChuyenDi tour = tourRepo.findDetailedById(tourId)
                .orElseThrow(() -> BusinessException.notFound("Tour", tourId));
        NgayKhoiHanh schedule = scheduleRepo.findByIdAndChuyenDi_Id(nkhId, tourId)
                .orElseThrow(() -> BusinessException.notFound("Ngày khởi hành", nkhId));

        DiemDon diemDon = resolveDiemDon(tour, diemDonId);
        DiemDen diemDen = tour.getDiemDen();
        String destName = diemDen != null ? diemDen.getTen() : tour.getTieuDe();

        LocalDate departDate = schedule.getNgayKhoiHanh();
        LocalDate returnDate = schedule.getNgayKetThuc();
        BigDecimal tourPrice = tour.getGia() != null ? tour.getGia() : BigDecimal.ZERO;

        if (diemDen != null && DomesticTransport.useDomesticBus(diemDen)) {
            return buildBusQuote(tourPrice, diemDon.getTen(), destName, departDate, returnDate);
        }

        String origin = AirportIata.resolve(diemDon.getTen())
                .orElseThrow(() -> BusinessException.badRequest("Chưa có mã sân bay cho điểm đón: " + diemDon.getTen()));

        String destination = AirportIata.resolve(destName)
                .orElseThrow(() -> BusinessException.badRequest(
                        "Điểm đến " + destName + " không có sân bay. Tour nội địa sẽ dùng xe khách."));

        return buildFlightQuote(tourId, tourPrice, origin, destination, departDate, returnDate);
    }

    private FlightQuoteResponse buildBusQuote(
            BigDecimal tourPrice,
            String pickupName,
            String destName,
            LocalDate departDate,
            LocalDate returnDate) {
        BigDecimal fare = DomesticTransport.BUS_FARE_VND;
        boolean roundTrip = returnDate != null && returnDate.isAfter(departDate);
        BigDecimal giaVeDi = fare;
        BigDecimal giaVeVe = roundTrip ? fare : BigDecimal.ZERO;
        BigDecimal tongGiaVe = giaVeDi.add(giaVeVe);
        BigDecimal unitPrice = tourPrice.add(tongGiaVe).setScale(0, RoundingMode.HALF_UP);

        return FlightQuoteResponse.builder()
                .available(true)
                .transportMode("BUS")
                .transportLabel("Xe khách liên tỉnh")
                .unitPrice(unitPrice)
                .giaVeDi(giaVeDi)
                .giaVeVe(giaVeVe)
                .tongGiaVe(tongGiaVe)
                .maChuyenBayDi("XE-BUS")
                .maChuyenBayVe(roundTrip ? "XE-BUS" : null)
                .gioBayDi("06:00")
                .gioBayVe(roundTrip ? "14:00" : null)
                .gioDenDi("12:00")
                .gioDenVe(roundTrip ? "22:00" : null)
                .ngayDi(departDate.toString())
                .ngayVe(returnDate != null ? returnDate.toString() : null)
                .originCode(pickupName)
                .destinationCode(destName)
                .message(null)
                .build();
    }

    private FlightQuoteResponse buildFlightQuote(
            Integer tourId,
            BigDecimal tourPrice,
            String origin,
            String destination,
            LocalDate departDate,
            LocalDate returnDate) {
        BigDecimal giaVeDi = BigDecimal.ZERO;
        BigDecimal giaVeVe = BigDecimal.ZERO;
        String maChuyenBayDi = null;
        String maChuyenBayVe = null;
        String gioBayDi = null;
        String gioBayVe = null;
        String gioDenDi = null;
        String gioDenVe = null;
        boolean flightAvailable = false;
        String message = null;

        try {
            ApiResponse<Map<String, Object>> res = integrationClient.cheapestFlight(
                    origin, destination, departDate.toString());
            Map<String, Object> data = res != null ? res.getData() : null;
            if (data != null && Boolean.TRUE.equals(data.get("available"))) {
                flightAvailable = true;
                giaVeDi = toBigDecimal(data.get("price"));
                maChuyenBayDi = stringVal(data.get("flightNumber"));
                gioBayDi = formatTime(stringVal(data.get("departureTime")));
                gioDenDi = formatTime(stringVal(data.get("arrivalTime")));
            } else if (data != null && Boolean.TRUE.equals(data.get("fallback"))) {
                message = stringVal(data.get("message"));
                if (message == null || message.isBlank()) {
                    message = "Không lấy được giá vé Amadeus.";
                }
            } else {
                message = "Không có chuyến bay cho tuyến " + origin + " → " + destination + " ngày " + departDate;
            }
        } catch (Exception e) {
            log.warn("Flight quote failed tour={} {}->{}: {}", tourId, origin, destination, e.getMessage());
            message = "Dịch vụ vé máy bay tạm thời không khả dụng.";
        }

        if (returnDate != null && returnDate.isAfter(departDate) && flightAvailable) {
            try {
                ApiResponse<Map<String, Object>> ret = integrationClient.cheapestFlight(
                        destination, origin, returnDate.toString());
                Map<String, Object> retData = ret != null ? ret.getData() : null;
                if (retData != null && Boolean.TRUE.equals(retData.get("available"))) {
                    giaVeVe = toBigDecimal(retData.get("price"));
                    maChuyenBayVe = stringVal(retData.get("flightNumber"));
                    gioBayVe = formatTime(stringVal(retData.get("departureTime")));
                    gioDenVe = formatTime(stringVal(retData.get("arrivalTime")));
                }
            } catch (Exception e) {
                log.warn("Return flight quote failed: {}", e.getMessage());
            }
        }

        BigDecimal tongGiaVe = giaVeDi.add(giaVeVe);
        BigDecimal unitPrice = tourPrice.add(tongGiaVe).setScale(0, RoundingMode.HALF_UP);

        return FlightQuoteResponse.builder()
                .available(flightAvailable)
                .transportMode("FLIGHT")
                .transportLabel("Máy bay")
                .unitPrice(unitPrice)
                .giaVeDi(giaVeDi)
                .giaVeVe(giaVeVe)
                .tongGiaVe(tongGiaVe)
                .maChuyenBayDi(maChuyenBayDi)
                .maChuyenBayVe(maChuyenBayVe)
                .gioBayDi(gioBayDi)
                .gioBayVe(gioBayVe)
                .gioDenDi(gioDenDi)
                .gioDenVe(gioDenVe)
                .ngayDi(departDate.toString())
                .ngayVe(returnDate != null ? returnDate.toString() : null)
                .originCode(origin)
                .destinationCode(destination)
                .message(message)
                .build();
    }

    private DiemDon resolveDiemDon(ChuyenDi tour, Integer diemDonId) {
        if (diemDonId != null && tour.getDiemDons() != null) {
            return tour.getDiemDons().stream()
                    .filter(d -> d.getId().equals(diemDonId))
                    .findFirst()
                    .orElseThrow(() -> BusinessException.notFound("Điểm đón", diemDonId));
        }
        if (tour.getDiemDonDefault() != null) {
            return tour.getDiemDonDefault();
        }
        Set<DiemDon> dons = tour.getDiemDons();
        if (dons != null && !dons.isEmpty()) {
            return dons.iterator().next();
        }
        throw BusinessException.badRequest("Tour chưa có điểm đón");
    }

    private static BigDecimal toBigDecimal(Object v) {
        if (v == null) return BigDecimal.ZERO;
        return BigDecimal.valueOf(Double.parseDouble(String.valueOf(v))).setScale(0, RoundingMode.HALF_UP);
    }

    private static String stringVal(Object v) {
        return v == null ? null : String.valueOf(v);
    }

    private static String formatTime(String iso) {
        if (iso == null || iso.length() < 16) return iso;
        return iso.substring(11, 16);
    }
}
