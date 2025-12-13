package com.innogent.pantry_mind.service;

public interface OtpService {
    void generateAndSendOtp(String email, String type);
    boolean verifyOtp(String email, String otp, String type);
}