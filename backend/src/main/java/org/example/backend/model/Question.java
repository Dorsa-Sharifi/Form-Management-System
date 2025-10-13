package org.example.backend.model;

import javax.persistence.*;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import lombok.EqualsAndHashCode;

import java.util.ArrayList;


@Getter
@Setter
@ToString(exclude = "page")
@EqualsAndHashCode(exclude = "page")
@Entity
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonProperty("text")
    private String text;
    private String type;  // e.g., "text", "multiple-choice", etc.
    private String dataType;
    private boolean optional;

    @ElementCollection
    @CollectionTable(name = "question_choices", joinColumns = @JoinColumn(name = "question_id"))
    @Column(name = "choice_value")
    @JsonProperty("choices")
    @JsonDeserialize(using = ChoiceDeserializer.class)
    private List<String> choices;  // Can be null if not needed for certain types of questions
    
    // Legacy field - keeping for backward compatibility but not using
    @ElementCollection
    @CollectionTable(name = "question_options", joinColumns = @JoinColumn(name = "question_id"))
    @Column(name = "option_value")
    @JsonIgnore // Ignore this field in JSON serialization/deserialization
    private List<String> options = new ArrayList<>();

    @Column(name = "created_at_ts")
    @JsonProperty("created_at")
    private Long createdAtTs;


    @ManyToOne
    @JoinColumn(name = "page_id", nullable = false)
    @JsonIgnore
    private Page page;

    // Constructor
    public Question(String text, String type, List<String> choices) {
        this.text = text;
        this.type = type;
        this.choices = choices;
    }

    public Question() {

    }
}
