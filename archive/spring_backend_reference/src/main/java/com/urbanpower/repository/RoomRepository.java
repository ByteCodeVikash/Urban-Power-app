package com.urbanpower.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.urbanpower.entity.Room;
import java.util.Optional;

public interface RoomRepository extends JpaRepository<Room, Long> {
    Optional<Room> findByName(String name);
}
