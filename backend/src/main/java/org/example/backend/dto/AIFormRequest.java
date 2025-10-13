package org.example.backend.dto;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Max;
import javax.validation.constraints.Min;

public class AIFormRequest {

    @NotBlank(message = "Prompt is required")
    private String prompt;

    private String formType = "general";

    private String language = "en";

    @Min(value = 1, message = "Maximum questions must be at least 1")
    @Max(value = 50, message = "Maximum questions cannot exceed 50")
    private Integer maxQuestions = 15;

    // Constructors
    public AIFormRequest() {}

    public AIFormRequest(String prompt, String formType, String language, Integer maxQuestions) {
        this.prompt = prompt;
        this.formType = formType;
        this.language = language;
        this.maxQuestions = maxQuestions;
    }

    // Getters and Setters
    public String getPrompt() {
        return prompt;
    }

    public void setPrompt(String prompt) {
        this.prompt = prompt;
    }

    public String getFormType() {
        return formType;
    }

    public void setFormType(String formType) {
        this.formType = formType;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public Integer getMaxQuestions() {
        return maxQuestions;
    }

    public void setMaxQuestions(Integer maxQuestions) {
        this.maxQuestions = maxQuestions;
    }
}
