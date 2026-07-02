package com.urbanpower.dto;

import java.util.List;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminDashboardResponse {

    private Long totalUsers;
    private Long totalCustomers;
    private Long totalTechnicians;
    private Long totalAdmins;

    private Long totalRequests;
    private Long pendingRequests;
    private Long completedRequests;

    private Double totalRevenue;

    private List<String> recentRequests;
}