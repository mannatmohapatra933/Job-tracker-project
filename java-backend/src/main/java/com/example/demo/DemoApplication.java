package com.example.demo;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DemoApplication {

    public static void main(String[] args) {
        System.out.println("DEBUG: DATABASE_URL = " + System.getenv("DATABASE_URL"));
        System.out.println("DEBUG: DB_URL = " + System.getenv("DB_URL"));
        SpringApplication.run(DemoApplication.class, args);
    }

}
