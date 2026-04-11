package com.example.demo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataLoader implements CommandLineRunner {

    @Autowired
    private JobRepository jobRepository;

    @Override
    public void run(String... args) throws Exception {
        // Clear existing data
        jobRepository.deleteAll();

        // Google Jobs
        createJob("Google", "https://google.com", "Software Engineer", "Bachelors in CS", "0-2", 
            "https://careers.google.com/jobs", "Build scalable systems using Java, Python", "₹15-25 LPA", 
            "2 rounds - DSA + System Design", "Offer pending", "Bangalore");
        
        createJob("Google", "https://google.com", "Data Scientist", "Bachelors in CS/Stats", "2-5",
            "https://careers.google.com/jobs", "Work with ML models and BigQuery", "₹18-30 LPA",
            "3 rounds - SQL + ML + Case Study", "Offer pending", "Bangalore");

        // Amazon Jobs
        createJob("Amazon", "https://amazon.com", "Backend Developer", "Bachelors in CS", "0-2",
            "https://amazon.jobs", "Build AWS microservices", "₹12-22 LPA",
            "2 rounds - LC Medium + System Design", "Offer pending", "Bangalore");
        
        createJob("Amazon", "https://amazon.com", "Senior Backend Engineer", "Bachelors in CS", "5+",
            "https://amazon.jobs", "Lead backend architecture", "₹40-60 LPA",
            "3 rounds - Leadership + Design", "Offer pending", "Bangalore");

        // Microsoft Jobs
        createJob("Microsoft", "https://microsoft.com", "SDE", "Bachelors in CS", "0-2",
            "https://careers.microsoft.com", "C++, C# development", "₹14-24 LPA",
            "2 rounds - DSA + Problem Solving", "Offer pending", "Hyderabad");
        
        createJob("Microsoft", "https://microsoft.com", "Cloud Architect", "Bachelors in CS", "5+",
            "https://careers.microsoft.com", "Design Azure solutions", "₹50-70 LPA",
            "2 rounds - Architecture + Leadership", "Offer pending", "Hyderabad");

        // Flipkart Jobs
        createJob("Flipkart", "https://flipkart.com", "Full Stack Developer", "Bachelors in CS", "0-2",
            "https://flipkart.careers", "React + Node.js + MongoDB", "₹10-18 LPA",
            "2 rounds - Frontend + Backend", "Under Review", "Bangalore");
        
        createJob("Flipkart", "https://flipkart.com", "Android Developer", "Bachelors in CS", "2-5",
            "https://flipkart.careers", "Kotlin, Android SDK", "₹16-26 LPA",
            "2 rounds - Android + System Design", "Interview Scheduled", "Bangalore");

        // TCS Jobs
        createJob("TCS", "https://tcs.com", "Junior Developer", "Bachelors in CS", "0-2",
            "https://tcs.com/careers", "Java, SQL, Spring Boot", "₹5-8 LPA",
            "Written Test + Programming Round", "Applied", "Multiple");
        
        createJob("TCS", "https://tcs.com", "Senior Software Engineer", "Bachelors in CS", "5+",
            "https://tcs.com/careers", "Enterprise Solutions", "₹25-40 LPA",
            "Technical + Manager Round", "Applied", "Multiple");

        // Infosys Jobs
        createJob("Infosys", "https://infosys.com", "Software Developer", "Bachelors in CS", "0-2",
            "https://infosys.com/careers", "Java, Python development", "₹4.5-7 LPA",
            "Written Test + Technical Round", "Applied", "Multiple");
        
        createJob("Infosys", "https://infosys.com", "Architect", "Bachelors in CS", "5+",
            "https://infosys.com/careers", "Solution Architecture", "₹30-50 LPA",
            "Design Review + Leadership", "Applied", "Multiple");

        // Accenture Jobs
        createJob("Accenture", "https://accenture.com", "Associate Software Engineer", "Bachelors in CS", "0-2",
            "https://accenture.com/careers", "Cloud, Java, Web Development", "₹6-10 LPA",
            "Online Assessment + Interview", "Applied", "Multiple");

        // HCL Jobs
        createJob("HCL", "https://hcltech.com", "Junior Software Engineer", "Bachelors in CS", "0-2",
            "https://hcltech.com/careers", "Java, Cloud technologies", "₹5-9 LPA",
            "Written Test + Technical Round", "Applied", "Multiple");

        // Cognizant Jobs
        createJob("Cognizant", "https://cognizant.com", "Software Developer", "Bachelors in CS", "0-2",
            "https://cognizant.com/jobs", "Java, Python", "₹5-8 LPA",
            "Aptitude + Technical", "Applied", "Multiple");

        // Startup Jobs
        createJob("Startup XYZ", "https://startupxyz.com", "Full Stack Engineer", "Bachelors in CS", "0-2",
            "https://startupxyz.com/careers", "React, Node.js, MongoDB", "₹8-15 LPA + Equity",
            "Technical Round + Founder Meeting", "Interview Scheduled", "Remote");

        System.out.println("✓ Jobs data loaded successfully!");
    }

    private void createJob(String company, String website, String role, String qualifications, 
                          String experience, String applicationLink, String description, String salary,
                          String interview, String offer, String location) {
        Job job = new Job();
        job.setCompany(company);
        job.setCompanyWebsite(website);
        job.setRole(role);
        job.setStatus("Applied");
        job.setQualifications(qualifications);
        job.setExperienceLevel(experience);
        job.setApplicationLink(applicationLink);
        job.setJobDescription(description);
        job.setSalary(salary);
        job.setInterviewSchedule(interview);
        job.setOfferDetails(offer);
        job.setLocation(location);
        jobRepository.save(job);
    }
}
