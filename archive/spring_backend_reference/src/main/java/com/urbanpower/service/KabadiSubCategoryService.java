package com.urbanpower.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.urbanpower.entity.KabadiCategory;
import com.urbanpower.entity.KabadiSubCategory;
import com.urbanpower.repository.KabadiCategoryRepository;
import com.urbanpower.repository.KabadiSubCategoryRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class KabadiSubCategoryService {

    private final KabadiSubCategoryRepository subRepo;
    private final KabadiCategoryRepository categoryRepo;

    // Add
    public KabadiSubCategory addSubCategory(Long categoryId,
                                            KabadiSubCategory subCategory) {

        KabadiCategory category = categoryRepo.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        subCategory.setCategory(category);

        return subRepo.save(subCategory);
    }

    // Get by category
    public List<KabadiSubCategory> getByCategory(Long categoryId) {
        return subRepo.findByCategoryId(categoryId);
    }

    // Get all
    public List<KabadiSubCategory> getAll() {
        return subRepo.findAll();
    }

    // Update price
    public KabadiSubCategory updatePrice(Long id, Double price) {

        KabadiSubCategory sub = subRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("SubCategory not found"));

        sub.setPricePerKg(price);
       // sub.setPrice(price);

        return subRepo.save(sub);
    }

    // Delete
    public String deleteSubCategory(Long id) {

        if (!subRepo.existsById(id)) {
            throw new RuntimeException("SubCategory not found");
        }

        subRepo.deleteById(id);

        return "Deleted Successfully";
    }
}