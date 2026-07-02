package com.urbanpower.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "kabadi_sub_categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KabadiSubCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private Double pricePerKg;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private KabadiCategory category;
}