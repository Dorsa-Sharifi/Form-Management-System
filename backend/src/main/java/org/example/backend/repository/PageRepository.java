package org.example.backend.repository;

import org.example.backend.model.Form;
import org.example.backend.model.Page;
import org.example.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PageRepository extends JpaRepository<Page, Long> {
}
