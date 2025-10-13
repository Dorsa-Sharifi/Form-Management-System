package org.example.backend.service;

import org.example.backend.model.Page;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

import org.example.backend.model.Form;
import org.example.backend.model.Question;

@Service
public class QueryService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private FormService formService;

    public List<Map<String, Object>> runAggregatedQuery(Long formId, List<String> groupByFields, String targetField , String op , String chartType) {
        Form form = formService.getFormById(formId);
        if (form == null) {
            throw new IllegalArgumentException("Form not found");
        }
        List<String> allowedColumns = new java.util.ArrayList<>();
        allowedColumns.add("user_id");

        for (Page page : form.getPages()) {
            for (Question q : page.getQuestions()) {
                allowedColumns.add("question_" + q.getId());
            }
        }

        for (String groupByField : groupByFields) {
            if (!allowedColumns.contains(groupByField)) {
                throw new IllegalArgumentException("Invalid group by field: " + groupByField);
            }
        }
        if (!allowedColumns.contains(targetField)) {
            throw new IllegalArgumentException("Invalid target field");
        }
        String groupByClause = String.join(", ", groupByFields);
        String concatenatedGroupBy = String.join(" || '_' || ", groupByFields);
        String sql;

        if (groupByFields.isEmpty()) {
            sql = "SELECT " + op + "(" + targetField + ") AS " + " Result " +
                    " FROM form_" + formId + ";";
        } else {
            sql = "SELECT " + concatenatedGroupBy + " AS " + "Combined_Selects" +
                    ", " + op + "(" + targetField + ") AS " + " Result "  +
                    " FROM form_" + formId +
                    " GROUP BY " + groupByClause + ";";
        }
        return jdbcTemplate.queryForList(sql);
    }
}
