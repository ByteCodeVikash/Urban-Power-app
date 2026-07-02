package com.urbanpower.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductRequestDTO {

    private String name;

    private String description;

    private Double price;

    private Integer stockQuantity;

    private String brand;

    private String imageUrl;

    private Long categoryId;
}