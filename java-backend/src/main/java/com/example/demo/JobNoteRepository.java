package com.example.demo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JobNoteRepository extends JpaRepository<JobNote, Long> {
    List<JobNote> findByJobId(Long jobId);
    void deleteByJobId(Long jobId);
}
