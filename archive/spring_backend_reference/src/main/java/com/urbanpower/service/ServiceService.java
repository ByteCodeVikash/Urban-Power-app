package com.urbanpower.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.urbanpower.dto.ServiceRequest;
import com.urbanpower.entity.ServiceEntity;
import com.urbanpower.exception.ResourceNotFoundException;
import com.urbanpower.repository.ServiceRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ServiceService {

    private final ServiceRepository serviceRepository;

    // Add Service
    public ServiceEntity addService(ServiceRequest request) {

        ServiceEntity service = ServiceEntity.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .category(request.getCategory())
                .build();

        return serviceRepository.save(service);
    }

    // Get All Services
    public List<ServiceEntity> getAllServices() {
        return serviceRepository.findAll();
    }

    // Get By Id
    public ServiceEntity getServiceById(Long id) {

        return serviceRepository.findById(id)
                .orElseThrow(() ->
                    new ResourceNotFoundException(
                        "Service not found"));
    }

    // Get By Category
    public List<ServiceEntity> getByCategory(
            String category) {

        return serviceRepository
                .findByCategoryIgnoreCase(category);
    }

    // Update Service
    public ServiceEntity updateService(
            Long id,
            ServiceRequest request) {

        ServiceEntity service =
                getServiceById(id);

        service.setName(request.getName());
        service.setDescription(
                request.getDescription());
        service.setPrice(request.getPrice());
        service.setCategory(
                request.getCategory());

        return serviceRepository.save(service);
    }

    // Delete Service
    public void deleteService(Long id) {

        ServiceEntity service =
                getServiceById(id);

        serviceRepository.delete(service);
    }
}