package org.example.backend.controller;

import org.example.backend.model.CustomUserDetail;
import org.example.backend.model.User;
import org.example.backend.service.CustomUserDetailsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ApiController {

    @Autowired
    private CustomUserDetailsService userService;

    @GetMapping("/hello")
    public ResponseEntity<String> sayHello() {
        return ResponseEntity.ok("Hello from Spring Boot!");
    }

    @PostMapping("/echo")
    public ResponseEntity<String> echo(@RequestBody String message) {
        return ResponseEntity.ok("Echo: " + message);
    }

    @PostMapping("/me")
    public ResponseEntity<User> me(@AuthenticationPrincipal CustomUserDetail userDetails) {
        return ResponseEntity.ok(userDetails.getUser());
    }

    @GetMapping("/getallusersid")
    public ResponseEntity<List<Map<String, Object>>> getAllUsersId() {
        List<Map<String, Object>> userDetailsList = userService.getAllUsersId();
        return ResponseEntity.ok(userDetailsList);
    }
}
