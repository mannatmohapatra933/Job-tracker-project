package com.example.demo;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DemoApplication {

    public static void main(String[] args) {
        System.out.println("DEBUG: DATABASE_URL = " + System.getenv("DATABASE_URL"));
        System.out.println("DEBUG: PGHOST = " + System.getenv("PGHOST"));
        System.out.println("DEBUG: PGPORT = " + System.getenv("PGPORT"));
        System.out.println("DEBUG: PGDATABASE = " + System.getenv("PGDATABASE"));
        System.out.println("DEBUG: PGUSER = " + System.getenv("PGUSER"));
        SpringApplication.run(DemoApplication.class, args);
    }

}
