package com.innogent.pantry_mind.service.impl;

import com.innogent.pantry_mind.entity.OtpVerification;
import com.innogent.pantry_mind.repository.OtpVerificationRepository;
import com.innogent.pantry_mind.service.EmailService;
import com.innogent.pantry_mind.service.OtpService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class OtpServiceImpl implements OtpService {
    private final OtpVerificationRepository otpRepository;
    private final EmailService emailService;
    
    @Override
    @Transactional
    public void generateAndSendOtp(String email, String type) {
        // Delete existing OTPs
        otpRepository.deleteByEmailAndType(email, type);
        
        // Generate 6-digit OTP
        String otp = String.format("%06d", new Random().nextInt(999999));
        
        // Save OTP
        OtpVerification otpVerification = OtpVerification.builder()
                .email(email)
                .otp(otp)
                .type(type)
                .verified(false)
                .build();
        otpRepository.save(otpVerification);
        
        // Send email
        emailService.sendOtp(email, otp, type);
    }
    
    @Override
    public boolean verifyOtp(String email, String otp, String type) {
        return otpRepository.findByEmailAndOtpAndTypeAndVerifiedFalse(email, otp, type)
                .filter(otpVerification -> otpVerification.getExpiresAt().isAfter(LocalDateTime.now()))
                .map(otpVerification -> {
                    otpVerification.setVerified(true);
                    otpRepository.save(otpVerification);
                    return true;
                })
                .orElse(false);
    }
}