package com.example.demo;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/jobs/notes")
public class JobNoteController {

    @Autowired
    private JobNoteRepository noteRepo;

    @Autowired
    private JobRepository jobRepo;

    // GET notes for a specific job
    @GetMapping("/job/{jobId}")
    public List<JobNote> getNotesByJob(@PathVariable Long jobId) {
        return noteRepo.findByJobId(jobId);
    }

    // ADD note to a job
    @PostMapping
    public JobNote addNote(@RequestBody JobNote note) {
        return noteRepo.save(note);
    }

    // UPDATE note
    @PutMapping("/{id}")
    public JobNote updateNote(@PathVariable Long id, @RequestBody JobNote updatedNote) {
        JobNote note = noteRepo.findById(id).orElseThrow();
        note.setNoteContent(updatedNote.getNoteContent());
        note.setNoteType(updatedNote.getNoteType());
        return noteRepo.save(note);
    }

    // DELETE note
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNote(@PathVariable Long id) {
        noteRepo.deleteById(id);
        return ResponseEntity.ok("Note deleted successfully");
    }

    // DELETE all notes for a job
    @DeleteMapping("/job/{jobId}")
    public ResponseEntity<?> deleteNotesByJob(@PathVariable Long jobId) {
        noteRepo.deleteByJobId(jobId);
        return ResponseEntity.ok("All notes deleted for job");
    }
}
