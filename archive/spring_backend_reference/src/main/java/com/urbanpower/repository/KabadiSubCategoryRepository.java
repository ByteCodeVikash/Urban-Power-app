package com.urbanpower.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.urbanpower.entity.KabadiSubCategory;

import java.util.List;

public interface KabadiSubCategoryRepository extends JpaRepository<KabadiSubCategory, Long> {

    List<KabadiSubCategory> findByCategoryId(Long categoryId);
}