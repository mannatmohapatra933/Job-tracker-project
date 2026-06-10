package com.example.demo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/feedbacks")
public class FeedbackController {

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private JwtService jwtService;

    // GET all feedbacks
    @GetMapping
    public List<Feedback> getAllFeedbacks() {
        return feedbackRepository.findAllByOrderByCreatedAtDesc();
    }

    // ADD a new feedback
    @PostMapping
    public Feedback createFeedback(@RequestBody Feedback feedback, HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Unauthorized");
        }
        
        // We ensure only authenticated users can post feedback
        String token = authHeader.substring(7);
        jwtService.extractUsername(token); // Validates the token implicitly

        return feedbackRepository.save(feedback);
    }
}
