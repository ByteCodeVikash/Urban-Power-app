package com.urbanpower.dto;

import lombok.Data;

@Data
public class AddressRequest {

    private Long userId;
    private String label;
    private String fullAddress;
    private String city;
    private String pincode;
}