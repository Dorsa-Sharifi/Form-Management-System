package org.example.backend.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import lombok.EqualsAndHashCode;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@ToString(exclude = {"owner", "pages", "allowedUsers"})
@EqualsAndHashCode(exclude = {"owner", "pages", "allowedUsers"})
@Entity
public class Form {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonProperty("title")
    private String title;

    private String description;

    @ManyToOne
    @JoinColumn(name = "owner_id")
    private User owner;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "form_id")
    private List<Page> pages = new ArrayList<Page>();

    @ManyToMany
    @JoinTable(
        name = "form_allowed_users",
        joinColumns = @JoinColumn(name = "form_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private List<User> allowedUsers = new ArrayList<>();

    //user can fill the form If and Only If the form is active and not expired
    private boolean isTemplate;
    private boolean isActive;
    private boolean isExpired;


    // Constructor
    public Form(String title, String description, List<Page> pages, User owner) {
        this.title = title;
        this.description = description;
        this.pages = pages;
    }

    public Form() {}


    public void setPages(List<Page> pages) {
        this.pages.clear();
        if (pages != null) {
            this.pages.addAll(pages);
        }
    }
}
