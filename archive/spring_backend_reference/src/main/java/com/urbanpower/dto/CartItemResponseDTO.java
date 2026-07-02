package com.urbanpower.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CartItemResponseDTO {
	
	private Long productId;
	
	private String productName;
	
	private Double productPrice;
	
	private Integer quantity;
	
	private Double subtotal;

}
