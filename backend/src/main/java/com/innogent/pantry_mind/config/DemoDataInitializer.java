package com.innogent.pantry_mind.config;

import com.innogent.pantry_mind.entity.*;
import com.innogent.pantry_mind.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Order(2)
public class DemoDataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final CategoryRepository categoryRepository;
    private final UnitRepository unitRepository;
    private final LocationRepository locationRepository;
    private final UserRepository userRepository;
    private final KitchenRepository kitchenRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        createBasicData();
        createDemoUsers();
    }

    private void createBasicData() {
        // Create roles
        if (roleRepository.count() == 0) {
            roleRepository.save(Role.builder().name("USER").build());
            roleRepository.save(Role.builder().name("ADMIN").build());
            roleRepository.save(Role.builder().name("MEMBER").build());
        }

        // Create categories
        if (categoryRepository.count() == 0) {
            String[] categories = {"Dairy", "Vegetables", "Fruits", "Meat", "Grains", "Beverages", "Snacks", "Frozen", "Spices", "Condiments"};
            for (String categoryName : categories) {
                Category category = new Category();
                category.setName(categoryName);
                category.setDescription(categoryName + " products");
                categoryRepository.save(category);
            }
        }

        // Create units
        if (unitRepository.count() == 0) {
            String[][] units = {{"grams", "Weight"}, {"kg", "Weight"}, {"ml", "Volume"}, {"litre", "Volume"}, {"piece", "Count"}, {"dozen", "Count"}};
            for (String[] unitData : units) {
                Unit unit = new Unit();
                unit.setName(unitData[0]);
                unit.setType(unitData[1]);
                unitRepository.save(unit);
            }
        }

        // Create locations
        if (locationRepository.count() == 0) {
            String[] locations = {"Refrigerator", "Pantry", "Freezer"};
            for (String locationName : locations) {
                Location location = new Location();
                location.setName(locationName);
                locationRepository.save(location);
            }
        }
    }

    private void createDemoUsers() {
        if (userRepository.count() == 0) {
            // Create demo kitchen
            Kitchen kitchen = new Kitchen();
            kitchen.setName("Smith Family Kitchen");
            kitchen.setInvitationCode("SMITH2024");
            kitchen.setAlertsEnabled(true);
            kitchen.setAlertTimeHour(8);
            kitchen.setAlertTimeMinute(0);
            kitchen = kitchenRepository.save(kitchen);

            // Get roles
            Role adminRole = roleRepository.findByName("ADMIN").orElseThrow();
            Role memberRole = roleRepository.findByName("MEMBER").orElseThrow();

            // Create demo users with password "123456"
            String hashedPassword = passwordEncoder.encode("123456");

            User demo1 = new User();
            demo1.setUsername("demo1");
            demo1.setName("Demo User 1");
            demo1.setEmail("demo1@gmail.com");
            demo1.setPasswordHash(hashedPassword);
            demo1.setIsActive(true);
            demo1.setEmailVerified(true);
            demo1.setKitchen(kitchen);
            demo1.setRole(adminRole);
            userRepository.save(demo1);

            User demo2 = new User();
            demo2.setUsername("demo2");
            demo2.setName("Demo User 2");
            demo2.setEmail("demo2@gmail.com");
            demo2.setPasswordHash(hashedPassword);
            demo2.setIsActive(true);
            demo2.setEmailVerified(true);
            demo2.setKitchen(kitchen);
            demo2.setRole(memberRole);
            userRepository.save(demo2);
        }
    }
}