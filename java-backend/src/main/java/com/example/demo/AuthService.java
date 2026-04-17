package com.example.demo;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final OtpTokenRepository otpTokenRepository;
    private final EmailService emailService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       JwtService jwtService, OtpTokenRepository otpTokenRepository,
                       EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.otpTokenRepository = otpTokenRepository;
        this.emailService = emailService;
    }

    // Step 1: Register — save unverified user and send OTP
    @Transactional
    public void register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            // If user exists but is unverified, allow re-registration by resending OTP
            User existing = userRepository.findByEmail(request.getEmail()).orElseThrow();
            if (existing.isVerified()) {
                throw new RuntimeException("Email already registered. Please login.");
            }
            // Re-send OTP for unverified user
            sendOtp(request.getEmail());
            return;
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setVerified(false);
        userRepository.save(user);

        sendOtp(request.getEmail());
    }

    // Step 2: Verify OTP — mark user verified and return JWT
    @Transactional
    public AuthResponse verifyOtp(String email, String otp) {
        OtpToken token = otpTokenRepository.findTopByEmailOrderByIdDesc(email)
                .orElseThrow(() -> new RuntimeException("No OTP found for this email."));

        if (token.isUsed()) {
            throw new RuntimeException("OTP already used. Please request a new one.");
        }
        if (LocalDateTime.now().isAfter(token.getExpiresAt())) {
            throw new RuntimeException("OTP has expired. Please request a new one.");
        }
        if (!token.getOtp().equals(otp)) {
            throw new RuntimeException("Invalid OTP. Please check your email.");
        }

        // Mark OTP as used
        token.setUsed(true);
        otpTokenRepository.save(token);

        // Mark user as verified
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found."));
        user.setVerified(true);
        userRepository.save(user);

        String jwtToken = jwtService.generateToken(user.getEmail());
        return new AuthResponse(jwtToken, user.getId(), user.getEmail(), user.getFullName());
    }

    // Resend OTP
    @Transactional
    public void resendOtp(String email) {
        if (!userRepository.existsByEmail(email)) {
            throw new RuntimeException("No account found with this email.");
        }
        sendOtp(email);
    }

    // Login
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        if (!user.isVerified()) {
            throw new RuntimeException("Account not verified. Please check your email for OTP.");
        }

        String token = jwtService.generateToken(user.getEmail());
        return new AuthResponse(token, user.getId(), user.getEmail(), user.getFullName());
    }

    // Internal helper to generate and send OTP
    private void sendOtp(String email) {
        // Delete any old OTPs for this email
        otpTokenRepository.deleteByEmail(email);

        String otp = String.format("%06d", new Random().nextInt(999999));
        OtpToken otpToken = new OtpToken(email, otp, LocalDateTime.now().plusMinutes(10));
        otpTokenRepository.save(otpToken);

        emailService.sendOtpEmail(email, otp);
    }
}
