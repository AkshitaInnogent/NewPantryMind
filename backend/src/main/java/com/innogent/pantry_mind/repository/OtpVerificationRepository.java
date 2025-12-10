package com.innogent.pantry_mind.repository;

import com.innogent.pantry_mind.entity.OtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface OtpVerificationRepository extends JpaRepository<OtpVerification, Long> {
    Optional<OtpVerification> findByEmailAndOtpAndTypeAndVerifiedFalse(String email, String otp, String type);
    void deleteByEmailAndType(String email, String type);
}