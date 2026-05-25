package com.ducnm.web.service;

import com.ducnm.web.view.CalendarDay;
import com.ducnm.web.view.ChuyenDiView;
import com.ducnm.web.view.ChuyenDiView.*;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.*;

@Component
@SuppressWarnings("unchecked")
public class TourViewMapper {

    public ChuyenDiView toView(Map<String, Object> raw) {
        if (raw == null) return null;
        ChuyenDiView v = new ChuyenDiView();
        v.setId(asInt(raw.get("id")));
        v.setTieuDe(asStr(raw.get("tieuDe")));
        v.setMoTa(asStr(raw.get("moTa")));
        v.setGia(asDecimal(raw.get("gia")));
        v.setNgayKhoiHanh(asDate(raw.get("ngayKhoiHanh")));
        v.setNgayKetThuc(asDate(raw.get("ngayKetThuc")));
        v.setHinhAnh(asStr(raw.get("hinhAnh")));
        v.setHighlight(asStr(raw.get("highlight")));
        v.setNoiBat(asBool(raw.get("noiBat")));

        Map<String, Object> diemDen = asMap(raw.get("diemDen"));
        if (diemDen != null) {
            DiemDenView dd = new DiemDenView();
            dd.setId(asInt(diemDen.get("id")));
            dd.setTen(asStr(diemDen.get("ten")));
            dd.setThanhPho(asStr(diemDen.get("ten")));
            dd.setQuocGia("Việt Nam");
            dd.setHinhAnh(asStr(diemDen.get("hinhAnh")));
            dd.setVungMien(asStr(diemDen.get("vungMien")));
            dd.setChauLuc(asStr(diemDen.get("chauLuc")) != null
                    ? asStr(diemDen.get("chauLuc")) : asStr(diemDen.get("vungMien")));
            v.setIdDiemDen(dd);
        }

        Map<String, Object> pt = asMap(raw.get("phuongTien"));
        if (pt != null) {
            PhuongTienView pv = new PhuongTienView();
            pv.setId(asInt(pt.get("id")));
            pv.setTen(asStr(pt.get("ten")));
            pv.setLoai(asStr(pt.get("loai")));
            pv.setHang(asStr(pt.get("ten")));
            v.setIdPhuongTien(pv);
        }

        Map<String, Object> diemDon = asMap(raw.get("diemDon"));
        if (diemDon != null) {
            DiemDonView d = new DiemDonView();
            d.setId(asInt(diemDon.get("id")));
            d.setTen(asStr(diemDon.get("ten")));
            d.setDiaChi(asStr(diemDon.get("diaChi")));
            d.setThanhPho(asStr(diemDon.get("thanhPho")));
            v.setIdDiemDon(d);
        }

        Map<String, Object> nlt = asMap(raw.get("noiLuuTru"));
        if (nlt != null) {
            NoiLuuTruView nv = new NoiLuuTruView();
            nv.setId(asInt(nlt.get("id")));
            nv.setTen(asStr(nlt.get("ten")));
            v.setIdNoiLuuTru(nv);
        }

        Object diemDons = raw.get("diemDons");
        if (diemDons instanceof Collection<?> col) {
            Set<DiemDonView> set = new LinkedHashSet<>();
            for (Object item : col) {
                Map<String, Object> m = asMap(item);
                if (m == null) continue;
                DiemDonView d = new DiemDonView();
                d.setId(asInt(m.get("id")));
                d.setTen(asStr(m.get("ten")));
                d.setDiaChi(asStr(m.get("diaChi")));
                d.setThanhPho(asStr(m.get("thanhPho")));
                set.add(d);
            }
            v.setDiemDons(set);
            if (!set.isEmpty()) {
                v.setIdDiemDon(set.iterator().next());
            }
        }

        Object lts = raw.get("lichTrinhs");
        if (lts instanceof List<?> list) {
            List<LichTrinhView> lichTrinhs = new ArrayList<>();
            for (Object item : list) {
                Map<String, Object> m = asMap(item);
                if (m == null) continue;
                LichTrinhView lt = new LichTrinhView();
                lt.setId(asInt(m.get("id")));
                lt.setNgayThu(asInt(m.get("ngayThu")));
                lt.setTieuDe(asStr(m.get("tieuDe")));
                lt.setMoTa(asStr(m.get("moTa")));
                lt.setHinhAnh(asStr(m.get("hinhAnh")));
                lt.setSoBuaAn(asStr(m.get("soBuaAn")));
                lt.setNoiDung(asStr(m.get("noiDung")) != null ? asStr(m.get("noiDung")) : asStr(m.get("moTa")));
                lt.setNghiDem(asStr(m.get("nghiDem")));
                lt.setHoatDongChinh(asStr(m.get("hoatDongChinh")));
                lichTrinhs.add(lt);
            }
            v.setLichTrinhs(lichTrinhs);
        }

        Object nkhs = raw.get("ngayKhoiHanhs");
        if (nkhs instanceof List<?> list) {
            List<NgayKhoiHanhView> schedules = new ArrayList<>();
            for (Object item : list) {
                schedules.add(toSchedule(asMap(item)));
            }
            v.setNgayKhoiHanhs(schedules);
        }
        return v;
    }

    public List<ChuyenDiView> toViewList(List<Map<String, Object>> raw) {
        if (raw == null) return List.of();
        return raw.stream().map(this::toView).filter(Objects::nonNull).toList();
    }

    public DiemDenView toDiemDenView(Map<String, Object> raw) {
        if (raw == null) return null;
        DiemDenView dd = new DiemDenView();
        dd.setId(asInt(raw.get("id")));
        dd.setTen(asStr(raw.get("ten")));
        dd.setThanhPho(asStr(raw.get("ten")));
        dd.setQuocGia("Việt Nam");
        dd.setHinhAnh(asStr(raw.get("hinhAnh")));
        dd.setVungMien(asStr(raw.get("vungMien")));
        dd.setChauLuc(asStr(raw.get("chauLuc")) != null ? asStr(raw.get("chauLuc")) : asStr(raw.get("vungMien")));
        return dd;
    }

    public NgayKhoiHanhView toSchedule(Map<String, Object> m) {
        if (m == null) return null;
        NgayKhoiHanhView n = new NgayKhoiHanhView();
        n.setId(asInt(m.get("id")));
        n.setNgayKhoiHanh(asDate(m.get("ngayKhoiHanh")));
        n.setNgayKetThuc(asDate(m.get("ngayKetThuc")));
        n.setSoChoToiDa(asInt(m.get("soChoToiDa")));
        n.setSoChoDaDat(asInt(m.get("soChoDaDat")));
        n.setAvailableSeats(asInt(m.get("availableSeats")));
        n.setGiaOverride(asDecimal(m.get("giaOverride")));
        if (n.getGiaOverride() != null) {
            n.setGiaVeDi(n.getGiaOverride().doubleValue());
            n.setTongGiaVe(n.getGiaOverride().doubleValue());
        }
        return n;
    }

    public List<CalendarDay> buildCalendar(int month, int year, String selectedDateStr,
                                           List<NgayKhoiHanhView> departureDates) {
        List<CalendarDay> days = new ArrayList<>();
        LocalDate today = LocalDate.now();
        LocalDate firstOfMonth = LocalDate.of(year, month, 1);
        LocalDate start = firstOfMonth.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate selectedDate = selectedDateStr != null && !selectedDateStr.isBlank()
                ? LocalDate.parse(selectedDateStr) : null;

        Map<LocalDate, NgayKhoiHanhView> departureMap = new HashMap<>();
        if (departureDates != null) {
            for (NgayKhoiHanhView nkh : departureDates) {
                if (nkh.getNgay() != null) departureMap.put(nkh.getNgay(), nkh);
            }
        }

        for (int i = 0; i < 42; i++) {
            LocalDate current = start.plusDays(i);
            CalendarDay day = new CalendarDay();
            day.setDate(current);
            day.setCurrentMonth(current.getMonthValue() == month);
            day.setPast(current.isBefore(today));
            NgayKhoiHanhView nkh = departureMap.get(current);
            if (nkh != null) {
                day.setHasDeparture(true);
                day.setNgayKhoiHanhId(nkh.getId());
                day.setFlightPrice(nkh.getTongGiaVe());
            }
            day.setSelected(selectedDate != null && selectedDate.equals(current));
            days.add(day);
        }
        return days;
    }

    private Map<String, Object> asMap(Object o) {
        return o instanceof Map ? (Map<String, Object>) o : null;
    }

    private String asStr(Object o) {
        return o == null ? null : String.valueOf(o);
    }

    private Integer asInt(Object o) {
        if (o == null) return null;
        if (o instanceof Number n) return n.intValue();
        return Integer.parseInt(o.toString());
    }

    private Boolean asBool(Object o) {
        if (o == null) return null;
        if (o instanceof Boolean b) return b;
        return Boolean.parseBoolean(o.toString());
    }

    private BigDecimal asDecimal(Object o) {
        if (o == null) return null;
        if (o instanceof BigDecimal bd) return bd;
        if (o instanceof Number n) return BigDecimal.valueOf(n.doubleValue());
        return new BigDecimal(o.toString());
    }

    private LocalDate asDate(Object o) {
        if (o == null) return null;
        if (o instanceof LocalDate d) return d;
        return LocalDate.parse(o.toString());
    }
}
