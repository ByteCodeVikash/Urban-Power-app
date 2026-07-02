package com.urbanpower.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.urbanpower.dto.ServiceRequest;
import com.urbanpower.entity.ServiceEntity;
import com.urbanpower.service.ServiceService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class ServiceController {

    private final ServiceService serviceService;

    // ===============================
    // PUBLIC / USER APIs
    // ===============================

    @GetMapping("/api/services/all")
    public List<ServiceEntity> getAllServices() {
        return serviceService.getAllServices();
    }

    @GetMapping("/api/services/{id}")
    public ServiceEntity getServiceById(
            @PathVariable Long id) {

        return serviceService.getServiceById(id);
    }

    @GetMapping("/api/services/category/{category}")
    public List<ServiceEntity> getByCategory(
            @PathVariable String category) {

        return serviceService.getByCategory(category);
    }

    // ===============================
    // ADMIN APIs
    // ===============================

    @PostMapping("/api/admin/services/add")
   // @PreAuthorize("hasRole('ADMIN')")
    public ServiceEntity addService(
            @RequestBody ServiceRequest request) {

        return serviceService.addService(request);
    }

    @PutMapping("/api/admin/services/update/{id}")
    //@PreAuthorize("hasRole('ADMIN')")
    public ServiceEntity updateService(
            @PathVariable Long id,
            @RequestBody ServiceRequest request) {

        return serviceService.updateService(id, request);
    }

    @DeleteMapping("/api/admin/services/delete/{id}")
    //@PreAuthorize("hasRole('ADMIN')")
    public String deleteService(
            @PathVariable Long id) {

        serviceService.deleteService(id);
        return "Service deleted successfully";
    }
}