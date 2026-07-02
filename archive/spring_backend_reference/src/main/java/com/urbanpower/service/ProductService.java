package com.urbanpower.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.urbanpower.dto.ProductRequestDTO;
import com.urbanpower.dto.ProductResponseDTO;
import com.urbanpower.entity.Product;
import com.urbanpower.entity.ProductCategory;
import com.urbanpower.exception.ResourceNotFoundException;
import com.urbanpower.repository.ProductCategoryRepository;
import com.urbanpower.repository.ProductRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductCategoryRepository categoryRepository;

    // Add Product
    public ProductResponseDTO addProduct(ProductRequestDTO dto) {

        ProductCategory category = categoryRepository
                .findById(dto.getCategoryId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Category not found"));

        Product product = Product.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .price(dto.getPrice())
                .stockQuantity(dto.getStockQuantity())
                .brand(dto.getBrand())
                .imageUrl(dto.getImageUrl())
                .category(category)
                .build();

        Product saved = productRepository.save(product);

        return mapToDTO(saved);
    }

    // Get All Products
    public List<ProductResponseDTO> getAllProducts() {

        return productRepository.findByActiveTrue()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // Get Products By Category
    public List<ProductResponseDTO> getProductsByCategory(Long categoryId) {

        return productRepository.findByCategoryId(categoryId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // Convert Entity -> DTO
    private ProductResponseDTO mapToDTO(Product product) {

        return ProductResponseDTO.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .stockQuantity(product.getStockQuantity())
                .brand(product.getBrand())
                .imageUrl(product.getImageUrl())
                .categoryName(product.getCategory().getName())
                .build();
    }
}