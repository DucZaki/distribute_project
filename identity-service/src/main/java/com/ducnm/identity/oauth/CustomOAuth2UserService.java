package com.ducnm.identity.oauth;

import com.ducnm.identity.entity.NguoiDung;
import com.ducnm.identity.repository.NguoiDungRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final NguoiDungRepository repo;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest request) throws OAuth2AuthenticationException {
        OAuth2User oauthUser = super.loadUser(request);
        String registrationId = request.getClientRegistration().getRegistrationId();
        Map<String, Object> attributes = new HashMap<>(oauthUser.getAttributes());

        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");
        String provider = registrationId.toUpperCase();
        String providerId = (String) attributes.get("google".equals(registrationId) ? "sub" : "id");
        String tenDangNhap = email != null && !email.isBlank() ? email : registrationId + "_" + providerId;

        repo.findByTenDangNhap(tenDangNhap).orElseGet(() -> {
            String resolvedEmail = email;
            if (resolvedEmail == null || resolvedEmail.isBlank()) {
                resolvedEmail = tenDangNhap.contains("@") ? tenDangNhap : tenDangNhap + "@oauth.local";
            }
            NguoiDung user = NguoiDung.builder()
                    .tenDangNhap(tenDangNhap)
                    .email(resolvedEmail)
                    .hoTen(name)
                    .vaiTro("USER")
                    .provider(provider)
                    .enabled(true)
                    .build();
            return repo.save(user);
        });

        attributes.put("userNameKey", tenDangNhap);
        return new DefaultOAuth2User(
                Collections.singleton(new SimpleGrantedAuthority("ROLE_USER")),
                attributes,
                "userNameKey");
    }
}
