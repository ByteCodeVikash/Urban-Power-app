package com.urbanpower.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.urbanpower.dto.KabadiRequestDTO;
import com.urbanpower.entity.KabadiCategory;
import com.urbanpower.entity.KabadiRequest;
import com.urbanpower.entity.KabadiStatus;
import com.urbanpower.entity.KabadiSubCategory;
import com.urbanpower.entity.Role;
import com.urbanpower.entity.User;
import com.urbanpower.exception.ResourceNotFoundException;
import com.urbanpower.repository.KabadiCategoryRepository;
import com.urbanpower.repository.KabadiRepository;
import com.urbanpower.repository.KabadiSubCategoryRepository;
import com.urbanpower.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class KabadiService {

    private final KabadiRepository kabadiRepository;
    private final UserRepository userRepository;
    private final KabadiCategoryRepository categoryRepository;
    private final KabadiSubCategoryRepository subCategoryRepository;

    // 1. Create Request
    public KabadiRequest createRequest(KabadiRequestDTO dto) {

        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() ->
                    new ResourceNotFoundException("User not found"));

        KabadiCategory category = categoryRepository
                .findById(dto.getCategoryId())
                .orElseThrow(() ->
                    new ResourceNotFoundException("Category not found"));

        KabadiSubCategory subCategory = subCategoryRepository
                .findById(dto.getSubCategoryId())
                .orElseThrow(() ->
                    new ResourceNotFoundException("SubCategory not found"));

        Double estimatedPrice =
                dto.getWeight() * subCategory.getPricePerKg();

        KabadiRequest request = KabadiRequest.builder()
                .user(user)
                .category(category)
                .subCategory(subCategory)
                .weight(dto.getWeight())
                .pickupAddress(dto.getPickupAddress())
                .pickupDate(dto.getPickupDate())
                .pickupTime(dto.getPickupTime())
                .contactNumber(dto.getContactNumber())
                .notes(dto.getNotes())
                .estimatedPrice(estimatedPrice)
                .status(KabadiStatus.REQUESTED)
                .build();

        return kabadiRepository.save(request);
    }

    // 2. Assign Agent
    public KabadiRequest assignAgent(
            Long requestId,
            Long agentId) {

        KabadiRequest request = kabadiRepository
                .findById(requestId)
                .orElseThrow(() ->
                    new ResourceNotFoundException(
                        "Request not found"));

        User agent = userRepository.findById(agentId)
                .orElseThrow(() ->
                    new ResourceNotFoundException(
                        "Agent not found"));

        if (agent.getRole() != Role.TECHNICIAN
                && agent.getRole() != Role.ADMIN) {

            throw new RuntimeException(
                "Invalid agent role");
        }

        request.setAgent(agent);
        request.setStatus(KabadiStatus.ASSIGNED);

        return kabadiRepository.save(request);
    }

    // 3. Complete Pickup
    public KabadiRequest completeRequest(
            Long requestId) {

        KabadiRequest request = kabadiRepository
                .findById(requestId)
                .orElseThrow(() ->
                    new ResourceNotFoundException(
                        "Request not found"));

        request.setStatus(KabadiStatus.COMPLETED);

        return kabadiRepository.save(request);
    }
    
    // 4. Get Rate Chart
    public List<KabadiSubCategory> getRates() {
        return subCategoryRepository.findAll();
    }
    
 // 5. Get User Pickup History
    public List<KabadiRequest> getUserRequests(Long userId) {
        return kabadiRepository.findByUserId(userId);
    }
    
    
    public List<KabadiRequest> getAgentRequests(Long agentId) {
        return kabadiRepository.findByAgentId(agentId);
    }
    
    
    public KabadiRequest finalizeRequest(Long requestId, Double actualWeight) {

        KabadiRequest request = kabadiRepository.findById(requestId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Request not found"));

        Double rate = request.getSubCategory().getPricePerKg();
        Double finalPrice = actualWeight * rate;

        request.setActualWeight(actualWeight);
        request.setFinalPrice(finalPrice);

        return kabadiRepository.save(request);
    }
    
    public KabadiRequest generateOtp(Long requestId) {

        KabadiRequest request = kabadiRepository.findById(requestId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Request not found"));

        String otp = String.valueOf((int)(1000 + Math.random() * 9000));

        request.setOtp(otp);

        return kabadiRepository.save(request);
    }
    
    
    public KabadiRequest verifyOtp(Long requestId, String otp) {

        KabadiRequest request = kabadiRepository.findById(requestId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Request not found"));

        if (!otp.equals(request.getOtp())) {
            throw new RuntimeException("Invalid OTP");
        }

        request.setStatus(KabadiStatus.COMPLETED);
        
        User user= request.getUser();
        
        Double cashback=request.getFinalPrice()*0.05;
        
        if(user.getWalletBalance()==null) {
        	user.setWalletBalance(0.0);
        }
        
        user.setWalletBalance(
        		user.getWalletBalance()+cashback
        		);
        
        userRepository.save(user);

        return kabadiRepository.save(request);
    }
    
    		
   	
}