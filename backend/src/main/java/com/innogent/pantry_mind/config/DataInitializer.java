package com.innogent.pantry_mind.config;

import com.innogent.pantry_mind.entity.Category;
import com.innogent.pantry_mind.entity.Location;
import com.innogent.pantry_mind.entity.Role;
import com.innogent.pantry_mind.entity.Unit;
import com.innogent.pantry_mind.repository.CategoryRepository;
import com.innogent.pantry_mind.repository.LocationRepository;
import com.innogent.pantry_mind.repository.RoleRepository;
import com.innogent.pantry_mind.repository.UnitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final UnitRepository unitRepository;
    private final RoleRepository roleRepository;
    private final LocationRepository locationRepository;

    @Override
    public void run(String... args) throws Exception {
        initializeRoles();
        initializeCategories();
        initializeUnits();
        initializeLocations();
    }

    private void initializeRoles() {
        if (roleRepository.count() == 0) {
            roleRepository.save(Role.builder().name("USER").build());
            roleRepository.save(Role.builder().name("ADMIN").build());
            roleRepository.save(Role.builder().name("MEMBER").build());
        }
    }

    private void initializeCategories() {
        if (categoryRepository.count() == 0) {
            String[] categories = {
                "Dairy", "Vegetables", "Fruits", "Meat", "Grains", 
                "Beverages", "Snacks", "Frozen", "Spices", "Condiments"
            };
            
            for (String categoryName : categories) {
                Category category = new Category();
                category.setName(categoryName);
                category.setDescription(categoryName + " products");
                categoryRepository.save(category);
            }
        }
    }

    private void initializeUnits() {
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


    private void initializeLocations() {
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