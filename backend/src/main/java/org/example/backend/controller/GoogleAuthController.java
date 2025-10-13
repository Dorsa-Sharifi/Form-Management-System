package org.example.backend.controller;

import org.example.backend.dto.*;
import org.example.backend.model.Role;
import org.example.backend.model.User;
import org.example.backend.repository.UserRepository;
import org.example.backend.security.JwtTokenProvider;
import org.example.backend.service.GoogleAuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class GoogleAuthController {
    private final JwtTokenProvider jwtTokenProvider;
    private final GoogleAuthService googleAuthService;

    public GoogleAuthController(UserRepository userRepository,
                            PasswordEncoder passwordEncoder,
                            AuthenticationManager authManager,
                            JwtTokenProvider tokenProvider,
                            JwtTokenProvider jwtTokenProvider,
                            GoogleAuthService googleAuthService) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.googleAuthService = googleAuthService;
    }


    @PostMapping("/google")
    public ResponseEntity<LoginResponse> login(@RequestBody GoogleLoginRequest request) {
        User user = googleAuthService.getOrCreateUser(request.code());
        String token = jwtTokenProvider.createToken(user.getUsername());
        return ResponseEntity.ok(new LoginResponse(token));
    }
}
