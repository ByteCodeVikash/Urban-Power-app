package com.urbanpower.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.urbanpower.dto.ReviewRequest;
import com.urbanpower.entity.Review;
import com.urbanpower.entity.ServiceEntity;
import com.urbanpower.entity.User;
import com.urbanpower.exception.ResourceNotFoundException;
import com.urbanpower.repository.ReviewRepository;
import com.urbanpower.repository.ServiceRepository;
import com.urbanpower.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ServiceRepository serviceRepository;

    public Review addReview(ReviewRequest request) {

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        ServiceEntity service = serviceRepository.findById(request.getServiceId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Service not found"));

        Review review = Review.builder()
                .rating(request.getRating())
                .comment(request.getComment())
                .user(user)
                .service(service)
                .build();

        return reviewRepository.save(review);
    }

    public List<Review> getServiceReviews(Long serviceId) {
        return reviewRepository.findByServiceId(serviceId);
    }
    
    public Double getAverageRating(Long serviceId) {

        Double avg = reviewRepository.getAverageRating(serviceId);

        return avg != null ? avg : 0.0;
    }
    
    public java.util.List<ServiceEntity> getTopRatedServices() {

        java.util.List<Long> ids =
                reviewRepository.getTopRatedServiceIds();

        return ids.stream()
                .map(id -> serviceRepository.findById(id).orElse(null))
                .filter(java.util.Objects::nonNull)
                .limit(5)
                .toList();
    }
    
    
}