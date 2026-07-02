package com.urbanpower.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.urbanpower.entity.ServiceEntity;

public interface ServiceRepository extends JpaRepository<ServiceEntity, Long> {
	
	 List<ServiceEntity>
	    findByCategoryIgnoreCase(String category);
}