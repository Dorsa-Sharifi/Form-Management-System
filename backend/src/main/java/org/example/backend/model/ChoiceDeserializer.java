package org.example.backend.model;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonToken;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class ChoiceDeserializer extends JsonDeserializer<List<String>> {
    
    @Override
    public List<String> deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        List<String> choices = new ArrayList<>();
        
        JsonToken currentToken = p.getCurrentToken();
        
        try {
            if (currentToken == JsonToken.START_ARRAY) {
                // Handle array of choices
                ObjectMapper mapper = (ObjectMapper) p.getCodec();
                JsonNode node = mapper.readTree(p);
                
                for (JsonNode choiceNode : node) {
                    if (choiceNode.isTextual()) {
                        // Handle string choices
                        choices.add(choiceNode.asText());
                    } else if (choiceNode.isObject()) {
                        // Handle choice objects with index and title
                        if (choiceNode.has("title")) {
                            choices.add(choiceNode.get("title").asText());
                        } else if (choiceNode.has("text")) {
                            // Alternative field name
                            choices.add(choiceNode.get("text").asText());
                        } else if (choiceNode.has("value")) {
                            // Alternative field name
                            choices.add(choiceNode.get("value").asText());
                        } else {
                            // If object has no recognizable field, try to convert to string
                            choices.add(choiceNode.toString());
                        }
                    } else if (choiceNode.isNumber()) {
                        // Handle numeric choices
                        choices.add(choiceNode.asText());
                    } else if (choiceNode.isBoolean()) {
                        // Handle boolean choices
                        choices.add(choiceNode.asText());
                    }
                }
            } else if (currentToken == JsonToken.START_OBJECT) {
                // Handle single choice object
                ObjectMapper mapper = (ObjectMapper) p.getCodec();
                JsonNode node = mapper.readTree(p);
                
                if (node.has("title")) {
                    choices.add(node.get("title").asText());
                } else if (node.has("text")) {
                    choices.add(node.get("text").asText());
                } else if (node.has("value")) {
                    choices.add(node.get("value").asText());
                } else {
                    // If object has no recognizable field, try to convert to string
                    choices.add(node.toString());
                }
            } else if (currentToken == JsonToken.VALUE_STRING) {
                // Handle single string choice
                choices.add(p.getValueAsString());
            } else if (currentToken == JsonToken.VALUE_NUMBER_INT || currentToken == JsonToken.VALUE_NUMBER_FLOAT) {
                // Handle single numeric choice
                choices.add(p.getValueAsString());
            } else if (currentToken == JsonToken.VALUE_TRUE || currentToken == JsonToken.VALUE_FALSE) {
                // Handle single boolean choice
                choices.add(p.getValueAsString());
            } else if (currentToken == JsonToken.VALUE_NULL) {
                // Handle null values - return empty list
                return choices;
            } else {
                // For any other token type, try to get the value as string
                choices.add(p.getValueAsString());
            }
        } catch (Exception e) {
            // Log the error and return empty list to prevent deserialization failure
            System.err.println("Error deserializing choices: " + e.getMessage());
            System.err.println("Current token: " + currentToken);
            return new ArrayList<>();
        }
        
        return choices;
    }
} 