package com.innogent.pantry_mind.config;

import com.innogent.pantry_mind.entity.Category;
import com.innogent.pantry_mind.entity.Unit;
import com.innogent.pantry_mind.entity.Location;
import com.innogent.pantry_mind.repository.CategoryRepository;
import com.innogent.pantry_mind.repository.UnitRepository;
import com.innogent.pantry_mind.repository.LocationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UnitRepository unitRepository;

    @Autowired
    private LocationRepository locationRepository;

    @Override
    public void run(String... args) throws Exception {
        seedCategories();
        seedUnits();
        seedLocations();
    }

    private void seedCategories() {
        if (categoryRepository.count() == 0) {
            categoryRepository.save(new Category(null, "Dairy", "Milk, cheese, yogurt, etc."));
            categoryRepository.save(new Category(null, "Vegetables", "Fresh vegetables"));
            categoryRepository.save(new Category(null, "Fruits", "Fresh fruits"));
            categoryRepository.save(new Category(null, "Meat", "Meat and poultry"));
            categoryRepository.save(new Category(null, "Grains", "Rice, wheat, cereals"));
            categoryRepository.save(new Category(null, "Beverages", "Drinks and juices"));
            categoryRepository.save(new Category(null, "Snacks", "Chips, cookies, etc."));
            categoryRepository.save(new Category(null, "Frozen", "Frozen foods"));
            categoryRepository.save(new Category(null, "Spices", "Spices and seasonings"));
            categoryRepository.save(new Category(null, "Oil", "Cooking oils and condiments"));
        }
    }

    private void seedUnits() {
        if (unitRepository.count() == 0) {
            unitRepository.save(new Unit(null, "Kg", "Kilogram"));
            unitRepository.save(new Unit(null, "g", "Gram"));
            unitRepository.save(new Unit(null, "L", "Liter"));
            unitRepository.save(new Unit(null, "ml", "Milliliter"));
            unitRepository.save(new Unit(null, "pcs", "Pieces"));
            unitRepository.save(new Unit(null, "dozen", "Dozen"));
            unitRepository.save(new Unit(null, "pack", "Pack"));
            unitRepository.save(new Unit(null, "bottle", "Bottle"));
            unitRepository.save(new Unit(null, "can", "Can"));
            unitRepository.save(new Unit(null, "box", "Box"));
            unitRepository.save(new Unit(null, "bag", "Bag"));
            unitRepository.save(new Unit(null, "cup", "Cup"));
        }
    }

    private void seedLocations() {
        if (locationRepository.count() == 0) {
            locationRepository.save(new Location(null, "Refrigerator"));
            locationRepository.save(new Location(null, "Pantry"));
            locationRepository.save(new Location(null, "Freezer"));
        }
    }
}