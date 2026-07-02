package com.urbanpower.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.urbanpower.dto.ProductRequestDTO;
import com.urbanpower.dto.ProductResponseDTO;
import com.urbanpower.service.ProductService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor

public class ProductController {
	
	private final ProductService productService;
	
	//Add Product
	@PostMapping
	public ProductResponseDTO addProduct(
			@RequestBody ProductRequestDTO dto) {
		return productService.addProduct(dto);
	}
	
		//Get ALL Products
	
	@GetMapping
	public List<ProductResponseDTO>getAllProducts(){
		
		return productService.getAllProducts();
	}
	
	//Get Products By Category
	@GetMapping("/category/{categoryId}")
	public List<ProductResponseDTO>getByCategory( 
			@PathVariable Long categoryId){
		
		return productService.getProductsByCategory(categoryId);
	}
	

}
