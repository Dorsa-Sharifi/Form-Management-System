package org.example.backend.dto;

import org.example.backend.model.Form;

public class AIFormResponse {
    
    private boolean success;
    private String message;
    private Form form;
    private String generationId; // Optional: for tracking
    
    public AIFormResponse() {}
    
    public boolean isSuccess() {
        return success;
    }
    
    public void setSuccess(boolean success) {
        this.success = success;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public Form getForm() {
        return form;
    }
    
    public void setForm(Form form) {
        this.form = form;
    }
    
    public String getGenerationId() {
        return generationId;
    }
    
    public void setGenerationId(String generationId) {
        this.generationId = generationId;
    }
}
