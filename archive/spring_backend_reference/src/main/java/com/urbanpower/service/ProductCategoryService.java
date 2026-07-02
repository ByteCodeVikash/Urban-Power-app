package com.urbanpower.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.urbanpower.dto.CategoryRequestDTO;
import com.urbanpower.dto.CategoryResponseDTO;
import com.urbanpower.entity.ProductCategory;
import com.urbanpower.exception.ResourceNotFoundException;
import com.urbanpower.repository.ProductCategoryRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductCategoryService {

    private final ProductCategoryRepository categoryRepository;

    // Add Category
    public CategoryResponseDTO addCategory(CategoryRequestDTO dto) {

        ProductCategory category = ProductCategory.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .build();

        ProductCategory saved = categoryRepository.save(category);

        return mapToDTO(saved);
    }

    // Get All Categories
    public List<CategoryResponseDTO> getAllCategories() {

        return categoryRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // Update Category
    public CategoryResponseDTO updateCategory(
            Long id,
            CategoryRequestDTO dto) {

        ProductCategory category = categoryRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Category not found"));

        category.setName(dto.getName());
        category.setDescription(dto.getDescription());

        ProductCategory updated = categoryRepository.save(category);

        return mapToDTO(updated);
    }

    // Delete Category
    public String deleteCategory(Long id) {

        ProductCategory category = categoryRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Category not found"));

        categoryRepository.delete(category);

        return "Category deleted successfully";
    }

    // Convert Entity -> DTO
    private CategoryResponseDTO mapToDTO(ProductCategory category) {

        return CategoryResponseDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .active(category.isActive())
                .build();
    }
}