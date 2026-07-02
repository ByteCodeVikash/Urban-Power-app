package com.urbanpower.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.urbanpower.entity.Product;

public interface ProductRepository extends JpaRepository<Product,Long>{
	
	List<Product> findByActiveTrue();
	
	List<Product> findByCategoryId(Long categoryId);

}
