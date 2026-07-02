package com.urbanpower.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.urbanpower.dto.OrderResponseDTO;
import com.urbanpower.entity.OrderStatus;
import com.urbanpower.service.OrderService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    // Checkout / Place Order
    @PostMapping("/place")
    public OrderResponseDTO placeOrder(
            @RequestParam Long userId) {

        return orderService.placeOrder(userId);
    }

    // User Order History
    @GetMapping("/{userId}")
    public List<OrderResponseDTO> getOrders(
            @PathVariable Long userId) {

        return orderService.getUserOrders(userId);
    }
    
 // Track Order
    @GetMapping("/track/{orderId}")
    public OrderResponseDTO trackOrder(
            @PathVariable Long orderId) {

        return orderService.getOrderById(orderId);
    }
    
 // Update Delivery Status
    @PutMapping("/status")
    public OrderResponseDTO updateStatus(

            @RequestParam Long orderId,

            @RequestParam OrderStatus status) {

        return orderService.updateOrderStatus(
                orderId,
                status);
    }
    
 // Delivery Agent Orders
    @GetMapping("/delivery-agent/{agentId}")
    public List<OrderResponseDTO>
    getDeliveryOrders(
            @PathVariable Long agentId) {

        return orderService
                .getOrdersByDeliveryAgent(agentId);
    }
}