package com.ducnm.tour.mapper;

import com.ducnm.tour.dto.TourDtos.*;
import com.ducnm.tour.entity.*;
import org.mapstruct.*;

import java.util.List;
import java.util.Set;

@Mapper(componentModel = "spring")
public interface TourMapper {

    @Mapping(target = "phuongTien", source = "phuongTien")
    @Mapping(target = "noiLuuTru", source = "noiLuuTru")
    TourResponse toResponse(ChuyenDi entity);

    @Mapping(target = "diemDen", source = "diemDen")
    TourSummary toSummary(ChuyenDi entity);

    List<TourSummary> toSummaryList(List<ChuyenDi> entities);

    DiemDenSummary toDiemDenSummary(DiemDen e);

    @Mapping(target = "ten", source = "ten")
    SimpleRef toSimpleRef(PhuongTien e);

    SimpleRef noiLuuTruToSimpleRef(NoiLuuTru e);

    DiemDonDto toDiemDonDto(DiemDon e);

    Set<DiemDonDto> toDiemDonDtos(Set<DiemDon> e);

    @Mapping(target = "availableSeats", expression = "java(e.availableSeats())")
    NgayKhoiHanhDto toNgayDto(NgayKhoiHanh e);

    List<NgayKhoiHanhDto> toNgayDtos(List<NgayKhoiHanh> e);

    LichTrinhDto toLichTrinhDto(LichTrinh e);

    List<LichTrinhDto> toLichTrinhDtos(List<LichTrinh> e);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "chuyenDi", ignore = true)
    LichTrinh fromLichTrinhDto(LichTrinhDto dto);
}
