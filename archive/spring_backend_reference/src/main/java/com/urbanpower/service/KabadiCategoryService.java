package com.urbanpower.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.urbanpower.entity.KabadiCategory;
import com.urbanpower.repository.KabadiCategoryRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class KabadiCategoryService {
	
	private final KabadiCategoryRepository categoryRepo;
	
	public KabadiCategory addCategory(KabadiCategory category) {
		return categoryRepo.save(category);
		
	}
	
	public List<KabadiCategory>getAllCategories(){
		return categoryRepo.findAll();
	}
	

}
