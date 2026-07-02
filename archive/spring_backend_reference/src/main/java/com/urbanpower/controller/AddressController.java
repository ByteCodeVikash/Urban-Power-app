package com.urbanpower.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.urbanpower.dto.AddressRequest;
import com.urbanpower.dto.common.ApiResponse;
import com.urbanpower.entity.UserAddress;
import com.urbanpower.service.UserAddressService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/address")
@RequiredArgsConstructor
public class AddressController {

    private final UserAddressService addressService;

    @PostMapping("/add")
    public ResponseEntity<ApiResponse<UserAddress>> add(
            @RequestBody AddressRequest request) {

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Address added successfully",
                        addressService.addAddress(request)
                )
        );
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<UserAddress>>> getUserAddresses(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Addresses fetched successfully",
                        addressService.getUserAddresses(userId)
                )
        );
    }
    
    @DeleteMapping("/delete/{addressId}")
    public ResponseEntity<ApiResponse<String>> deleteAddress(
            @PathVariable Long addressId) {

        addressService.deleteAddress(addressId);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Address deleted successfully",
                        "Deleted"
                )
        );
    }
    
    @PutMapping("/default/{addressId}")
    public ResponseEntity<ApiResponse<UserAddress>> setDefault(
            @PathVariable Long addressId,
            @RequestParam Long userId) {

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Default address updated",
                        addressService.setDefaultAddress(userId, addressId)
                )
        );
    }
    
}