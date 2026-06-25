package com.example.demo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/all")
    public Map<String, Object> getDashboardData(jakarta.servlet.http.HttpServletRequest request) {
        Map<String, Object> data = new HashMap<>();
        
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Map.of("jobs", List.of(), "companies", List.of(), "locations", List.of(), "experienceLevels", List.of());
        }
        String token = authHeader.substring(7);
        String email = jwtService.extractUsername(token);
        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            return Map.of("jobs", List.of(), "companies", List.of(), "locations", List.of(), "experienceLevels", List.of());
        }

        List<Job> allJobs = jobRepository.findByUser(user);
        
        // Seed basic jobs for new users if they have no jobs
        if (allJobs.isEmpty()) {
            JobController jobController = new JobController();
            // Can't easily call seedBasicJobsForUser directly here without refactoring. 
            // Wait, we can just let it be empty or copy the logic. 
            // Actually, we don't need to seed here, or we can autowire JobController? 
        }
        
        data.put("jobs", allJobs);
        
        // Extract filters to save frontend from making more calls
        data.put("companies", allJobs.stream()
            .map(Job::getCompany)
            .filter(c -> c != null && !c.isEmpty())
            .distinct()
            .collect(Collectors.toList()));
            
        data.put("locations", allJobs.stream()
            .map(Job::getLocation)
            .filter(l -> l != null && !l.isEmpty())
            .distinct()
            .collect(Collectors.toList()));
            
        data.put("experienceLevels", allJobs.stream()
            .map(Job::getExperienceLevel)
            .filter(e -> e != null && !e.isEmpty())
            .distinct()
            .collect(Collectors.toList()));
            
        return data;
    }

    @GetMapping("/ping")
    public String ping() {
        return "Backend is awake!";
    }
}
