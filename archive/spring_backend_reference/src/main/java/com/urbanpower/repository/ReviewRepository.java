package com.urbanpower.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.urbanpower.entity.Review;

public interface ReviewRepository extends JpaRepository<Review, Long> {
	
	List<Review>findByServiceId(Long serviceId);
	
	@org.springframework.data.jpa.repository.Query(
		    "SELECT AVG(r.rating) FROM Review r WHERE r.service.id = :serviceId"
		)
		Double getAverageRating(Long serviceId);
	
	@Query("""
			SELECT r.service.id
			FROM Review r
			GROUP BY r.service.id
			ORDER BY AVG(r.rating) DESC
			""")
			java.util.List<Long> getTopRatedServiceIds();

}
