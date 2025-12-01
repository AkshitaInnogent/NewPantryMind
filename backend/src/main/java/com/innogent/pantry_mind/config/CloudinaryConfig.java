package com.innogent.pantry_mind.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CloudinaryConfig {

    @Bean
    public Cloudinary cloudinary() {
        return new Cloudinary(ObjectUtils.asMap(
            "cloud_name", "dertqegf0",
            "api_key", "479572864111625",
            "api_secret", "Q15Fri_yKW9JNcm4fMrYlBXa3BQ"
        ));
    }
}
