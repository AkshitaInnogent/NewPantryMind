package com.innogent.pantry_mind.controller;

import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import com.innogent.pantry_mind.entity.Location;
import com.innogent.pantry_mind.repository.LocationRepository;

@RestController
@RequestMapping("/api/locations")
@RequiredArgsConstructor
@CrossOrigin
public class LocationController {

    private final LocationRepository locationRepository;

    @GetMapping
    public ResponseEntity<List<Location>> getAllLocations() {
        List<Location> locations = locationRepository.findAll();
        return ResponseEntity.ok(locations);
    }

    @PostMapping
    public ResponseEntity<Location> createLocation(@RequestBody Location location) {
        Location savedLocation = locationRepository.save(location);
        return ResponseEntity.ok(savedLocation);
    }
}