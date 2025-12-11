package com.innogent.pantry_mind.service;

public interface EmailService {
    void sendOtp(String email, String otp, String type);
}