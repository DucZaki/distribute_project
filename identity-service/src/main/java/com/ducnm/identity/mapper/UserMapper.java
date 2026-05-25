package com.ducnm.identity.mapper;

import com.ducnm.identity.dto.AuthDtos.UserSummary;
import com.ducnm.identity.dto.UserDtos.UserResponse;
import com.ducnm.identity.entity.NguoiDung;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserResponse toResponse(NguoiDung user);

    UserSummary toSummary(NguoiDung user);
}
