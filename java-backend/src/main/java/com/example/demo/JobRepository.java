package com.example.demo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface JobRepository extends JpaRepository<Job, Long> {
    List<Job> findByUserId(Long userId);
    List<Job> findByUser(User user);

    @Query("SELECT j FROM Job j WHERE j.user = :user " +
           "AND (:company IS NULL OR j.company = :company) " +
           "AND (:exp IS NULL OR j.experienceLevel = :exp) " +
           "AND (:loc IS NULL OR j.location = :loc)")
    List<Job> findByUserAndFilters(@Param("user") User user, @Param("company") String company, @Param("exp") String exp, @Param("loc") String loc);
}