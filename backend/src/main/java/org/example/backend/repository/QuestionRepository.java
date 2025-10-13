package org.example.backend.repository;

import org.example.backend.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findQuestionsByPage_Form_Id(Long pageFormId);
}
