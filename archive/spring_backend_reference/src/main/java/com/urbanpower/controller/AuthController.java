package com.urbanpower.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.urbanpower.dto.AuthResponse;
import com.urbanpower.dto.LoginRequest;
import com.urbanpower.dto.RegisterRequest;
import com.urbanpower.dto.auth.LoginResponse;
import com.urbanpower.dto.common.ApiResponse;
import com.urbanpower.service.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<String>> register(
    		@Valid @RequestBody RegisterRequest request) {

        authService.register(request);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "User registered successfully",
                        "Success"
                )
        );
    }
//    @PostMapping("/register")
//    public ResponseEntity<Map<String, String>> register(
//            @Valid @RequestBody RegisterRequest request) {
//
//        String token = authService.register(request);
//
//        Map<String, String> response = new LinkedHashMap<>();
//        response.put("message", "Registration successful");
//        response.put("token", token);
//
//        return ResponseEntity.ok(response);
//    }

//    @PostMapping("/login")
//    public ResponseEntity<Map<String, String>> login(
//            @Valid @RequestBody LoginRequest request) {
//
//        //String token = authService.login(request);
//
//        Map<String, String> response = new LinkedHashMap<>();
//        response.put("message", "Login successful");
//        response.put("token", token);
//
//        return ResponseEntity.status(201).body(response);
//    }
    
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
    		@Valid @RequestBody LoginRequest request ) {

        LoginResponse response = authService.login(request);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Login successful",
                        response
                )
        );
    }
    
    @PostMapping("/send-otp")
    public ResponseEntity<ApiResponse<String>> sendOtp(
            @RequestParam String phone) {

        return ResponseEntity.ok(
                new ApiResponse<>(true, "OTP sent",
                        authService.sendOtp(phone))
        );
    }
    
    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyOtp(
            @RequestBody RegisterRequest request,
            @RequestParam String otp) {

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "OTP verified successfully",
                        authService.verifyOtpAndRegister(request, otp)
                )
        );
    }
    
//    @PostMapping("/verify-otp")
//    public ResponseEntity<ApiResponse<String>> verifyOtp(
//            @RequestBody RegisterRequest request,
//            @RequestParam String otp) {
//
//        return ResponseEntity.ok(
//                new ApiResponse<>(true, "Verified",
//                        authService.verifyOtpAndRegister(request, otp))
//        );
//    }
    
}