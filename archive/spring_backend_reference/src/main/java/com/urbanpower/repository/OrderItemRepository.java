package com.urbanpower.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.urbanpower.entity.OrderItem;

public interface OrderItemRepository
        extends JpaRepository<OrderItem, Long> {
}