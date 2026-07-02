package com.urbanpower.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name ="products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {
	
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	
	private Long id;
	
	@Column(nullable=false)
	private String name;
	
	@Column(length=2000)
	private String description;
	
	private Double price;
	
	private Integer stockQuantity;
	
	private String brand;
	
	private String imageUrl;
	
	@Builder.Default
	private boolean active = true;
	
	//private boolean active = true;
	
	private LocalDateTime createdAt;
	
	@ManyToOne
	@JoinColumn(name="category_id")
	private ProductCategory category;
	
	@PrePersist
	
	public void prePersist() {
		createdAt = LocalDateTime.now();
	}

}
