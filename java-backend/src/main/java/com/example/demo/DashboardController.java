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

    @GetMapping("/all")
    public Map<String, Object> getDashboardData() {
        Map<String, Object> data = new HashMap<>();
        
        List<Job> allJobs = jobRepository.findAll();
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
