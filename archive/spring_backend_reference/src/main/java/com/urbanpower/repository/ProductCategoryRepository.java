package com.urbanpower.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.urbanpower.entity.ProductCategory;

public interface ProductCategoryRepository 
		extends JpaRepository<ProductCategory,Long>{

}
