package org.example.backend.service;

import org.example.backend.model.CustomUserDetail;
import org.example.backend.model.User;
import org.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository repo;

    @Autowired
    public CustomUserDetailsService(UserRepository repo) {
        this.repo = repo;
    }

    @Override
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {
        User user = repo.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return new CustomUserDetail(user);
    }

    /**
     * Get all users with their ID and username
     * @return List of maps containing user ID and username
     */
    public List<Map<String, Object>> getAllUsersId() {
        List<User> users = repo.findAll();
        List<Map<String, Object>> userDetailsList = new ArrayList<>();
        
        if (users != null) {
            for (User user : users) {
                Map<String, Object> userDetail = new HashMap<>();
                userDetail.put("id", user.getId());
                userDetail.put("username", user.getUsername());
                userDetailsList.add(userDetail);
            }
        }
        
        return userDetailsList;
    }

    /**
     * Get user by ID
     * @param id User ID
     * @return User object or null if not found
     */
    public User getUserById(Long id) {
        return repo.findById(id).orElse(null);
    }

    /**
     * Get user by username
     * @param username Username
     * @return User object or null if not found
     */
    public User getUserByUsername(String username) {
        return repo.findByUsername(username).orElse(null);
    }

    /**
     * Get all users
     * @return List of all users
     */
    public List<User> getAllUsers() {
        return repo.findAll();
    }
}
