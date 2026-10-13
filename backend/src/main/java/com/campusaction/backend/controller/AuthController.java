
package com.campusaction.backend.controller;

import com.campusaction.backend.dto.LoginRequest;
import com.campusaction.backend.dto.RegisterRequest;
import com.campusaction.backend.entity.User;
import com.campusaction.backend.repository.UserRepository;
import com.campusaction.backend.service.JwtService;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    // Student Registration
    @PostMapping("/register")
    public Map<String, Object> register(
            @RequestBody RegisterRequest request) {

        if (request.name() == null || request.name().isBlank()
                || request.email() == null || request.email().isBlank()
                || request.password() == null || request.password().isBlank()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Name, email, and password are required"
            );
        }

        if (userRepository.existsByEmail(request.email())) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Email is already registered"
            );
        }

        User user = new User();
        user.setName(request.name().trim());
        user.setEmail(request.email().trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setDepartment(request.department());
        user.setYear(request.year());
        user.setRole("STUDENT");

        User savedUser = userRepository.save(user);

        return Map.of(
            "message", "Registration successful",
            "id", savedUser.getId(),
            "name", savedUser.getName(),
            "email", savedUser.getEmail(),
            "role", savedUser.getRole()
        );
    }

    // Student Login
    @PostMapping("/login")
    public Map<String, Object> login(
            @RequestBody LoginRequest request) {

        if (request.email() == null || request.email().isBlank()
                || request.password() == null
                || request.password().isBlank()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Email and password are required"
            );
        }

        User user = userRepository
            .findByEmail(request.email().trim().toLowerCase())
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Invalid email or password"
            ));

        if (!passwordEncoder.matches(
                request.password(), user.getPassword())) {
            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Invalid email or password"
            );
        }

        String token = jwtService.generateToken(user.getEmail());

        return Map.of(
            "message", "Login successful",
            "token", token,
            "id", user.getId(),
            "name", user.getName(),
            "email", user.getEmail(),
            "role", user.getRole()
        );
    }
}
