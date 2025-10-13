package org.example.backend.dto;

public record SignupRequest(String username, String password, String phone, String role, String name) {
}
