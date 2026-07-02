package com.urbanpower.dto;

import java.time.LocalDate;

import lombok.Data;

@Data
public class KabadiRequestDTO {

    private Long userId;
    private Long categoryId;
    private Long subCategoryId;
    private String scrapType;
    private Double weight;

    private String pickupAddress;
   // private String pickupDate;
    private LocalDate pickupDate;
    private String pickupTime;
    private String contactNumber;
    private String notes;
}