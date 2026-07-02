package com.urbanpower.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.urbanpower.dto.ReviewRequest;
import com.urbanpower.dto.common.ApiResponse;
import com.urbanpower.entity.Review;
import com.urbanpower.entity.ServiceEntity;
import com.urbanpower.service.ReviewService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {
	
	private final ReviewService reviewService;
	
	@PostMapping("/add")
	public ResponseEntity<ApiResponse<Review>> addReview(@RequestBody ReviewRequest request){
		
		return ResponseEntity.ok(
				new ApiResponse<>(
						true,
						"Review added successfully",
						reviewService.addReview(request)
						)
				);
	}
	
	@GetMapping("/service/{serviceId}")
	public ResponseEntity<ApiResponse<List<Review>>> getServiceReviews(
			@PathVariable Long serviceId){
		return ResponseEntity.ok(
				new ApiResponse<>(
						true,
						"Reviews fetched successfully",
						reviewService.getServiceReviews(serviceId)
						)
				);
	}
	
	@GetMapping("/top-services")
	public ResponseEntity<ApiResponse<List<ServiceEntity>>> getTopServices() {

	    return ResponseEntity.ok(
	            new ApiResponse<>(
	                    true,
	                    "Top rated services fetched successfully",
	                    reviewService.getTopRatedServices()
	            )
	    );
	}
			

}
