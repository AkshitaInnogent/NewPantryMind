package com.innogent.pantry_mind.service.impl;

import com.innogent.pantry_mind.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {
    private final JavaMailSender mailSender;
    
    @Override
    public void sendOtp(String email, String otp, String type) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(email);
            helper.setFrom("pantrymind@gmail.com");
            
            if ("REGISTRATION".equals(type)) {
                helper.setSubject("🥫 Welcome to PantryMind - Verify Your Email");
                helper.setText(createVerificationEmailTemplate(otp), true);
            } else {
                helper.setSubject("🔐 PantryMind - Reset Your Password");
                helper.setText(createPasswordResetEmailTemplate(otp), true);
            }
            
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send email", e);
        }
    }
    
    private String createVerificationEmailTemplate(String otp) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head><meta charset='UTF-8'><title>Email Verification</title></head>" +
                "<body style='margin:0;padding:0;font-family:Arial,sans-serif;background-color:#f5f5f5;'>" +
                "<div style='max-width:600px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);'>" +
                "<div style='background:linear-gradient(135deg,#22c55e 0%,#16a34a 100%);padding:40px 20px;text-align:center;'>" +
                "<h1 style='color:#fff;margin:0;font-size:28px;'>🥫 PantryMind</h1>" +
                "<p style='color:#fff;margin:10px 0 0 0;opacity:0.9;'>Smart Pantry Management</p>" +
                "</div>" +
                "<div style='padding:40px 30px;'>" +
                "<h2 style='color:#1f2937;margin:0 0 20px 0;text-align:center;'>Welcome to PantryMind! 🎉</h2>" +
                "<p style='color:#6b7280;line-height:1.6;text-align:center;'>Thank you for joining our smart pantry management platform. Please verify your email using the code below.</p>" +
                "<div style='background:#f9fafb;border:2px dashed #22c55e;border-radius:10px;padding:30px;text-align:center;margin:30px 0;'>" +
                "<p style='color:#374151;font-size:14px;margin:0 0 10px 0;text-transform:uppercase;letter-spacing:1px;font-weight:600;'>Verification Code</p>" +
                "<div style='font-size:32px;font-weight:bold;color:#22c55e;letter-spacing:8px;font-family:monospace;'>" + otp + "</div>" +
                "<p style='color:#6b7280;font-size:12px;margin:15px 0 0 0;'>⏰ Expires in 10 minutes</p>" +
                "</div>" +
                "<div style='background:#eff6ff;border-left:4px solid #3b82f6;padding:20px;margin:30px 0;border-radius:0 8px 8px 0;'>" +
                "<h3 style='color:#1e40af;margin:0 0 10px 0;'>🚀 What's Next?</h3>" +
                "<ul style='color:#374151;margin:0;padding-left:20px;line-height:1.6;'>" +
                "<li>Enter this code in the verification form</li>" +
                "<li>Create your first kitchen</li>" +
                "<li>Start managing your pantry smartly</li>" +
                "</ul>" +
                "</div>" +
                "</div>" +
                "<div style='background:#f9fafb;padding:20px;text-align:center;border-top:1px solid #e5e7eb;'>" +
                "<p style='color:#6b7280;font-size:12px;margin:0;'>© 2024 PantryMind. Making pantry management smarter! 🥫📱</p>" +
                "</div>" +
                "</div>" +
                "</body>" +
                "</html>";
    }
    
    private String createPasswordResetEmailTemplate(String otp) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head><meta charset='UTF-8'><title>Password Reset</title></head>" +
                "<body style='margin:0;padding:0;font-family:Arial,sans-serif;background-color:#f5f5f5;'>" +
                "<div style='max-width:600px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);'>" +
                "<div style='background:linear-gradient(135deg,#ef4444 0%,#dc2626 100%);padding:40px 20px;text-align:center;'>" +
                "<h1 style='color:#fff;margin:0;font-size:28px;'>🔐 PantryMind</h1>" +
                "<p style='color:#fff;margin:10px 0 0 0;opacity:0.9;'>Password Reset Request</p>" +
                "</div>" +
                "<div style='padding:40px 30px;'>" +
                "<h2 style='color:#1f2937;margin:0 0 20px 0;text-align:center;'>Reset Your Password 🔑</h2>" +
                "<p style='color:#6b7280;line-height:1.6;text-align:center;'>We received a request to reset your password. Use the code below to proceed.</p>" +
                "<div style='background:#fef2f2;border:2px dashed #ef4444;border-radius:10px;padding:30px;text-align:center;margin:30px 0;'>" +
                "<p style='color:#374151;font-size:14px;margin:0 0 10px 0;text-transform:uppercase;letter-spacing:1px;font-weight:600;'>Reset Code</p>" +
                "<div style='font-size:32px;font-weight:bold;color:#ef4444;letter-spacing:8px;font-family:monospace;'>" + otp + "</div>" +
                "<p style='color:#6b7280;font-size:12px;margin:15px 0 0 0;'>⏰ Expires in 10 minutes</p>" +
                "</div>" +
                "<div style='background:#fef3c7;border-left:4px solid #f59e0b;padding:20px;margin:30px 0;border-radius:0 8px 8px 0;'>" +
                "<h3 style='color:#92400e;margin:0 0 10px 0;'>⚠️ Security Notice</h3>" +
                "<ul style='color:#374151;margin:0;padding-left:20px;line-height:1.6;'>" +
                "<li>Only use this code if you requested a password reset</li>" +
                "<li>Never share this code with anyone</li>" +
                "<li>Contact support if you didn't request this</li>" +
                "</ul>" +
                "</div>" +
                "</div>" +
                "<div style='background:#f9fafb;padding:20px;text-align:center;border-top:1px solid #e5e7eb;'>" +
                "<p style='color:#6b7280;font-size:12px;margin:0;'>© 2024 PantryMind. Keeping your pantry secure! 🔒🥫</p>" +
                "</div>" +
                "</div>" +
                "</body>" +
                "</html>";
    }
}