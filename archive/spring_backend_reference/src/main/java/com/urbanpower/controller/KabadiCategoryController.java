package com.urbanpower.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.urbanpower.entity.KabadiCategory;
import com.urbanpower.service.KabadiCategoryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/kabadi/categories")
@RequiredArgsConstructor
public class KabadiCategoryController {
	
	private final KabadiCategoryService service;
	
	@PostMapping("/add")
	public KabadiCategory add(@RequestBody KabadiCategory category) {
		return service.addCategory(category);
	}
	
	@GetMapping
	public List<KabadiCategory>getAll(){
		return service.getAllCategories();
	}

}
