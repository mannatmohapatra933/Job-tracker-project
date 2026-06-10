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

    @Transactional
    public void register(RegisterRequest request) {
        System.out.println("DEBUG: Register request received for: " + request.getEmail());
        if (userRepository.existsByEmail(request.getEmail())) {
            System.out.println("DEBUG: User exists, checking verification status...");
            User existing = userRepository.findByEmail(request.getEmail()).orElseThrow();
            if (existing.isVerified()) {
                throw new RuntimeException("Email already registered. Please login.");
            }
            System.out.println("DEBUG: User unverified, resending OTP...");
            sendOtp(request.getEmail());
            return;
        }

        System.out.println("DEBUG: Creating new user...");
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setVerified(false);
        userRepository.save(user);

        System.out.println("DEBUG: User saved, calling sendOtp...");
        sendOtp(request.getEmail());
    }

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

        token.setUsed(true);
        otpTokenRepository.save(token);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found."));
        user.setVerified(true);
        userRepository.save(user);

        String jwtToken = jwtService.generateToken(user.getEmail());
        return new AuthResponse(jwtToken, user.getId(), user.getEmail(), user.getFullName());
    }

    @Transactional
    public void resendOtp(String email) {
        if (!userRepository.existsByEmail(email)) {
            throw new RuntimeException("No account found with this email.");
        }
        sendOtp(email);
    }

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

    @Transactional
    public void initiatePasswordReset(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No account found with this email."));
        
        if (!user.isVerified()) {
            throw new RuntimeException("Account is not verified. Please verify your account first.");
        }

        sendOtp(email);
    }

    @Transactional
    public void completePasswordReset(String email, String otp, String newPassword) {
        OtpToken token = otpTokenRepository.findTopByEmailOrderByIdDesc(email)
                .orElseThrow(() -> new RuntimeException("No OTP found for this email."));

        if (token.isUsed() || LocalDateTime.now().isAfter(token.getExpiresAt()) || !token.getOtp().equals(otp)) {
            throw new RuntimeException("Invalid or expired OTP.");
        }

        token.setUsed(true);
        otpTokenRepository.save(token);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found."));
        
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @SuppressWarnings("null")
    private void sendOtp(String email) {
        System.out.println("DEBUG: Inside sendOtp for: " + email);
        try {
            otpTokenRepository.deleteByEmail(email);
            System.out.println("DEBUG: Old OTPs deleted.");
        } catch (Exception e) {
            System.out.println("DEBUG: Delete OTP failed (might be none): " + e.getMessage());
        }

        String otp = String.format("%06d", new Random().nextInt(999999));
        OtpToken otpToken = new OtpToken(email, otp, LocalDateTime.now().plusMinutes(10));
        otpTokenRepository.save(otpToken);
        System.out.println("DEBUG: New OTP generated for " + email);


        System.out.println("DEBUG: Calling emailService.sendOtpEmail...");
        emailService.sendOtpEmail(email, otp);
        System.out.println("DEBUG: emailService.sendOtpEmail finished.");
    }

}
