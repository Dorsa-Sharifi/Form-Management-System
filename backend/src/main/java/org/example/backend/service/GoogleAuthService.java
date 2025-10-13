package org.example.backend.service;

import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import io.jsonwebtoken.security.Keys;
import org.example.backend.model.AuthProvider;
import org.example.backend.model.Role;
import org.example.backend.model.User;
import org.example.backend.repository.UserRepository;
import org.example.backend.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.lang.Nullable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.security.Key;
import java.text.ParseException;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

@Service
public class GoogleAuthService {
    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final RestTemplate rest;

    @Value("${google.client-id}")
    private String clientId;

    @Value("${google.client-secret}")
    private String clientSecret;

    @Value("${google.redirect-uri}")
    private String redirectUri;

    public GoogleAuthService(UserRepository users,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtProvider) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.rest = new RestTemplate();
    }

    public User getOrCreateUser(String access_code) throws RestClientException {
        String tokenEndpoint = "https://oauth2.googleapis.com/token";

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("client_id", clientId);
        params.add("client_secret", clientSecret);
        params.add("code", access_code);
        params.add("grant_type", "authorization_code");
        params.add("redirect_uri", redirectUri);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        HttpEntity<MultiValueMap<String, String>> tokenRequest = new HttpEntity<>(params, headers);

        ResponseEntity<Map> tokenResponse;

        tokenResponse = rest.postForEntity(tokenEndpoint, tokenRequest, Map.class);
        if (!tokenResponse.getStatusCode().is2xxSuccessful()) {
            return null;
        }

        Map body = tokenResponse.getBody();
        Object idToken = body.get("id_token");
        if (Objects.isNull(idToken)) {
            return null;
        }
        String sub, email, name;
        try {
            SignedJWT jwt = SignedJWT.parse((String) idToken);
            JWTClaimsSet c = jwt.getJWTClaimsSet();
            sub = c.getSubject();          // Google user ID
            email = c.getStringClaim("email");
            name = c.getStringClaim("name");
        } catch (ParseException e) {
            return null;
        }
        String randomPassword = UUID.randomUUID().toString();
        return users.findByUsername(sub)
                .orElseGet(() -> {
                    User u = new User();
                    u.setProvider(AuthProvider.GOOGLE);
                    u.setUsername(sub);
                    u.setPassword(passwordEncoder.encode(randomPassword));
                    u.setName(name);
                    u.setRole(Role.ROLE_USER);
                    return users.save(u);
                });
    }
}
