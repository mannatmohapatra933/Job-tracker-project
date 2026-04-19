package com.example.demo;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    public AuthController(AuthService authService, UserRepository userRepository, JwtService jwtService) {
        this.authService = authService;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    // Step 1: Register → sends OTP, does NOT return a token yet
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            authService.register(request);
            return ResponseEntity.ok(Map.of("message", "OTP sent to " + request.getEmail()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        }
    }

    // Step 2: Verify OTP → returns JWT token
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> body) {
        try {
            String email = body.get("email");
            String otp = body.get("otp");
            AuthResponse response = authService.verifyOtp(email, otp);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        }
    }

    // Resend OTP
    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(@RequestBody Map<String, String> body) {
        try {
            authService.resendOtp(body.get("email"));
            return ResponseEntity.ok(Map.of("message", "OTP resent successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            return ResponseEntity.ok(authService.login(request));
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/validate")
    public ResponseEntity<?> validate(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || authHeader.isEmpty()) {
            return ResponseEntity.status(401).body("No token provided");
        }
        String token = jwtService.extractTokenFromHeader(authHeader);
        String email = jwtService.extractEmail(token);
        if (email == null) return ResponseEntity.status(401).body("Invalid token");
        return ResponseEntity.ok(email);
    }

    @GetMapping("/me")
    public ResponseEntity<User> me(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || authHeader.isEmpty()) return ResponseEntity.status(401).build();
        String token = jwtService.extractTokenFromHeader(authHeader);
        String email = jwtService.extractEmail(token);
        if (email == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(userRepository.findByEmail(email).orElseThrow());
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        try {
            authService.initiatePasswordReset(body.get("email"));
            return ResponseEntity.ok(Map.of("message", "Reset OTP sent to your email."));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        try {
            authService.completePasswordReset(body.get("email"), body.get("otp"), body.get("newPassword"));
            return ResponseEntity.ok(Map.of("message", "Password reset successful. Please login."));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/system/stats")
    public ResponseEntity<?> getSystemStats() {
        long count = userRepository.count();
        return ResponseEntity.ok(Map.of("totalUsers", count));
    }
}
