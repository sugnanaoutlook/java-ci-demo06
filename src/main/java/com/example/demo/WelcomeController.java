package com.example.demo;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class WelcomeController {

    @GetMapping("/")
    public String welcome() {
        return "Welcome to Java CI Demo Application!";
    }

    @GetMapping("/hello")
    public String hello() {
        return "Hello from WelcomeController!";
    }

    @GetMapping("/health")
    public String health() {
        return "Application is running successfully!";
    }
}
