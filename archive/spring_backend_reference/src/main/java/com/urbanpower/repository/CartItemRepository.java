package com.urbanpower.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.urbanpower.entity.CartItem;

public interface CartItemRepository extends JpaRepository<CartItem,Long>{
	
	

}
