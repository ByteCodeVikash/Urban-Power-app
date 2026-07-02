package com.urbanpower.dto;

import java.util.List;

import com.urbanpower.entity.OrderStatus;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OrderResponseDTO {

    private Long orderId;

    private Long userId;

    private List<OrderItemResponseDTO> items;

    private Double totalAmount;

    private OrderStatus status;
    
    private String trackingId;

    private String deliveryAgentName;
}