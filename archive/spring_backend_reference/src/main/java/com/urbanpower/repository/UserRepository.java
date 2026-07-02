package com.urbanpower.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.urbanpower.entity.Role;

import com.urbanpower.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByPhone(String phone);
    long countByRole( Role role);
    
    boolean existsByPhone(String phone);

    boolean existsByEmail(String email);
}
