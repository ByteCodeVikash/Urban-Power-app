package com.urbanpower.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.urbanpower.dto.KabadiRequestDTO;
import com.urbanpower.dto.common.ApiResponse;
import com.urbanpower.entity.KabadiRequest;
import com.urbanpower.entity.KabadiSubCategory;
import com.urbanpower.service.KabadiService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/kabadi")
@RequiredArgsConstructor
public class KabadiController {

    private final KabadiService kabadiService;

    // Create pickup request
    @PostMapping("/request")
    public ResponseEntity<ApiResponse<KabadiRequest>> create(
            @RequestBody KabadiRequestDTO dto) {

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Pickup request created successfully",
                        kabadiService.createRequest(dto)
                )
        );
    }

    // Assign agent
    @PostMapping("/assign")
    public ResponseEntity<ApiResponse<KabadiRequest>> assign(
            @RequestParam Long requestId,
            @RequestParam Long agentId) {

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Agent assigned successfully",
                        kabadiService.assignAgent(requestId, agentId)
                )
        );
    }

    // Complete pickup
    @PutMapping("/complete")
    public ResponseEntity<ApiResponse<KabadiRequest>> complete(
            @RequestParam Long requestId) {

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Pickup completed successfully",
                        kabadiService.completeRequest(requestId)
                )
        );
    }

    // Rate chart API
    @GetMapping("/rates")
    public ResponseEntity<ApiResponse<List<KabadiSubCategory>>> getRates() {

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Kabadi rates fetched successfully",
                        kabadiService.getRates()
                )
        );
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<KabadiRequest>>> getUserRequests(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Pickup history fetched successfully",
                        kabadiService.getUserRequests(userId)
                )
        );
    }
    
    @GetMapping("/agent/{agentId}")
    public ResponseEntity<ApiResponse<List<KabadiRequest>>> getAgentRequests(
            @PathVariable Long agentId) {

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Assigned pickups fetched successfully",
                        kabadiService.getAgentRequests(agentId)
                )
        );
    }
    
    @PutMapping("/finalize")
    public ResponseEntity<ApiResponse<KabadiRequest>> finalizeRequest(
            @RequestParam Long requestId,
            @RequestParam Double actualWeight) {

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Final price updated successfully",
                        kabadiService.finalizeRequest(requestId, actualWeight)
                )
        );
    }
    
    @PutMapping("/generate-otp")
    public ResponseEntity<ApiResponse<KabadiRequest>> generateOtp(
            @RequestParam Long requestId) {

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "OTP generated successfully",
                        kabadiService.generateOtp(requestId)
                )
        );
    }
    
    @PutMapping("/verify-otp")
    public ResponseEntity<ApiResponse<KabadiRequest>> verifyOtp(
            @RequestParam Long requestId,
            @RequestParam String otp) {

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Pickup completed successfully",
                        kabadiService.verifyOtp(requestId, otp)
                )
        );
    }
}