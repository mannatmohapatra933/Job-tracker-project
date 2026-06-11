package com.example.demo;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Async;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.util.Map;
import java.util.List;

@Service
public class EmailService {

    @Value("${spring.mail.username:}")
    private String fromEmail;

    @Value("${spring.mail.password:}")
    private String apiKey;

    private final RestTemplate restTemplate;

    public EmailService() {
        this.restTemplate = new RestTemplate();
    }

    @Async
    @SuppressWarnings("null")
    public void sendOtpEmail(@org.springframework.lang.NonNull String toEmail, @org.springframework.lang.NonNull String otp) {
        System.out.println("DEBUG: Preparing to send email via Brevo API to " + toEmail);

        if (apiKey == null || apiKey.isEmpty() || apiKey.length() < 20) {
            System.err.println("❌ Invalid or missing API Key! Please set MAIL_PASSWORD to your Brevo API key.");
            return;
        }

        try {
            String url = "https://api.brevo.com/v3/smtp/email";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("api-key", apiKey);

            String senderEmail = (fromEmail != null && !fromEmail.isEmpty()) ? fromEmail : "noreply@jobflow.ai";

            Map<String, Object> payload = Map.of(
                "sender", Map.of("name", "JobFlow AI", "email", senderEmail),
                "to", List.of(Map.of("email", toEmail)),
                "subject", "JobFlow AI — Your Verification Code",
                "htmlContent", buildEmailHtml(otp)
            );

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            
            if (response.getStatusCode().is2xxSuccessful()) {
                System.out.println("✅ Email sent successfully via Brevo API to: " + toEmail);
            } else {
                System.err.println("❌ Failed to send email via API. Status: " + response.getStatusCode());
            }

        } catch (Exception e) {
            System.err.println("❌ Failed to send real email via API: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private String buildEmailHtml(String otp) {
        return """
            <!DOCTYPE html>
            <html>
            <body style="margin:0;padding:0;background:#131221;font-family:'Inter',Arial,sans-serif;">
              <div style="max-width:480px;margin:40px auto;background:#1f1e2e;border-radius:16px;border:1px solid rgba(73,69,82,0.2);overflow:hidden;">
                <div style="background:linear-gradient(135deg,#cebdff,#a78bfa);padding:32px;text-align:center;">
                  <h1 style="margin:0;color:#381385;font-size:28px;font-weight:900;letter-spacing:-0.04em;">JobFlow AI</h1>
                  <p style="margin:6px 0 0;color:#4f319c;font-size:11px;text-transform:uppercase;letter-spacing:0.15em;font-weight:700;">Intelligent Luminary Portal</p>
                </div>
                <div style="padding:32px;text-align:center;">
                  <h2 style="color:#e4e0f6;font-size:20px;margin:0 0 8px;">Email Verification</h2>
                  <p style="color:#cac4d4;font-size:14px;margin:0 0 28px;line-height:1.6;">Enter this code to verify your account. It expires in <strong style="color:#cebdff;">10 minutes</strong>.</p>
                  <div style="background:#0d0c1c;border:2px solid rgba(206,189,255,0.2);border-radius:12px;padding:24px;display:inline-block;margin:0 auto;">
                    <span style="font-size:40px;font-weight:900;letter-spacing:0.2em;color:#cebdff;">%s</span>
                  </div>
                  <p style="color:#64748b;font-size:12px;margin:24px 0 0;">If you didn't create an account, ignore this email.</p>
                </div>
              </div>
            </body>
            </html>
            """.formatted(otp);
    }
}
