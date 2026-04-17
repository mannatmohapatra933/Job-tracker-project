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
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import jakarta.servlet.http.HttpServletRequest;


@RestController
@RequestMapping("/api/jobs")
public class JobController {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JobRepository repo;

    // GET all jobs
    @GetMapping
    public List<Job> getJobs(
        @RequestParam(required = false) String company,
        @RequestParam(required = false) String experienceLevel,
        @RequestParam(required = false) String location,
        HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return List.of(); // Return empty if unauthorized
        }
        String token = authHeader.substring(7);

        String email = jwtService.extractUsername(token);
        User user = userRepository.findByEmail(email).orElse(null);

        if (user != null && repo.findByUser(user).isEmpty()) {
            try {
                seedBasicJobsForUser(user);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        if (company != null && company.isEmpty()) company = null;
        if (experienceLevel != null && experienceLevel.isEmpty()) experienceLevel = null;
        if (location != null && location.isEmpty()) location = null;

        return repo.findByUserAndFilters(user, company, experienceLevel, location);
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
    public List<String> getCompanies(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return List.of();
        String token = authHeader.substring(7);
        String email = jwtService.extractUsername(token);
        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) return List.of();

        return repo.findByUser(user).stream()
            .map(Job::getCompany)
            .filter(c -> c != null && !c.trim().isEmpty())
            .distinct()
            .collect(Collectors.toList());
    }

    // GET all unique experience levels
    @GetMapping("/filters/experience-levels")
    public List<String> getExperienceLevels(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return List.of();
        String token = authHeader.substring(7);
        String email = jwtService.extractUsername(token);
        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) return List.of();

        return repo.findByUser(user).stream()
            .map(Job::getExperienceLevel)
            .filter(e -> e != null && !e.trim().isEmpty())
            .distinct()
            .collect(Collectors.toList());
    }

    // GET all unique locations
    @GetMapping("/filters/locations")
    public List<String> getLocations(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return List.of();
        String token = authHeader.substring(7);
        String email = jwtService.extractUsername(token);
        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) return List.of();

        return repo.findByUser(user).stream()
            .map(Job::getLocation)
            .filter(l -> l != null && !l.trim().isEmpty())
            .distinct()
            .collect(Collectors.toList());
    }

    // ADD job
    @PostMapping
    public Job createJob(@RequestBody Job job, HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Unauthorized");
        }
        String token = authHeader.substring(7);

        String email = jwtService.extractUsername(token);
        User user = userRepository.findByEmail(email).orElse(null);

        job.setUser(user);

        return repo.save(job);
    }

    // DEV BYPASS CLEANUP
    @DeleteMapping("/clean")
    public String cleanDb() {
        repo.deleteAll();
        return "Jobs cleaned!";
    }

    // DELETE job
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteJob(
        @PathVariable Long id,
        @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Job job = repo.findById(id).orElseThrow();
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            String email = jwtService.extractEmail(token);
            User user = userRepository.findByEmail(email).orElseThrow();
            if (!job.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(403).body("Not allowed");
            }
        }
        repo.delete(job);
        return ResponseEntity.ok("Deleted successfully");
    }

    private void seedBasicJobsForUser(User user) {
        String[][] jobData = {
            {"Google", "Software Engineer", "Applied", "15-25 LPA", "0-2", "Bachelors in CS", "Build highly scalable systems.", "2 rounds", "Pending Feedback", "Bangalore", "https://careers.google.com/jobs"},
            {"Amazon", "Backend SDE", "Interview Scheduled", "14-22 LPA", "0-2", "BTech", "Work on AWS core infra logic.", "3 rounds", "N/A", "Hyderabad", "https://amazon.jobs"},
            {"Google", "Senior Platform Engineer", "Offer", "40-55 LPA", "3-5", "BTech/MTech", "Lead Google Search infra.", "4 rounds", "Accepted", "Remote", "https://careers.google.com/jobs"},
            {"Microsoft", "Full Stack Developer", "Applied", "18-28 LPA", "0-2", "BTech in CS", "Develop modern web apps on Azure.", "1 Screening", "Awaiting review", "Bangalore", "https://careers.microsoft.com"},
            {"Netflix", "UI Engineer", "Applied", "45-60 LPA", "5+", "BTech", "Architect Award-Winning UIs.", "Loop", "Awaiting Feedback", "Remote", "https://jobs.netflix.com"},
            {"Zomato", "Frontend Engineer", "Applied", "12-18 LPA", "0-2", "BTech", "Optimize food delivery tracking UI.", "2 rounds", "N/A", "Gurgaon", "https://zomato.com/careers"},
            {"Swiggy", "Backend Developer", "Applied", "15-24 LPA", "2-4", "BTech", "Handle high-throughput ordering systems.", "3 rounds", "N/A", "Bangalore", "https://careers.swiggy.com"},
            {"Paytm", "SDE-1", "Applied", "10-15 LPA", "0-2", "BTech/BCA", "Integration with payment gateways.", "2 rounds", "N/A", "Noida", "https://paytm.com/careers"},
            {"Flipkart", "Data Scientist", "Applied", "20-30 LPA", "2-4", "MTech/Phd", "Machine learning for recommendation engines.", "3 rounds", "N/A", "Bangalore", "https://flipkartcareers.com"},
            {"Cred", "iOS Engineer", "Applied", "25-35 LPA", "2-4", "BTech", "Build sleek native payment experiences.", "4 rounds", "Offer Pending", "Bangalore", "https://careers.cred.club"},
            {"Tata Consultancy Services", "System Analyst", "Applied", "6-8 LPA", "0-2", "BTech", "Maintain enterprise applications.", "1 round", "N/A", "Mumbai", "https://www.tcs.com/careers"},
            {"Infosys", "Software Engineer", "Applied", "5-7 LPA", "0-2", "BTech/MCA", "Client delivery and maintenance.", "2 rounds", "N/A", "Pune", "https://infosys.com/careers"},
            {"Goldman Sachs", "Analyst", "Applied", "20-25 LPA", "0-2", "BTech/MBA", "Financial tech data pipelines.", "4 rounds", "N/A", "Bangalore", "https://goldmansachs.com/careers"},
            {"Morgan Stanley", "Associate", "Applied", "22-28 LPA", "2-4", "BTech", "Low latency trading systems.", "3 rounds", "N/A", "Mumbai", "https://morganstanley.com/careers"},
            {"Apple", "Hardware Engineer", "Applied", "30-45 LPA", "2-4", "BTech in ECE", "Design next-gen mobile chipsets.", "5 rounds", "N/A", "Hyderabad", "https://jobs.apple.com"},
            {"Meta", "React Native Developer", "Applied", "35-50 LPA", "2-4", "BTech", "Work on Instagram core features.", "4 rounds", "N/A", "Remote", "https://metacareers.com"},
            {"Zepto", "SDE-2", "Applied", "20-28 LPA", "2-4", "BTech", "10-minute delivery routing optimization.", "3 rounds", "N/A", "Mumbai", "https://zeptonow.com/careers"},
            {"Adobe", "Computer Scientist", "Applied", "25-35 LPA", "3-5", "BTech/MTech", "Core graphics rendering engine.", "4 rounds", "N/A", "Noida", "https://adobe.com/careers"},
            {"JP Morgan", "Software Engineer II", "Applied", "18-24 LPA", "2-4", "BTech", "Banking APIs and microservices.", "3 rounds", "N/A", "Bangalore", "https://jpmorgan.com/careers"},
            {"Wipro", "Project Engineer", "Applied", "4-6 LPA", "0-2", "BTech/BSc", "Support and development.", "1 round", "N/A", "Chennai", "https://careers.wipro.com"}
        };

        for (String[] data : jobData) {
            Job j = new Job(data[0], data[1], data[2]);
            j.setSalary(data[3]);
            j.setExperienceLevel(data[4]);
            j.setQualifications(data[5]);
            j.setJobDescription(data[6]);
            j.setInterviewSchedule(data[7]);
            j.setOfferDetails(data[8]);
            j.setLocation(data[9]);
            j.setApplicationLink(data[10]);
            j.setWishlisted(false);
            j.setUser(user);
            repo.save(j);
        }
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

    // ANALYTICS ENDPOINTS — all scoped to the authenticated user
    private User getUserFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        String token = authHeader.substring(7);
        String email = jwtService.extractUsername(token);
        return userRepository.findByEmail(email).orElse(null);
    }

    @GetMapping("/analytics/by-status")
    public Map<String, Long> getJobsByStatus(HttpServletRequest request) {
        User user = getUserFromRequest(request);
        if (user == null) return Map.of();
        return repo.findByUser(user).stream()
            .filter(j -> j.getStatus() != null)
            .collect(Collectors.groupingBy(Job::getStatus, Collectors.counting()));
    }

    @GetMapping("/analytics/summary")
    public Map<String, Object> getAnalyticsSummary(HttpServletRequest request) {
        User user = getUserFromRequest(request);
        if (user == null) return Map.of();
        List<Job> userJobs = repo.findByUser(user);
        Map<String, Object> summary = new HashMap<>();

        long offers = userJobs.stream().filter(j -> "Offer".equals(j.getStatus())).count();
        summary.put("totalJobs", userJobs.size());
        summary.put("totalApplications", userJobs.stream().filter(j -> "Applied".equals(j.getStatus())).count());
        summary.put("interviews", userJobs.stream().filter(j -> "Interview".equals(j.getStatus()) || "Interview Scheduled".equals(j.getStatus())).count());
        summary.put("offers", offers);
        summary.put("rejected", userJobs.stream().filter(j -> "Rejected".equals(j.getStatus())).count());
        summary.put("wishlisted", userJobs.stream().filter(Job::isWishlisted).count());
        summary.put("offerRate", !userJobs.isEmpty() ? ((double) offers / userJobs.size() * 100) : 0);

        return summary;
    }

    @GetMapping("/analytics/by-company")
    public Map<String, Long> getJobsByCompanyCount(HttpServletRequest request) {
        User user = getUserFromRequest(request);
        if (user == null) return Map.of();
        return repo.findByUser(user).stream()
            .filter(j -> j.getCompany() != null)
            .collect(Collectors.groupingBy(Job::getCompany, Collectors.counting()));
    }

    @GetMapping("/analytics/by-experience")
    public Map<String, Long> getJobsByExperienceCount(HttpServletRequest request) {
        User user = getUserFromRequest(request);
        if (user == null) return Map.of();
        return repo.findByUser(user).stream()
            .filter(j -> j.getExperienceLevel() != null)
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