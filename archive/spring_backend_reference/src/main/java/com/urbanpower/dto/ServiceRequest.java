package com.urbanpower.dto;

import lombok.Data;

@Data
public class ServiceRequest {
    private String name;
    private String description;
    private Double price;
    private String category;
}