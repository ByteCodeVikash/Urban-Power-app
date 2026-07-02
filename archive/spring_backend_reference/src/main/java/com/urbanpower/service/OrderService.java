package com.urbanpower.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.urbanpower.dto.OrderItemResponseDTO;
import com.urbanpower.dto.OrderResponseDTO;
import com.urbanpower.entity.Cart;
import com.urbanpower.entity.CartItem;
import com.urbanpower.entity.DeliveryAgent;
import com.urbanpower.entity.Order;
import com.urbanpower.entity.OrderItem;
import com.urbanpower.entity.OrderStatus;
import com.urbanpower.exception.ResourceNotFoundException;
import com.urbanpower.repository.CartRepository;
import com.urbanpower.repository.DeliveryAgentRepository;
import com.urbanpower.repository.OrderRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final CartRepository cartRepository;
    private final OrderRepository orderRepository;
    private final DeliveryAgentRepository deliveryAgentRepository;

    // Place Order
    public OrderResponseDTO placeOrder(Long userId) {

        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Cart not found"));
        
     // Find available delivery agent
        DeliveryAgent agent =
                deliveryAgentRepository
                        .findFirstByAvailableTrue()
                        .orElse(null);

        // Generate tracking ID
        String trackingId =
                "TRK-" + System.currentTimeMillis();

        Order order = Order.builder()
                .user(cart.getUser())
                .totalAmount(cart.getTotalAmount())
                .status(OrderStatus.PLACED)
                .deliveryAgent(agent)
                .trackingId(trackingId)
                .build();

        List<OrderItem> orderItems = new ArrayList<>();

        for (CartItem cartItem : cart.getItems()) {

            OrderItem item = OrderItem.builder()
                    .order(order)
                    .product(cartItem.getProduct())
                    .quantity(cartItem.getQuantity())
                    .subtotal(cartItem.getSubtotal())
                    .build();

            orderItems.add(item);
        }

        order.setItems(orderItems);

        Order savedOrder = orderRepository.save(order);

        // Clear Cart After Checkout
        cart.getItems().clear();
        cart.setTotalAmount(0.0);

        cartRepository.save(cart);

        return mapToDTO(savedOrder);
    }

    // Get User Orders
    public List<OrderResponseDTO> getUserOrders(Long userId) {

        List<Order> orders =
                orderRepository.findByUserId(userId);

        return orders.stream()
                .map(this::mapToDTO)
                .toList();
    }

    // Entity -> DTO
    private OrderResponseDTO mapToDTO(Order order) {

        List<OrderItemResponseDTO> items =
                new ArrayList<>();

        for (OrderItem item : order.getItems()) {

            items.add(
                    OrderItemResponseDTO.builder()
                            .productId(item.getProduct().getId())
                            .productName(item.getProduct().getName())
                            .quantity(item.getQuantity())
                            .subtotal(item.getSubtotal())
                            .build()
            );
        }

        return OrderResponseDTO.builder()
                .orderId(order.getId())
                .userId(order.getUser().getId())
                .items(items)
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .trackingId(order.getTrackingId())
                .deliveryAgentName(
                        order.getDeliveryAgent() != null
                                ? order.getDeliveryAgent().getName()
                                : null
                )
                .build();
    }
    
 // Get Order By ID
    public OrderResponseDTO getOrderById(Long orderId) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Order not found"));

        return mapToDTO(order);
    }
    
 // Update Order Status
    public OrderResponseDTO updateOrderStatus(
            Long orderId,
            OrderStatus status) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Order not found"));

        order.setStatus(status);

        Order updatedOrder =
                orderRepository.save(order);

        return mapToDTO(updatedOrder);
    }
    
 // Get Orders Assigned To Delivery Agent
    public List<OrderResponseDTO>
    getOrdersByDeliveryAgent(Long agentId) {

        List<Order> orders =
                orderRepository
                        .findByDeliveryAgentId(agentId);

        return orders.stream()
                .map(this::mapToDTO)
                .toList();
    }
}