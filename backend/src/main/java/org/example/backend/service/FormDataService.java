

package org.example.backend.service;
import org.example.backend.model.Form;
import org.example.backend.model.Page;
import org.example.backend.model.Question;
import org.example.backend.model.User;
import org.example.backend.repository.FormRepository;
import org.example.backend.repository.QuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;


@Service
public class FormDataService {

    @Autowired
    private JdbcTemplate jdbcTemplate;
    @Autowired
    private FormRepository formRepository;
    @Autowired
    private QuestionRepository questionRepository;

    public void createFormTable(Form form) {
        if (form.getId() == null) {
            throw new IllegalArgumentException("Form ID cannot be null when creating form table");
        }

        String tableName = "form_" + form.getId();

        // Check if table already exists
        try {
            String checkSql = "SELECT 1 FROM " + tableName + " LIMIT 1";
            jdbcTemplate.queryForObject(checkSql, Integer.class);
            System.out.println("Table " + tableName + " already exists, updating structure instead");
            updateFormTable(form);
            return;
        } catch (Exception e) {
            // Table doesn't exist, proceed with creation
        }

        StringBuilder sql = new StringBuilder("CREATE TABLE ")
                .append(tableName)
                .append(" (id SERIAL PRIMARY KEY, user_id INTEGER");

        // Dynamically add columns for each question in the form
        for (Page page: form.getPages()) {
            for (Question question : page.getQuestions()) {
                // Use question ID if available, otherwise use index
                sql.append(", question_").append(question.getId()).append(" ")
                        .append(getColumnType(question));
            }
        }

        sql.append(");");

        // Execute the dynamically generated SQL
        try {
            jdbcTemplate.execute(sql.toString());
            System.out.println("Created table: " + sql.toString());
        } catch (Exception e) {
            System.err.println("Failed to create table: " + sql.toString());
            throw new RuntimeException("Failed to create form table: " + e.getMessage(), e);
        }
    }

    public void updateFormTable(Form form) {
        if (form.getId() == null) {
            throw new IllegalArgumentException("Form ID cannot be null when updating form table");
        }

        String tableName = "form_" + form.getId();
        System.out.println("Updating table: " + tableName);

        // Get existing columns in the table
        List<String> existingColumns = getExistingColumns(tableName);
        System.out.println("Existing columns: " + existingColumns);

        // Generate the expected columns based on the form structure
        List<String> expectedColumns = new ArrayList<>();
        int questionIndex = 1;
        for (Page page: form.getPages()) {
            for (Question question : page.getQuestions()) {
                String questionId = (question.getId() != null) ? String.valueOf(question.getId()) : String.valueOf(questionIndex);
                expectedColumns.add("question_" + questionId);
                questionIndex++;
            }
        }
        System.out.println("Expected columns: " + expectedColumns);

        // Add missing columns
        for (String expectedColumn : expectedColumns) {
            if (!existingColumns.contains(expectedColumn)) {
                try {
                    // Find the question to get its data type
                    Question question = findQuestionById(form, expectedColumn.replace("question_", ""));
                    String columnType = getColumnType(question);

                    String alterSql = "ALTER TABLE " + tableName + " ADD COLUMN " + expectedColumn + " " + columnType;
                    jdbcTemplate.execute(alterSql);
                    System.out.println("Added column: " + expectedColumn + " with type: " + columnType);
                } catch (Exception e) {
                    System.err.println("Failed to add column " + expectedColumn + ": " + e.getMessage());
                }
            } else {
                System.out.println("Column already exists: " + expectedColumn);
            }
        }

        // Remove columns that are no longer needed (optional - be careful with data loss)
        // This is commented out to preserve existing data
        /*
        for (String existingColumn : existingColumns) {
            if (!expectedColumns.contains(existingColumn) && !existingColumn.equals("id") && !existingColumn.equals("user_id")) {
                try {
                    String alterSql = "ALTER TABLE " + tableName + " DROP COLUMN " + existingColumn;
                    jdbcTemplate.execute(alterSql);
                    System.out.println("Removed column: " + existingColumn);
                } catch (Exception e) {
                    System.err.println("Failed to remove column " + existingColumn + ": " + e.getMessage());
                }
            }
        }
        */
    }

    private List<String> getExistingColumns(String tableName) {
        List<String> columns = new ArrayList<>();
        try {
            String sql = "SELECT column_name FROM information_schema.columns WHERE table_name = ?";
            List<Map<String, Object>> results = jdbcTemplate.queryForList(sql, tableName);
            for (Map<String, Object> row : results) {
                columns.add((String) row.get("column_name"));
            }
        } catch (Exception e) {
            System.err.println("Failed to get existing columns for table " + tableName + ": " + e.getMessage());
        }
        return columns;
    }

    private Question findQuestionById(Form form, String questionId) {
        for (Page page : form.getPages()) {
            for (Question question : page.getQuestions()) {
                if (String.valueOf(question.getId()).equals(questionId)) {
                    return question;
                }
            }
        }
        // If not found by ID, return a default question with VARCHAR type
        Question defaultQuestion = new Question("", "text", null);
        defaultQuestion.setDataType("SHORT_TEXT");
        return defaultQuestion;
    }

    private String getColumnType(Question question) {
        // Return the correct column type based on the question type (e.g., VARCHAR, INTEGER)
        return switch (question.getDataType().toUpperCase()) {
            case "LONG_TEXT" -> "TEXT" ;
            case "NUMBER" -> "NUMERIC";
            case "BOOLEAN" -> "BOOLEAN";
            default -> "VARCHAR(255)";
        };
    }

    // Method for inserting form data into the dynamic table
    public void insertFormData(Long formId, Map<String, Object> formData, Long userId) {
        // 1. Get list of typed values
        List<Object> typedValuesList = new ArrayList<>();
        typedValuesList.add(userId); // Add the user ID first

        for (Map.Entry<String, Object> entry : formData.entrySet()) {
            String questionColumn = entry.getKey(); // like "question_43"
            Object value = entry.getValue();

            // Extract question id
            Long questionId;
            if (questionColumn.startsWith("question_")) {
                questionId = Long.parseLong(questionColumn.substring("question_".length()));
            } else {
                return;
            }

            // Lookup Question and its dataType
            Question question = questionRepository.findById(questionId)
                    .orElseThrow(() -> new RuntimeException("Question ID not found: " + questionId));

            if (question.isOptional() && (value == null || value.toString().isEmpty())) {
                System.out.println(question.isOptional() + " " + value + " " + question.getText() + " " + questionId);
                throw new IllegalArgumentException("Question " + question.getText() + " is required but no value provided.");
            }

            Object typedValue = convertValueByDataType(question.getDataType(), value);
            typedValuesList.add(typedValue);
        }

        StringBuilder sql = new StringBuilder("INSERT INTO form_")
                .append(formId)
                .append(" (user_id");

        StringBuilder values = new StringBuilder(") VALUES (");

        // Dynamically add columns and values for each question
        values.append("?");  // Placeholder for user ID
        for (Map.Entry<String, Object> entry : formData.entrySet()) {
            sql.append(", ").append(entry.getKey());  // Add column name
            values.append(", ?");  // Placeholder for value
        }

        sql.append(values).append(");");

        jdbcTemplate.update(sql.toString(), typedValuesList.toArray());
    }

    private Object convertValueByDataType(String dataType, Object value) {
        if (value == null) return null;
        return switch (dataType.toUpperCase()) {
            case "NUMBER" -> {
                // Try Integer; you could improve to support Double if desired
                String s = value.toString();
                try {
                    yield Double.parseDouble(s);
                } catch (NumberFormatException e) {
                    yield null; // or handle/throw as needed
                }
            }
            case "BOOLEAN" -> Boolean.parseBoolean(value.toString());
            // Add other types if needed:
            // case "DOUBLE": yield Double.parseDouble(value.toString());
            default -> value.toString(); // TEXT, SHORT_TEXT, LONG_TEXT, etc.
        };
    }


    // method to get all form data
    public List<Map<String, Object>> getFormData(Long formId) {
        String sql = "SELECT * FROM form_" + formId;
        return jdbcTemplate.queryForList(sql);
    }


    public List<Map<String, Object>> getFormFields(Long formId) {
        String sql = "SELECT q.id, q.text, q.type, q.data_type " +
                "FROM " +
                "page p "+
                "JOIN question q ON p.id = q.page_id" +
                " WHERE p.form_id =  " + formId;

        return jdbcTemplate.queryForList(sql);
    }

    /**
     * Clean up any orphaned form tables that might have been created with null IDs
     */
    public void cleanupOrphanedTables() {
        try {
            String sql = "SELECT tablename FROM pg_tables WHERE tablename LIKE 'form_%' AND tablename ~ '^form_[0-9]+$' = false";
            List<String> orphanedTables = jdbcTemplate.queryForList(sql, String.class);

            for (String tableName : orphanedTables) {
                if ("form_allowed_users".equals(tableName)) continue;
                try {
                    jdbcTemplate.execute("DROP TABLE IF EXISTS " + tableName);
                    System.out.println("Cleaned up orphaned table: " + tableName);
                } catch (Exception e) {
                    System.err.println("Failed to drop table " + tableName + ": " + e.getMessage());
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to cleanup orphaned tables: " + e.getMessage());
        }
    }

    /**
     * Clean up orphaned tables with admin validation
     */
    public boolean cleanupOrphanedTablesWithAdminCheck(User user) {
        if (!"ROLE_ADMIN".equals(user.getRole().toString())) {
            throw new SecurityException("Only administrators can perform cleanup operations");
        }

        try {
            cleanupOrphanedTables();
            return true;
        } catch (Exception e) {
            throw new RuntimeException("Failed to cleanup orphaned tables: " + e.getMessage(), e);
        }
    }

}

