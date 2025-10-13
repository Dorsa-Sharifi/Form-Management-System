package org.example.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import lombok.EqualsAndHashCode;

import javax.persistence.*;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@ToString(exclude = {"form", "questions"})
@EqualsAndHashCode(exclude = {"form", "questions"})
@Entity
public class Page {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int pageIndex;

    @ManyToOne
    @JoinColumn(name = "form_id")
    @JsonIgnore
    private Form form;

    @OneToMany(mappedBy = "page", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Question> questions = new HashSet<Question>();

    public Page() {}


    public void setQuestions(Set<Question> questions) {
        this.questions.clear();
        if (questions != null) {
            this.questions.addAll(questions);
        }
    }
}
