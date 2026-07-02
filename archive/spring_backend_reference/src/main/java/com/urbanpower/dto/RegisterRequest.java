package com.urbanpower.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
	
	 @NotBlank(message = "Name is required")
	private String name;
	 
	 @Email(message = "Invalid email")
	  @NotBlank(message = "Email is required")
	private String email;
	 
	 @Size(min = 6, message = "Password minimum 6 chars")
	 @NotBlank(message = "Password is required")
	private String password;
	 
	 @Pattern(
		        regexp = "^[0-9]{10}$",
		        message = "Phone must be 10 digits"
		    )
	 
	
	private String phone;
//	 @NotBlank(message = "Address is required")
//	private String address;
	 
	//  @NotBlank(message = "Role is required")
	//private String role;

}
