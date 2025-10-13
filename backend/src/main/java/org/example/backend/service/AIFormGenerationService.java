package org.example.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.backend.dto.AIFormRequest;
import org.example.backend.model.Form;
import org.example.backend.model.Page;
import org.example.backend.model.Question;
import org.example.backend.model.User;
import org.example.backend.repository.FormRepository;
import org.example.backend.repository.PageRepository;
import org.example.backend.repository.QuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.annotation.PostConstruct;
import java.util.*;

@Service
public class AIFormGenerationService {

    @Autowired
    private FormRepository formRepository;

    @Autowired
    private PageRepository pageRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

//    @PostConstruct
//    public void configureSocksProxy() {
//        System.setProperty("socksProxyHost", "127.0.0.1");
//        System.setProperty("socksProxyPort", "2080");
//    }

    public Form generateForm(AIFormRequest request, User user) {
        try {
            // Generate form using Gemini API
            String formJson = callGeminiAPI(request.getPrompt());

            // Parse the JSON response
            JsonNode formData = objectMapper.readTree(formJson);

            // Create and save the form

            return createFormFromJson(formData, user);

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate form: " + e.getMessage());
        }
    }

    public Map<String, Object> previewForm(AIFormRequest request) {
        try {
            // Generate form using Gemini API
            String formJson = callGeminiAPI(request.getPrompt());
            
            // Parse and return as preview (don't save to database)
            JsonNode formData = objectMapper.readTree(formJson);
            
            Map<String, Object> preview = new HashMap<>();
            preview.put("title", formData.get("title").asText());
            preview.put("description", formData.get("description").asText());
            preview.put("pages", parsePages(formData.get("pages")));
            
            return preview;
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate form preview: " + e.getMessage());
        }
    }

    private String callGeminiAPI(String prompt) {
        try {
            String fullPrompt = createFormGenerationPrompt(prompt);
            
            // Create request body for Gemini API
            Map<String, Object> requestBody = new HashMap<>();
            Map<String, Object> contents = new HashMap<>();
            Map<String, Object> parts = new HashMap<>();
            parts.put("text", fullPrompt);
            contents.put("parts", Arrays.asList(parts));
            requestBody.put("contents", Arrays.asList(contents));
            
            // Set headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            // Make API call
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            String url = geminiApiUrl + "?key=" + apiKey;
            
            ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.POST, entity, String.class
            );
            
            // Parse response
            JsonNode responseJson = objectMapper.readTree(response.getBody());
            String generatedText = responseJson
                .get("candidates")
                .get(0)
                .get("content")
                .get("parts")
                .get(0)
                .get("text")
                .asText();
            
            // Extract JSON from the response
            return extractJsonFromResponse(generatedText);
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to call Gemini API: " + e.getMessage());
        }
    }

    private String createFormGenerationPrompt(String userPrompt) {
        return """
            Create a form based on this description: "%s"
            
            Return ONLY a valid JSON object in this exact format:
            {
              "title": "Form Title",
              "description": "Form Description",
              "pages": [
                {
                  "questions": [
                    {
                      "text": "Question text",
                      "type": "text|email|tel|textarea|radio|checkbox|select|date|number",
                      "dataType": "SHORT_TEXT|LONG_TEXT|NUMBER|EMAIL|DATE|BOOL",
                      "optional": true|false,
                      "choices": ["option1", "option2"] // only for radio/checkbox/select
                    }
                  ]
                }
              ]
            }
            
            Rules:
            - Use standard HTML input types: text, email, tel, textarea, radio, checkbox, select, date, number
            - For dataType: SHORT_TEXT, LONG_TEXT, NUMBER, EMAIL, DATE, BOOL
            - Use "choices" for radio/checkbox/select options
            - Use "optional" instead of "required" (optional: true means not required)
            - Create logical pages (max 5 questions per page)
            - Make questions relevant to the user's request
            - Return only the JSON, no additional text
            """.formatted(userPrompt);
    }

    private String extractJsonFromResponse(String response) {
        // Remove markdown formatting if present
        response = response.replaceAll("```json", "").replaceAll("```", "").trim();
        
        // Find the JSON object
        int start = response.indexOf("{");
        int end = response.lastIndexOf("}") + 1;
        
        if (start != -1 && end != -1) {
            return response.substring(start, end);
        }
        
        throw new RuntimeException("Could not extract JSON from AI response");
    }

    private Form createFormFromJson(JsonNode formData, User user) {
        List<Page> savedPages = new ArrayList<Page>();
        Form form = new Form();
        form.setTitle(formData.get("title").asText());
        form.setDescription(formData.get("description").asText());
        form.setOwner(user);
        // Removed setCreatedAt and setUpdatedAt as they don't exist in your Form model
        
        // Save form first to get ID
        form = formRepository.save(form);
        
        // Create pages
        JsonNode pagesNode = formData.get("pages");
        for (int i = 0; i < pagesNode.size(); i++) {
            JsonNode pageData = pagesNode.get(i);
            Page page = new Page();
            page.setForm(form);
            page.setPageIndex(i); // Changed from setPageNumber to setPageIndex
            page = pageRepository.save(page);

            // Create questions
            Set<Question> savedQuestions = new HashSet<Question>();
            JsonNode questionsNode = pageData.get("questions");
            for (int j = 0; j < questionsNode.size(); j++) {
                JsonNode questionData = questionsNode.get(j);
                Question question = new Question();
                question.setPage(page);
                question.setText(questionData.get("text").asText());
                question.setType(questionData.get("type").asText());
                question.setOptional(questionData.get("optional").asBoolean()); // Changed from setRequired to setOptional
                // Removed setQuestionNumber as it doesn't exist in your Question model
                
                // Handle dataType for questions
                if (questionData.has("dataType")) {
                    question.setDataType(questionData.get("dataType").asText());
                }
                
                // Handle choices for radio/checkbox/select
                if (questionData.has("choices")) {
                    JsonNode choicesNode = questionData.get("choices");
                    List<String> choices = new ArrayList<>();
                    for (JsonNode choice : choicesNode) {
                        choices.add(choice.asText());
                    }
                    question.setChoices(choices); // Changed from setOptions to setChoices
                }
                
                Question q = questionRepository.save(question);
                savedQuestions.add(q);
            }
            page.setQuestions(savedQuestions);
            savedPages.add(page);
        }
        form.setPages(savedPages);
        return form;
    }

    private List<Map<String, Object>> parsePages(JsonNode pagesNode) {
        List<Map<String, Object>> pages = new ArrayList<>();
        
        for (JsonNode pageNode : pagesNode) {
            Map<String, Object> page = new HashMap<>();
            List<Map<String, Object>> questions = new ArrayList<>();
            
            JsonNode questionsNode = pageNode.get("questions");
            for (JsonNode questionNode : questionsNode) {
                Map<String, Object> question = new HashMap<>();
                question.put("text", questionNode.get("text").asText());
                question.put("type", questionNode.get("type").asText());
                question.put("optional", questionNode.get("optional").asBoolean()); // Changed from required to optional
                
                if (questionNode.has("dataType")) {
                    question.put("dataType", questionNode.get("dataType").asText());
                }
                
                if (questionNode.has("choices")) {
                    List<String> choices = new ArrayList<>();
                    for (JsonNode choice : questionNode.get("choices")) {
                        choices.add(choice.asText());
                    }
                    question.put("choices", choices); // Changed from options to choices
                }
                
                questions.add(question);
            }
            
            page.put("questions", questions);
            pages.add(page);
        }
        
        return pages;
    }
}
