package org.example.backend.controller;

import org.example.backend.model.CustomUserDetail;
import org.example.backend.model.Form;
import org.example.backend.model.User;
import org.example.backend.service.FormDataService;
import org.example.backend.service.FormService;
import org.example.backend.service.QueryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.example.backend.dto.ReportRequest;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class FormController {

    private final FormService formService;
    private final FormDataService  formDataService;
    private final QueryService queryService;

    @Autowired
    public FormController(FormService formService, FormDataService formDataService , QueryService queryService) {
        this.formService = formService;
        this.formDataService = formDataService;
        this.queryService = queryService ;
    }

    @PostMapping("/form")
    public ResponseEntity<Form> createForm(@RequestBody Form newForm,
                                           @AuthenticationPrincipal CustomUserDetail userDetails) {
        User user = userDetails.getUser();

        Form createdForm = formService.createFormWithDefaults(newForm, user);

        // Clean up any orphaned tables first
        formDataService.cleanupOrphanedTables();

        // Create the dynamic table for form data after all questions have been saved
        formDataService.createFormTable(createdForm);

        return ResponseEntity.ok(createdForm);
    }

    @PutMapping("/form/{formId}")
    public ResponseEntity<Form> updateForm(@PathVariable Long formId,
                                           @RequestBody Form updatedForm,
                                           @AuthenticationPrincipal CustomUserDetail userDetails) {
        User user = userDetails.getUser();

        Form savedForm = formService.updateFormWithOwnershipCheck(formId, updatedForm, user);
        if (savedForm == null) {
            return ResponseEntity.notFound().build();
        }

        // Update the form table with new structure (preserving existing data)
        formDataService.updateFormTable(savedForm);

        return ResponseEntity.ok(savedForm);
    }

    @GetMapping("/forms")
    public ResponseEntity<List<Form>> getAllForms(@AuthenticationPrincipal CustomUserDetail userDetails) {
        User user = userDetails.getUser();
        List<Form> forms = this.formService.getAllFormsByOwner(user);
        return ResponseEntity.ok(forms);
    }

    @GetMapping("/forms/templates")
    public ResponseEntity<List<Form>> getTemplateForms(@AuthenticationPrincipal CustomUserDetail userDetails) {
        User user = userDetails.getUser();
        List<Form> templates = this.formService.getTemplateFormsByOwner(user);
        return ResponseEntity.ok(templates);
    }

    @GetMapping("/forms/active")
    public ResponseEntity<List<Form>> getActiveForms(@AuthenticationPrincipal CustomUserDetail userDetails) {
        User user = userDetails.getUser();
        List<Form> activeForms = this.formService.getActiveFormsByOwner(user);
        return ResponseEntity.ok(activeForms);
    }

    @PutMapping("/form/{formId}/template")
    public ResponseEntity<Form> setFormAsTemplate(@PathVariable Long formId,
                                                  @AuthenticationPrincipal CustomUserDetail userDetails) {
        User user = userDetails.getUser();
        Form updatedForm = formService.setFormAsTemplate(formId, user);
        if (updatedForm == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updatedForm);
    }

    @GetMapping("/form/{formId}")
    public ResponseEntity<Form> getFormById(@PathVariable Long formId,
                                            @AuthenticationPrincipal CustomUserDetail userDetails) {
        User user = userDetails.getUser();
        Form form = formService.getFormById(formId);

        if (form == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(form);
    }

    @GetMapping("/form/{formId}/results")
    public ResponseEntity<List<Map<String, Object>>> getFormResultsById(@PathVariable Long formId,
                                                                        @AuthenticationPrincipal CustomUserDetail userDetails) {
        User user = userDetails.getUser();
        Form form = formService.validateFormOwnershipAndGet(formId, user);
        if (form == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(formDataService.getFormData(formId));
    }

    @PostMapping("/form/{formId}/submit")
    public ResponseEntity<String> submitFormData(
            @PathVariable Long formId,
            @RequestBody Map<String, Object> formData,
            @AuthenticationPrincipal CustomUserDetail userDetails
    ) {
        System.out.println("Received form data for form ID: " + formId);

        if (!formService.validateFormSubmission(formId)) {
            return ResponseEntity.notFound().build();
        }

        // Insert form data into the dynamic table
        formDataService.insertFormData(formId, formData, userDetails.getUser().getId());
        return ResponseEntity.ok("Form data submitted successfully!");
    }

    @GetMapping("/form/{formId}/fields")
    public ResponseEntity<List<Map<String, Object>>> getFormFields(@PathVariable Long formId,
                                                                   @AuthenticationPrincipal CustomUserDetail userDetails) {
        User user = userDetails.getUser();
        Form form = formService.validateFormOwnershipAndGet(formId, user);
        if (form == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(formDataService.getFormFields(formId));
    }

    @PostMapping("/form/{formId}/query")
    public ResponseEntity<List<Map<String, Object>>> runAggregatedQuery(
            @PathVariable Long formId,
            @RequestBody ReportRequest request,
            @AuthenticationPrincipal CustomUserDetail userDetails) {
        User user = userDetails.getUser();
        Form form = formService.validateFormOwnershipAndGet(formId, user);
        if (form == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        List<Map<String, Object>> results = queryService.runAggregatedQuery(
                formId,
                request.groupBy(),
                request.target(),
                request.func(),
                request.chartType()
        );
        return ResponseEntity.ok(results);
    }

    @PutMapping("/form/{formId}/status")
    public ResponseEntity<Form> updateFormStatus(
            @PathVariable Long formId,
            @RequestParam boolean active,
            @RequestParam boolean expired,
            @AuthenticationPrincipal CustomUserDetail userDetails) {
        User user = userDetails.getUser();
        Form updatedForm = formService.updateFormStatus(formId, active, expired, user);
        if (updatedForm == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updatedForm);
    }

    @PostMapping("/form/cleanup")
    public ResponseEntity<String> cleanupOrphanedTables(@AuthenticationPrincipal CustomUserDetail userDetails) {
        User user = userDetails.getUser();

        try {
            formDataService.cleanupOrphanedTablesWithAdminCheck(user);
            return ResponseEntity.ok("Orphaned tables cleaned up successfully");
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to cleanup orphaned tables: " + e.getMessage());
        }
    }

    @GetMapping("/form/{formId}/getallusersid")
    public ResponseEntity<List<Map<String, Object>>> getAllUsersIdForForm(@PathVariable Long formId,
                                                                          @AuthenticationPrincipal CustomUserDetail userDetails) {
        User user = userDetails.getUser();
        List<Map<String, Object>> userDetailsList = formService.getFormUserDetails(formId, user);
        return ResponseEntity.ok(userDetailsList);
    }

    @PostMapping("/form/{formId}/addusers")
    public ResponseEntity<String> addUsersToForm(@PathVariable Long formId,
                                                 @RequestBody List<Long> userIds,
                                                 @AuthenticationPrincipal CustomUserDetail userDetails) {
        User user = userDetails.getUser();
        boolean success = formService.addUsersToForm(formId, userIds, user);
        if (!success) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok("Users added to form");
    }

    @PostMapping("/form/{formId}/adduser")
    public ResponseEntity<String> addUserToForm(@PathVariable Long formId,
                                                @RequestBody Long userId,
                                                @AuthenticationPrincipal CustomUserDetail userDetails) {
        User user = userDetails.getUser();
        boolean success = formService.addUserToForm(formId, userId, user);
        if (!success) {
            return ResponseEntity.badRequest().body("User not found or form not found");
        }
        return ResponseEntity.ok("User added to form");
    }

    @PostMapping("/form/{formId}/removeuser")
    public ResponseEntity<String> removeUserFromForm(@PathVariable Long formId,
                                                     @RequestBody Long userId,
                                                     @AuthenticationPrincipal CustomUserDetail userDetails) {
        User user = userDetails.getUser();
        boolean success = formService.removeUserFromForm(formId, userId, user);
        if (!success) {
            return ResponseEntity.badRequest().body("User not found in allowed users");
        }
        return ResponseEntity.ok("User removed from form");
    }

    @GetMapping("/forms/sharedWithMe")
    public ResponseEntity<List<Form>> getFormsSharedWithMe(
            @AuthenticationPrincipal CustomUserDetail userDetails) {
        User user = userDetails.getUser();
        List<Form> sharedForms = formService.getFormsSharedWithUser(user);
        return ResponseEntity.ok(sharedForms);
    }
}