package com.urbanpower.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.urbanpower.dto.AddToCartRequest;
import com.urbanpower.dto.CartItemResponseDTO;
import com.urbanpower.dto.CartResponseDTO;
import com.urbanpower.entity.Cart;
import com.urbanpower.entity.CartItem;
import com.urbanpower.entity.Product;
import com.urbanpower.entity.User;
import com.urbanpower.exception.ResourceNotFoundException;
import com.urbanpower.repository.CartRepository;
import com.urbanpower.repository.ProductRepository;
import com.urbanpower.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CartService {
	
	private final CartRepository cartRepository;
	private final ProductRepository productRepository;
	private final UserRepository userRepository;
	
	// Add To Cart
	
	public CartResponseDTO addToCart(AddToCartRequest request) {
		
		User user=userRepository.findById(request.getUserId())
				.orElseThrow(() ->
				new ResourceNotFoundException("User not found"));
		
		Product product =productRepository.findById(request.getProductId())
				
				.orElseThrow(()-> 
				new ResourceNotFoundException("Product not found"));
		
		Cart cart = cartRepository.findByUserId(user.getId())
				.orElse(
						Cart.builder()
								.user(user)
								.build()
				);
		
		// Check if product already exists in cart
		CartItem existingItem = cart.getItems()
		        .stream()
		        .filter(i ->
		                i.getProduct().getId()
		                        .equals(product.getId()))
		        .findFirst()
		        .orElse(null);

		if (existingItem != null) {

		    // Update quantity
		    existingItem.setQuantity(
		            existingItem.getQuantity()
		                    + request.getQuantity());

		    existingItem.setSubtotal(
		            existingItem.getQuantity()
		                    * product.getPrice());

		} else {

		    // Add new item
		    CartItem item = CartItem.builder()
		            .cart(cart)
		            .product(product)
		            .quantity(request.getQuantity())
		            .subtotal(
		                    product.getPrice()
		                            * request.getQuantity())
		            .build();

		    cart.getItems().add(item);
		}
				
		
		double total=cart.getItems()
				.stream()
				.mapToDouble(CartItem::getSubtotal)
				.sum();
		
		cart.setTotalAmount(total);
		
		Cart savedCart=cartRepository.save(cart);
		
		return mapToDTO(savedCart);
		
	}
	
	
	// Get User Cart
	public CartResponseDTO getUserCart(Long userId) {

	    Cart cart = cartRepository.findByUserId(userId)
	            .orElseThrow(() ->
	                    new ResourceNotFoundException("Cart not found"));

	    return mapToDTO(cart);
	}
	
	// Convert Entity -> DTO
	
	private CartResponseDTO mapToDTO(Cart cart) {
		
		List<CartItemResponseDTO> itemDTOs=new ArrayList<>();
		
		for(CartItem item:cart.getItems()) {
			
			itemDTOs.add(
					CartItemResponseDTO.builder()
					.productId(item.getProduct().getId())
					.productName(item.getProduct().getName())
					.productPrice(item.getProduct().getPrice())
					.quantity(item.getQuantity())
					.subtotal(item.getSubtotal())
					.build()
			);
		}
		
		return CartResponseDTO.builder()
				.cartId(cart.getId())
				.userId(cart.getUser().getId())
				.items(itemDTOs)
				.totalAmount(cart.getTotalAmount())
				.build();
	}
	
	
	// Update Cart Item Quantity
	public CartResponseDTO updateQuantity(
	        Long userId,
	        Long productId,
	        Integer quantity) {

	    Cart cart = cartRepository.findByUserId(userId)
	            .orElseThrow(() ->
	                    new ResourceNotFoundException("Cart not found"));

	    CartItem item = cart.getItems()
	            .stream()
	            .filter(i ->
	                    i.getProduct().getId()
	                            .equals(productId))
	            .findFirst()
	            .orElseThrow(() ->
	                    new ResourceNotFoundException(
	                            "Product not found in cart"));

	    item.setQuantity(quantity);

	    item.setSubtotal(
	            item.getProduct().getPrice() * quantity);

	    double total = cart.getItems()
	            .stream()
	            .mapToDouble(CartItem::getSubtotal)
	            .sum();

	    cart.setTotalAmount(total);

	    Cart updatedCart = cartRepository.save(cart);

	    return mapToDTO(updatedCart);
	}
	
	
	// Remove Item From Cart
	public CartResponseDTO removeItem(
	        Long userId,
	        Long productId) {

	    Cart cart = cartRepository.findByUserId(userId)
	            .orElseThrow(() ->
	                    new ResourceNotFoundException("Cart not found"));

	    cart.getItems().removeIf(item ->
	            item.getProduct().getId()
	                    .equals(productId));

	    double total = cart.getItems()
	            .stream()
	            .mapToDouble(CartItem::getSubtotal)
	            .sum();

	    cart.setTotalAmount(total);

	    Cart updatedCart = cartRepository.save(cart);

	    return mapToDTO(updatedCart);
	}

}
