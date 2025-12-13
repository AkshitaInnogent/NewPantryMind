package com.innogent.pantry_mind.config;

import com.innogent.pantry_mind.entity.*;
import com.innogent.pantry_mind.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Order(1)
public class BasicDataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final CategoryRepository categoryRepository;
    private final UnitRepository unitRepository;
    private final LocationRepository locationRepository;

    @Override
    public void run(String... args) throws Exception {
        createRoles();
        createCategories();
        createUnits();
        createLocations();
    }

    private void createRoles() {
        if (roleRepository.count() == 0) {
            roleRepository.save(Role.builder().name("USER").build());
            roleRepository.save(Role.builder().name("ADMIN").build());
            roleRepository.save(Role.builder().name("MEMBER").build());
        }
    }

    private void createCategories() {
        if (categoryRepository.count() == 0) {
            String[] categories = {"Dairy", "Vegetables", "Fruits", "Meat", "Grains", "Beverages", "Snacks", "Frozen", "Spices", "Condiments"};
            for (String categoryName : categories) {
                Category category = new Category();
                category.setName(categoryName);
                category.setDescription(categoryName + " products");
                categoryRepository.save(category);
            }
        }
    }

    private void createUnits() {
        if (unitRepository.count() == 0) {
            String[][] units = {
                {"grams", "Weight"}, 
                {"kg", "Weight"}, 
                {"ml", "Volume"}, 
                {"litre", "Volume"}, 
                {"piece", "Count"}, 
                {"dozen", "Count"}
            };
            for (String[] unitData : units) {
                Unit unit = new Unit();
                unit.setName(unitData[0]);
                unit.setType(unitData[1]);
                unitRepository.save(unit);
            }
        }
    }

    private void createLocations() {
        if (locationRepository.count() == 0) {
            String[] locations = {"Refrigerator", "Pantry", "Freezer"};
            for (String locationName : locations) {
                Location location = new Location();
                location.setName(locationName);
                locationRepository.save(location);
            }
        }
    }
}