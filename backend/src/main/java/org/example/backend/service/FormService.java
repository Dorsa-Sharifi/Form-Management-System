package org.example.backend.service;

import org.example.backend.model.Form;
import org.example.backend.model.Page;
import org.example.backend.model.Question;
import org.example.backend.model.User;
import org.example.backend.repository.FormRepository;
import org.example.backend.repository.PageRepository;
import org.example.backend.repository.QuestionRepository;
import org.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class FormService {

    private final FormRepository formRepository;
    private final PageRepository pageRepository;
    private final QuestionRepository questionRepository;
    private final UserRepository userRepository;

    @Autowired
    public FormService(FormRepository formRepository,
                       PageRepository pageRepository,
                       QuestionRepository questionRepository,
                       UserRepository userRepository) {
        this.formRepository = formRepository;
        this.questionRepository = questionRepository;
        this.pageRepository = pageRepository;
        this.userRepository = userRepository;
    }

    public Form createForm(Form form) {
        // Save the form entity to the database
        // Save each question associated with the form
        List<Page> pages = form.getPages();
        Form createdForm;

        try {
            // Create a new form with all the properties from the input form
            Form newForm = new Form();
            newForm.setOwner(form.getOwner());
            newForm.setTitle(form.getTitle());
            newForm.setDescription(form.getDescription());
            newForm.setTemplate(form.isTemplate());
            newForm.setActive(form.isActive());
            newForm.setExpired(form.isExpired());
            // Don't set ID as it will be auto-generated

            System.out.println("Creating form with title: " + newForm.getTitle());
            createdForm = formRepository.save(newForm);
            System.out.println("Created form with ID: " + createdForm.getId() + ", title: " + createdForm.getTitle());
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to create form: " + e.getMessage());
        }

        List<Page> savedPages = new ArrayList<Page>();
        for (Page page : pages) {
            Page createdPage = new Page();
            createdPage.setForm(createdForm);
            createdPage.setPageIndex(page.getPageIndex());
            Page p = pageRepository.save(createdPage);
            Set<Question> savedQuestions = new HashSet<Question>();
            for (Question question: page.getQuestions()){
                question.setPage(createdPage);
                Question q = questionRepository.save(question);
                savedQuestions.add(q);
            }
            p.setQuestions(savedQuestions);
            savedPages.add(p);
        }

        createdForm.setPages(savedPages);

        return createdForm;
    }

    public Form getFormById(Long id) {
        // Use the custom query to fetch form with all pages and questions
        Optional<Form> formOptional = formRepository.findById(id);

        // If the form is present, return it, otherwise return null or throw an exception
        return formOptional.orElse(null); // or you can throw an exception if the form is not found
    }

    public List<Form> getAllFormsByOwner(User owner) {
        List<Form> forms = this.formRepository.getFormsByOwner(owner);
        System.out.println("Retrieved " + forms.size() + " forms for owner: " + owner.getId());
        for (Form form : forms) {
            System.out.println("Form ID: " + form.getId() + ", Title: " + form.getTitle() + ", Description: " + form.getDescription());
        }
        return forms;
    }

    public List<Form> getTemplateFormsByOwner(User owner) {
        return this.formRepository.getFormsByOwnerAndIsTemplateTrue(owner);
    }

    public List<Form> getActiveFormsByOwner(User owner) {
        return this.formRepository.getFormsByOwnerAndIsActiveTrue(owner);
    }

    public Form updateForm(Form form) {
        if (form.getId() == null) {
            throw new IllegalArgumentException("Form ID cannot be null for update operation");
        }

        // Verify the form exists
        Optional<Form> existingForm = formRepository.findById(form.getId());
        if (existingForm.isEmpty()) {
            throw new IllegalArgumentException("Form with ID " + form.getId() + " does not exist");
        }

        // Update the form
        return formRepository.save(form);
    }

    public Form updateFormWithPages(Form form) {
        if (form.getId() == null) {
            throw new IllegalArgumentException("Form ID cannot be null for update operation");
        }

        // Verify the form exists
        Optional<Form> existingForm = formRepository.findById(form.getId());
        if (existingForm.isEmpty()) {
            throw new IllegalArgumentException("Form with ID " + form.getId() + " does not exist");
        }

        // Update basic form properties
        Form existingFormEntity = existingForm.get();
        existingFormEntity.setTitle(form.getTitle());
        existingFormEntity.setDescription(form.getDescription());

        // Save the updated form
        existingFormEntity.setPages(new ArrayList<Page>());
        Form updatedForm = formRepository.save(existingFormEntity);

        // Create new pages and questions
        List<Page> savedPages = new ArrayList<Page>();
        for (Page page : form.getPages()) {
            Page createdPage = new Page();
            createdPage.setForm(updatedForm);
            createdPage.setPageIndex(page.getPageIndex());
            Page p = pageRepository.save(createdPage);
            Set<Question> savedQuestions = new HashSet<Question>();
            for (Question question: page.getQuestions()){
                question.setPage(createdPage);
                Question q = questionRepository.save(question);
                savedQuestions.add(q);
            }
            p.setQuestions(savedQuestions);
            savedPages.add(p);
        }

        updatedForm.setPages(savedPages);

        return updatedForm;
    }

    public List<Form> getFormsSharedWithUser(User user) {
        return formRepository.findByAllowedUsersContaining(user);
    }

    // Business logic methods moved from controller

    public Form validateFormOwnershipAndGet(Long formId, User user) {
        Form form = getFormById(formId);
        if (form == null) {
            return null;
        }
        if (!form.getOwner().getId().equals(user.getId())) {
            throw new SecurityException("User does not have permission to access this form");
        }
        return form;
    }

    public Form createFormWithDefaults(Form newForm, User user) {
        newForm.setOwner(user);
        newForm.setActive(false);
        newForm.setExpired(false);
        newForm.setTemplate(false);

        return createForm(newForm);
    }

    @Transactional
    public Form updateFormWithOwnershipCheck(Long formId, Form updatedForm, User user) {
        Form existingForm = validateFormOwnershipAndGet(formId, user);
        if (existingForm == null) {
            return null; // or throw exception
        }

        // --- update simple fields ---
        existingForm.setTitle(updatedForm.getTitle());
        existingForm.setDescription(updatedForm.getDescription());
        existingForm.setActive(updatedForm.isActive());
        existingForm.setExpired(updatedForm.isExpired());
        existingForm.setTemplate(updatedForm.isTemplate());

        // --- merge pages ---
        mergePages(existingForm, updatedForm);

        return formRepository.save(existingForm);
    }

    private void mergePages(Form existingForm, Form updatedForm) {
        // Track pages to remove
        List<Page> pagesToRemove = new ArrayList<>();

        // update existing pages or mark for removal
        for (Page existingPage : existingForm.getPages()) {
            Page updatedPage = updatedForm.getPages().stream()
                    .filter(p -> p.getId() != null && p.getId().equals(existingPage.getId()))
                    .findFirst()
                    .orElse(null);

            if (updatedPage == null) {
                pagesToRemove.add(existingPage); // not in update → remove
            } else {
                existingPage.setPageIndex(updatedPage.getPageIndex());
                mergeQuestions(existingPage, updatedPage);
            }
        }

        // remove old pages
        existingForm.getPages().removeAll(pagesToRemove);

        // add new pages
        for (Page updatedPage : updatedForm.getPages()) {
            if (updatedPage.getId() == null) {
                updatedPage.setForm(existingForm);

                for (Question q : updatedPage.getQuestions()) {
                    q.setPage(updatedPage);
                }

                existingForm.getPages().add(updatedPage);
            }
        }
    }

    private void mergeQuestions(Page existingPage, Page updatedPage) {
        // Track questions to remove
        List<Question> toRemove = new ArrayList<>();

        for (Question existingQ : existingPage.getQuestions()) {
            Question updatedQ = updatedPage.getQuestions().stream()
                    .filter(q -> q.getId() != null && q.getId().equals(existingQ.getId()))
                    .findFirst()
                    .orElse(null);

            if (updatedQ == null) {
                toRemove.add(existingQ); // missing → remove
            } else {
                // update existing question
                existingQ.setText(updatedQ.getText());
                existingQ.setType(updatedQ.getType());
                existingQ.setDataType(updatedQ.getDataType());
                existingQ.setOptional(updatedQ.isOptional());
                existingQ.setChoices(updatedQ.getChoices());
                existingQ.setCreatedAtTs(updatedQ.getCreatedAtTs());
            }
        }

        existingPage.getQuestions().removeAll(toRemove);

        // add new questions
        for (Question updatedQ : updatedPage.getQuestions()) {
            if (updatedQ.getId() == null) {
                updatedQ.setPage(existingPage);
                existingPage.getQuestions().add(updatedQ);
            }
        }
    }



    public Form setFormAsTemplate(Long formId, User user) {
        Form form = validateFormOwnershipAndGet(formId, user);
        if (form == null) {
            return null;
        }

        form.setTemplate(true);
        return updateForm(form);
    }

    public Form updateFormStatus(Long formId, boolean active, boolean expired, User user) {
        Form form = validateFormOwnershipAndGet(formId, user);
        if (form == null) {
            return null;
        }

        form.setActive(active);
        form.setExpired(expired);
        return updateForm(form);
    }

    public List<Map<String, Object>> getFormUserDetails(Long formId, User user) {
        Form form = validateFormOwnershipAndGet(formId, user);
        if (form == null) {
            return new ArrayList<>();
        }

        List<Map<String, Object>> userDetailsList = new ArrayList<>();
        if (form.getAllowedUsers() != null) {
            for (User u : form.getAllowedUsers()) {
                Map<String, Object> userDetail = new HashMap<>();
                userDetail.put("id", u.getId());
                userDetail.put("username", u.getUsername());
                userDetailsList.add(userDetail);
            }
        }
        return userDetailsList;
    }

    public boolean addUsersToForm(Long formId, List<Long> userIds, User owner) {
        Form form = validateFormOwnershipAndGet(formId, owner);
        if (form == null) {
            return false;
        }

        List<User> usersToAdd = userRepository.findAllById(userIds);
        form.getAllowedUsers().addAll(usersToAdd);
        updateForm(form);
        return true;
    }

    public boolean addUserToForm(Long formId, Long userId, User owner) {
        Form form = validateFormOwnershipAndGet(formId, owner);
        if (form == null) {
            return false;
        }

        User userToAdd = userRepository.findById(userId).orElse(null);
        if (userToAdd == null) {
            return false;
        }

        form.getAllowedUsers().add(userToAdd);
        updateForm(form);
        return true;
    }

    public boolean removeUserFromForm(Long formId, Long userId, User owner) {
        Form form = validateFormOwnershipAndGet(formId, owner);
        if (form == null) {
            return false;
        }

        boolean removed = form.getAllowedUsers().removeIf(u -> u.getId().equals(userId));
        if (removed) {
            updateForm(form);
            return true;
        }
        return false;
    }

    public boolean validateFormSubmission(Long formId) {
        Form form = getFormById(formId);
        if (form == null) {
            return false;
        }
        // Uncomment these lines if you want to enforce form status checks
        // if (!form.isActive()) {
        //     return false;
        // }
        // if (form.isExpired()) {
        //     return false;
        // }
        return true;
    }
}