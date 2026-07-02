package com.urbanpower.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.urbanpower.entity.KabadiRequest;

@Repository
public interface KabadiRepository extends JpaRepository<KabadiRequest, Long> {

    long countByStatus(String status);

    List<KabadiRequest> findTop5ByOrderByIdDesc();

    List<KabadiRequest> findByUserId(Long userId);
    
    List<KabadiRequest> findByAgentId(Long agentId);
}