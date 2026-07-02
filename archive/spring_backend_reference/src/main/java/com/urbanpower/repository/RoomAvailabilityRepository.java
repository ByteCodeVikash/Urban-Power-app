package com.urbanpower.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.urbanpower.entity.RoomAvailability;

public interface RoomAvailabilityRepository extends JpaRepository<RoomAvailability, Long> {

    @Query("SELECT ra FROM RoomAvailability ra WHERE ra.room.id = :roomId " +
           "AND ra.startDate < :endDate AND ra.endDate > :startDate")
    List<RoomAvailability> findOverlappingBookings(
            @Param("roomId") Long roomId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
}
