package com.urbanpower.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.urbanpower.entity.Order;

public interface OrderRepository
        extends JpaRepository<Order, Long> {

    List<Order> findByUserId(Long userId);
    
    List<Order> findByDeliveryAgentId(Long agentId);
}