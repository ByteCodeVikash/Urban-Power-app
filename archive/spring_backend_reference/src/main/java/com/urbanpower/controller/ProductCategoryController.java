package com.urbanpower.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.urbanpower.dto.CategoryRequestDTO;
import com.urbanpower.dto.CategoryResponseDTO;
import com.urbanpower.service.ProductCategoryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/product-categories")
@RequiredArgsConstructor
public class ProductCategoryController {

    private final ProductCategoryService categoryService;

    // Add Category
    @PostMapping
    public CategoryResponseDTO addCategory(
            @RequestBody CategoryRequestDTO dto) {

        return categoryService.addCategory(dto);
    }

    // Get All Categories
    @GetMapping
    public List<CategoryResponseDTO> getAllCategories() {

        return categoryService.getAllCategories();
    }

    // Update Category
    @PutMapping("/{id}")
    public CategoryResponseDTO updateCategory(
            @PathVariable Long id,
            @RequestBody CategoryRequestDTO dto) {

        return categoryService.updateCategory(id, dto);
    }

    // Delete Category
    @DeleteMapping("/{id}")
    public String deleteCategory(
            @PathVariable Long id) {

        return categoryService.deleteCategory(id);
    }
}