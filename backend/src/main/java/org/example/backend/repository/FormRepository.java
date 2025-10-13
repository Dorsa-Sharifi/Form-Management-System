package org.example.backend.repository;

import org.example.backend.model.Form;
import org.example.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FormRepository extends JpaRepository<Form, Long> {

    List<Form> findByAllowedUsersContaining(User user);


    @Query("SELECT DISTINCT f FROM Form f " +
           "LEFT JOIN FETCH f.pages " +
           "WHERE f.owner = :owner")
    List<Form> getFormsByOwner(@Param("owner") User owner);
    
    @Query("SELECT DISTINCT f FROM Form f " +
           "LEFT JOIN FETCH f.pages " +
           "WHERE f.owner = :owner AND f.isTemplate = true")
    List<Form> getFormsByOwnerAndIsTemplateTrue(@Param("owner") User owner);
    
    @Query("SELECT DISTINCT f FROM Form f " +
           "LEFT JOIN FETCH f.pages " +
           "WHERE f.owner = :owner AND f.isActive = true")
    List<Form> getFormsByOwnerAndIsActiveTrue(@Param("owner") User owner);
    
    @Query("SELECT DISTINCT f FROM Form f " +
           "LEFT JOIN FETCH f.pages p " +
           "LEFT JOIN FETCH p.questions q " +
           "WHERE f.id = :formId")
    Optional<Form> findByIdWithPagesAndQuestions(@Param("formId") Long formId);

    @Query("SELECT u FROM Form f JOIN f.allowedUsers u WHERE f.id = :formId")
    List<User> getAllowedUsersByFormId(@Param("formId") Long formId);
}
