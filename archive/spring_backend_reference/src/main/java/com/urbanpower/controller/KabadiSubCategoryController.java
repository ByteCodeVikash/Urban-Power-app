package com.urbanpower.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.urbanpower.entity.KabadiSubCategory;
import com.urbanpower.service.KabadiSubCategoryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/kabadi/subcategories")
@RequiredArgsConstructor
public class KabadiSubCategoryController {

    private final KabadiSubCategoryService service;

    // ✅ ADMIN - Add Subcategory
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public KabadiSubCategory add(
            @RequestParam Long categoryId,
            @RequestBody KabadiSubCategory subCategory) {

        return service.addSubCategory(categoryId, subCategory);
    }

    // ✅ USER - Get All
    @GetMapping
    public List<KabadiSubCategory> getAll() {
        return service.getAll();
    }

    // ✅ USER - Get By Category
    @GetMapping(params = "categoryId")
    public List<KabadiSubCategory> getByCategory(
            @RequestParam Long categoryId) {

        return service.getByCategory(categoryId);
    }

    // ✅ ADMIN - Update Price
    @PutMapping("/{id}/price")
    @PreAuthorize("hasRole('ADMIN')")
    public KabadiSubCategory updatePrice(
            @PathVariable Long id,
            @RequestParam Double price) {

        return service.updatePrice(id, price);
    }

    // ✅ ADMIN - Delete
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public String delete(@PathVariable Long id) {

        return service.deleteSubCategory(id);
    }
}