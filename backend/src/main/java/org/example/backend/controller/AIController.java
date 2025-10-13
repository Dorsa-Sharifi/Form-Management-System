package org.example.backend.controller;

import org.example.backend.dto.AIFormRequest;
import org.example.backend.model.CustomUserDetail;
import org.example.backend.model.Form;
import org.example.backend.model.User;
import org.example.backend.service.AIFormGenerationService;
import org.example.backend.service.CustomUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AIController {

    @Autowired
    private AIFormGenerationService aiFormGenerationService;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @PostMapping("/preview-form")
    public ResponseEntity<?> previewForm(@RequestBody @Valid AIFormRequest request, Authentication authentication) {
        try {
            // Manual validation
            // if (!request.isValid()) {
            //     Map<String, Object> response = new HashMap<>();
            //     response.put("success", false);
            //     response.put("message", request.getValidationError());
            //     return ResponseEntity.badRequest().body(response);
            // }
            
            Map<String, Object> preview = aiFormGenerationService.previewForm(request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Form preview generated successfully");
            response.put("form", preview);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to generate form preview: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/generate-form")
    public ResponseEntity<Form> generateForm(@RequestBody @Valid AIFormRequest request, @AuthenticationPrincipal CustomUserDetail userDetails ) {
        try {
            // Manual validation
//            if (!request.isValid()) {
//                Map<String, Object> response = new HashMap<>();
//                response.put("success", false);
//                response.put("message", request.getValidationError());
//                return ResponseEntity.badRequest().body(response);
//            }
//
            User user = userDetails.getUser();

            
            Form form = aiFormGenerationService.generateForm(request, user);
            
            return ResponseEntity.ok(form);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new Form());
        }
    }

    private Map<String, Object> convertFormToMap(Form form) {
        Map<String, Object> formMap = new HashMap<>();
        formMap.put("id", form.getId());
        formMap.put("title", form.getTitle());
        formMap.put("description", form.getDescription());

        return formMap;
    }
}
