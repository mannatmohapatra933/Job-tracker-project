package com.example.demo;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/jobs")
public class JobController {

    @Autowired
    private JobRepository repo;

    // GET all jobs
    @GetMapping
    public List<Job> getJobs() {
        return repo.findAll();
    }

    // GET jobs filtered by experience level
    @GetMapping("/filter/experience")
    public List<Job> getJobsByExperience(@RequestParam String experience) {
        return repo.findAll().stream()
            .filter(job -> job.getExperienceLevel() != null && job.getExperienceLevel().equals(experience))
            .collect(Collectors.toList());
    }

    // GET jobs filtered by company
    @GetMapping("/filter/company")
    public List<Job> getJobsByCompany(@RequestParam String company) {
        return repo.findAll().stream()
            .filter(job -> job.getCompany() != null && job.getCompany().equalsIgnoreCase(company))
            .collect(Collectors.toList());
    }

    // GET all unique companies
    @GetMapping("/filters/companies")
    public List<String> getCompanies() {
        return repo.findAll().stream()
            .map(Job::getCompany)
            .distinct()
            .collect(Collectors.toList());
    }

    // GET all unique experience levels
    @GetMapping("/filters/experience-levels")
    public List<String> getExperienceLevels() {
        return repo.findAll().stream()
            .map(Job::getExperienceLevel)
            .distinct()
            .collect(Collectors.toList());
    }

    // ADD job
    @PostMapping
    public Job addJob(@RequestBody Job job) {
        return repo.save(job);
    }

    // DELETE job
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteJob(@PathVariable Long id) {
        repo.deleteById(id);
        return ResponseEntity.ok("Deleted successfully");
    }

    // UPDATE job
    @PutMapping("/{id}")
    public Job updateJob(@PathVariable Long id, @RequestBody Job updatedJob) {
        Job job = repo.findById(id).orElseThrow();

        job.setCompany(updatedJob.getCompany());
        job.setRole(updatedJob.getRole());
        job.setStatus(updatedJob.getStatus());
        job.setWishlisted(updatedJob.isWishlisted());

        return repo.save(job);
    }

    // ANALYTICS ENDPOINTS
    @GetMapping("/analytics/by-status")
    public Map<String, Long> getJobsByStatus() {
        return repo.findAll().stream()
            .collect(Collectors.groupingBy(Job::getStatus, Collectors.counting()));
    }

    @GetMapping("/analytics/summary")
    public Map<String, Object> getAnalyticsSummary() {
        List<Job> allJobs = repo.findAll();
        Map<String, Object> summary = new HashMap<>();

        summary.put("totalJobs", allJobs.size());
        summary.put("totalApplications", allJobs.stream().filter(j -> "Applied".equals(j.getStatus())).count());
        summary.put("interviews", allJobs.stream().filter(j -> "Interview".equals(j.getStatus()) || "Interview Scheduled".equals(j.getStatus())).count());
        summary.put("offers", allJobs.stream().filter(j -> "Offer".equals(j.getStatus())).count());
        summary.put("rejected", allJobs.stream().filter(j -> "Rejected".equals(j.getStatus())).count());
        summary.put("wishlisted", allJobs.stream().filter(Job::isWishlisted).count());
        summary.put("offerRate", !allJobs.isEmpty() ? ((double) summary.get("offers") / allJobs.size() * 100) : 0);

        return summary;
    }

    @GetMapping("/analytics/by-company")
    public Map<String, Long> getJobsByCompanyCount() {
        return repo.findAll().stream()
            .collect(Collectors.groupingBy(Job::getCompany, Collectors.counting()));
    }

    @GetMapping("/analytics/by-experience")
    public Map<String, Long> getJobsByExperienceCount() {
        return repo.findAll().stream()
            .collect(Collectors.groupingBy(Job::getExperienceLevel, Collectors.counting()));
    }

    // WISHLIST ENDPOINTS
    @GetMapping("/wishlist")
    public List<Job> getWishlistedJobs() {
        return repo.findAll().stream()
            .filter(Job::isWishlisted)
            .collect(Collectors.toList());
    }

    @PutMapping("/{id}/wishlist")
    public Job toggleWishlist(@PathVariable Long id) {
        Job job = repo.findById(id).orElseThrow();
        job.setWishlisted(!job.isWishlisted());
        return repo.save(job);
    }
}