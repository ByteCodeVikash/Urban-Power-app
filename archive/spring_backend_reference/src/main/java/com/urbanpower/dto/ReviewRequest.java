package com.urbanpower.dto;

import lombok.Data;

@Data 
public class ReviewRequest {
	
	private Long userId;
	private Long serviceId;
	private Integer rating;
	private String comment;

}
