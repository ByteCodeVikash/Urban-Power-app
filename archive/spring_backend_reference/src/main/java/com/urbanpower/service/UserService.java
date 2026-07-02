package com.urbanpower.service;

import java.util.List;

import com.urbanpower.entity.User;
import com.urbanpower.repository.UserRepository;

public class UserService {
	
	private final UserRepository repo;

    public UserService(UserRepository repo) {
        this.repo = repo;
    }

    public User register(User user) {
        return repo.save(user);
    }

    public List<User> getAll() {
        return repo.findAll();
    }
	
	
}
