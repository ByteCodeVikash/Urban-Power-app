package com.urbanpower.dto;

import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder

public class CartResponseDTO {
	
	private Long cartId;
	
	private Long userId;
	
	private List<CartItemResponseDTO> items;
	
	private Double totalAmount;
	

}
