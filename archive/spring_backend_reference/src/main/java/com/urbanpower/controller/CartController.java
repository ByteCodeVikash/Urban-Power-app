package com.urbanpower.controller;

import org.springframework.web.bind.annotation.*;

import com.urbanpower.dto.AddToCartRequest;
import com.urbanpower.dto.CartResponseDTO;
import com.urbanpower.service.CartService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    // Add To Cart
    @PostMapping("/add")
    public CartResponseDTO addToCart(
            @RequestBody AddToCartRequest request) {

        return cartService.addToCart(request);
    }

    // Get User Cart
    @GetMapping("/{userId}")
    public CartResponseDTO getUserCart(
            @PathVariable Long userId) {

        return cartService.getUserCart(userId);
    }
    
    
 // Update Quantity
    @PutMapping("/update")
    public CartResponseDTO updateQuantity(

            @RequestParam Long userId,
            @RequestParam Long productId,
            @RequestParam Integer quantity) {

        return cartService.updateQuantity(
                userId,
                productId,
                quantity);
    }
    
    
 // Remove Item
    @DeleteMapping("/remove")
    public CartResponseDTO removeItem(

            @RequestParam Long userId,
            @RequestParam Long productId) {

        return cartService.removeItem(
                userId,
                productId);
    }
}