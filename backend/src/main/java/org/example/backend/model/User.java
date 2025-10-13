package org.example.backend.model;

import javax.persistence.*;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;

@Data
@Entity
@Table(name = "users",
        uniqueConstraints = @UniqueConstraint(columnNames = "username"))
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonIgnore
    private Long id;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false)
    @JsonIgnore
    private String password;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    private AuthProvider provider;      // LOCAL or GOOGLE
    private String providerId;          // Google "sub" value

    @Column(nullable = false)
    private Role role;

    public User() { }

    public User(String username, String password, Role role, String name) {
        this.username = username;
        this.password = password;
        this.role = role;
        this.name = name;
        this.provider = AuthProvider.LOCAL;
    }

    public User(String sub, String name) {
        this.username = sub;
        this.name = name;
        this.provider = AuthProvider.GOOGLE;
    }


}
