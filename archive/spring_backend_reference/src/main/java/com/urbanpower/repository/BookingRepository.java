package com.urbanpower.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.urbanpower.entity.Booking;

public interface BookingRepository extends JpaRepository<Booking, Long> {

	List<Booking> findByUserId(Long userId);
	List<Booking> findByTechnicianId(Long technicianId);
	List<Booking> findByDate(LocalDate date);
}
