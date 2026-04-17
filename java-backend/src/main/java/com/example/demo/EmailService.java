package com.example.demo;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendOtpEmail(String toEmail, String otp) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setTo(toEmail);
        helper.setSubject("JobFlow AI — Your Verification Code");
        helper.setText(buildEmailHtml(otp), true);

        mailSender.send(message);
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
