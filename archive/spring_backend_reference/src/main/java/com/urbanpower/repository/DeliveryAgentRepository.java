package com.urbanpower.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.urbanpower.entity.DeliveryAgent;

public interface DeliveryAgentRepository
        extends JpaRepository<DeliveryAgent, Long> {

    Optional<DeliveryAgent>
    findFirstByAvailableTrue();
}