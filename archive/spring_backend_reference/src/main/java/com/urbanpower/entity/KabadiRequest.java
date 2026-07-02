package com.urbanpower.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "kabadi_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KabadiRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Customer
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Pickup agent
    @ManyToOne
    @JoinColumn(name = "agent_id")
    private User agent;

    // Category
    @ManyToOne
    @JoinColumn(name = "category_id")
    private KabadiCategory category;

    // Subcategory
    @ManyToOne
    @JoinColumn(name = "sub_category_id")
    private KabadiSubCategory subCategory;

    private String scrapType;

    private Double weight;

    @Column(nullable = false)
    private String pickupAddress;

    private LocalDate pickupDate;

    private String pickupTime;

    private String contactNumber;

    private String notes;

    private Double estimatedPrice;
    
    private Double actualWeight;

    private Double finalPrice;
    
    
    private String otp;
    

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private KabadiStatus status;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {

        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();

        if (status == null) {
            status = KabadiStatus.REQUESTED;
        }
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}