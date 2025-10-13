package org.example.backend.controller;

import org.example.backend.dto.LoginRequest;
import org.example.backend.dto.LoginResponse;
import org.example.backend.dto.SignupRequest;
import org.example.backend.dto.SignupResponse;
import org.example.backend.model.Role;
import org.example.backend.model.User;
import org.example.backend.repository.UserRepository;
import org.example.backend.security.JwtTokenProvider;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authManager;
    private final JwtTokenProvider tokenProvider;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthController(UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          AuthenticationManager authManager,
                          JwtTokenProvider tokenProvider, JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authManager = authManager;
        this.tokenProvider = tokenProvider;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.username(), request.password()));
        String token = tokenProvider.createToken(auth.getName());
        return ResponseEntity.ok(new LoginResponse(token));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest request) {
        if (userRepository.findByUsername(request.username()).isPresent()) {
            return ResponseEntity.badRequest().body("Username is already taken.");
        }

        Role roleEnum;
        try {
            roleEnum = Role.valueOf(request.role()); // ✅ Convert String to Enum
        } catch (NullPointerException e) {
            return ResponseEntity.badRequest().body("No role Provided");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid role: " + request.role());
        }

        User user = new User(
                request.username(),
                passwordEncoder.encode(request.password()),
                roleEnum,
                request.name()
        );

        try {
            userRepository.save(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }

        String token = jwtTokenProvider.createToken(user.getUsername());
        return ResponseEntity.ok(new SignupResponse(token));
    }
}
