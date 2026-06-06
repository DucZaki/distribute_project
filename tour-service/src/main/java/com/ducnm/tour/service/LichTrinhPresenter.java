package com.ducnm.tour.service;

import com.ducnm.tour.dto.TourDtos.LichTrinhDto;
import com.ducnm.tour.entity.LichTrinh;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.regex.Pattern;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class LichTrinhPresenter {

    private static final Pattern MEAL_LINE = Pattern.compile("(?i).*(\\d+\\s*)?bữa.*");
    private static final Pattern SLEEP_LINE = Pattern.compile("(?i)^nghỉ đêm.*");

    public LichTrinhDto toDto(LichTrinh entity) {
        if (entity == null) {
            return null;
        }

        LichTrinhDto dto = LichTrinhDto.builder()
                .id(entity.getId())
                .ngayThu(entity.getNgayThu())
                .tieuDe(entity.getTieuDe())
                .hinhAnh(entity.getHinhAnh())
                .build();

        if (hasStructuredFields(entity)) {
            dto.setSoBuaAn(trimToNull(entity.getSoBuaAn()));
            dto.setHoatDongChinh(trimToNull(entity.getHoatDongChinh()));
            dto.setNghiDem(trimToNull(entity.getNghiDem()));
            dto.setMoTa(trimToNull(entity.getNoiDung()));
            dto.setNoiDungLines(splitLines(entity.getNoiDung()));
        } else {
            applyLegacyBlob(dto, entity.getMoTa());
        }

        if (dto.getHoatDongChinh() == null && !dto.getNoiDungLines().isEmpty()) {
            dto.setHoatDongChinh(dto.getNoiDungLines().get(0));
        }
        return dto;
    }

    public List<LichTrinhDto> toDtos(List<LichTrinh> entities) {
        if (entities == null || entities.isEmpty()) {
            return List.of();
        }
        return entities.stream()
                .filter(lt -> lt != null)
                .collect(Collectors.toMap(
                        lt -> lt.getId() != null ? lt.getId() : System.identityHashCode(lt),
                        Function.identity(),
                        (a, b) -> a,
                        LinkedHashMap::new))
                .values().stream()
                .sorted((a, b) -> Integer.compare(
                        a.getNgayThu() != null ? a.getNgayThu() : 0,
                        b.getNgayThu() != null ? b.getNgayThu() : 0))
                .map(this::toDto)
                .toList();
    }

    private static boolean hasStructuredFields(LichTrinh entity) {
        return isNotBlank(entity.getNoiDung())
                || isNotBlank(entity.getSoBuaAn())
                || isNotBlank(entity.getHoatDongChinh())
                || isNotBlank(entity.getNghiDem());
    }

    private void applyLegacyBlob(LichTrinhDto dto, String raw) {
        String text = normalizeNewlines(raw);
        if (text == null) {
            dto.setNoiDungLines(List.of());
            return;
        }

        List<String> lines = splitLines(text);
        List<String> content = new ArrayList<>();
        String nghiDem = null;
        String soBuaAn = null;

        for (String line : lines) {
            if (MEAL_LINE.matcher(line).matches()) {
                soBuaAn = line;
            } else if (SLEEP_LINE.matcher(line).matches()) {
                nghiDem = line.replaceFirst("(?i)^nghỉ đêm tại\\s*", "").trim();
                if (nghiDem.isEmpty()) {
                    nghiDem = line;
                }
            } else {
                content.add(line);
            }
        }

        dto.setSoBuaAn(soBuaAn);
        dto.setNghiDem(nghiDem);
        dto.setNoiDungLines(content);
        dto.setMoTa(text);
        if (!content.isEmpty()) {
            dto.setHoatDongChinh(content.get(0));
        }
    }

    private static List<String> splitLines(String text) {
        if (text == null || text.isBlank()) {
            return List.of();
        }
        return Arrays.stream(normalizeNewlines(text).split("\\r?\\n"))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }

    private static String normalizeNewlines(String text) {
        if (text == null) {
            return null;
        }
        return text.replace("rn", "\n").trim();
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String t = value.trim();
        return t.isEmpty() ? null : t;
    }

    private static boolean isNotBlank(String value) {
        return value != null && !value.isBlank();
    }
}
