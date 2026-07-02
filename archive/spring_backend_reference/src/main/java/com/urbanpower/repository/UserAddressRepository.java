package com.urbanpower.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.urbanpower.entity.UserAddress;

public interface UserAddressRepository extends JpaRepository<UserAddress,Long> {
	
	List<UserAddress> findByUserId(Long userId);

}
