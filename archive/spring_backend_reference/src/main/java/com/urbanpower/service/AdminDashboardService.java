package com.urbanpower.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.urbanpower.dto.AdminDashboardResponse;
import com.urbanpower.entity.KabadiRequest;
import com.urbanpower.entity.Role;
import com.urbanpower.repository.KabadiRepository;
import com.urbanpower.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final UserRepository userRepository;
    private final KabadiRepository kabadiRepository;

    public AdminDashboardResponse getDashboard() {

        // User stats
        long totalUsers = userRepository.count();
        long user = userRepository.countByRole(Role.USER);
        long technicians = userRepository.countByRole(Role.TECHNICIAN);
        long admins = userRepository.countByRole(Role.ADMIN);

        // Request stats
        long totalRequests = kabadiRepository.count();
        long pending = kabadiRepository.countByStatus("REQUESTED");
        long completed = kabadiRepository.countByStatus("COMPLETED");

        // Revenue logic
        double revenue = completed * 150.0;

        // Recent requests
        List<KabadiRequest> recent = kabadiRepository
                .findTop5ByOrderByIdDesc();

        List<String> recentRequests = recent.stream()
                .map(r -> "Request #" + r.getId()
                        + " | " + r.getStatus()
                        + " | " + r.getPickupAddress())
                .collect(Collectors.toList());

        return AdminDashboardResponse.builder()
                .totalUsers(totalUsers)
                .totalCustomers(user)
                .totalTechnicians(technicians)
                .totalAdmins(admins)
                .totalRequests(totalRequests)
                .pendingRequests(pending)
                .completedRequests(completed)
                .totalRevenue(revenue)
                .recentRequests(recentRequests)
                .build();
    }
}