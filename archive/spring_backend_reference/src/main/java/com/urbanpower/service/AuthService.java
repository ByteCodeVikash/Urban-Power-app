package com.urbanpower.service;

import java.time.LocalDateTime;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.urbanpower.config.JwtUtil;
import com.urbanpower.dto.AuthResponse;
import com.urbanpower.dto.LoginRequest;
import com.urbanpower.dto.RegisterRequest;
import com.urbanpower.dto.auth.LoginResponse;
import com.urbanpower.dto.auth.UserResponse;
import com.urbanpower.entity.Otp;
import com.urbanpower.entity.Role;
import com.urbanpower.entity.User;
import com.urbanpower.exception.BadRequestException;
import com.urbanpower.repository.OtpRepository;
import com.urbanpower.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final OtpRepository otpRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final JwtService jwtService;

    public String register(RegisterRequest request) {

        // Email already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new BadRequestException("Email already registered");
        }
        
        if (userRepository.findByPhone(request.getPhone()).isPresent()) {
            throw new BadRequestException("Phone already registered");
        }

        Role role;

//        try {
//         //   role = Role.valueOf(request.getRole().toUpperCase());
//
//        } catch (Exception e) {
//            throw new BadRequestException("Invalid role");
//        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(Role.USER) 
              //  .address(request.getAddress())
              //  .role(role)
                .build();

        userRepository.save(user);

        return jwtUtil.generateToken(
                user.getEmail(),
                user.getRole().name()
        );
    }

    public LoginResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid Email"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid Password");
        }

        String token = jwtUtil.generateToken(
                user.getEmail(),
                user.getRole().name()
        );

        UserResponse userResponse = new UserResponse(
                user.getId(),
                user.getName(), // use actual field
                user.getEmail(),
                user.getRole().name()
        );

        return new LoginResponse(token, userResponse);
    }
    
    public String sendOtp(String phone) {

        String otp = String.valueOf((int)(1000 + Math.random() * 9000));

        Otp otpEntity = Otp.builder()
                .phone(phone)
                .otp(otp)
                .expiryTime(LocalDateTime.now().plusMinutes(5))
                .build();

        otpRepository.save(otpEntity);

        // 🔥 For now print OTP (later SMS)
        System.out.println("OTP is: " + otp);

        return "OTP sent successfully";
    }
    
    
    
    public AuthResponse verifyOtpAndRegister(RegisterRequest request, String otp) {

        Otp savedOtp = otpRepository
                .findTopByPhoneOrderByIdDesc(request.getPhone())
                .orElseThrow(() -> new RuntimeException("OTP not found"));

        if (!savedOtp.getOtp().equals(otp)) {
            throw new RuntimeException("Invalid OTP");
        }

        if (savedOtp.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP expired");
        }
        
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new RuntimeException("Phone already registered");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(Role.USER)
                .build();

        userRepository.save(user);
        
        String token = jwtService.generateToken(user);

        return new AuthResponse(token);

       // return "User registered successfully";
    }
    
    
}