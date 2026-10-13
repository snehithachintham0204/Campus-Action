
package com.campusaction.backend.controller;

import com.campusaction.backend.entity.Notification;
import com.campusaction.backend.repository.NotificationRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:5173")
public class NotificationController {

    private final NotificationRepository repository;

    public NotificationController(NotificationRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public Notification createNotification(
            @RequestBody Notification notification) {
        return repository.save(notification);
    }

    @GetMapping
    public List<Notification> getAllNotifications() {
        return repository.findAll();
    }

    @GetMapping("/user/{userId}")
    public List<Notification> getUserNotifications(
            @PathVariable Long userId) {
        return repository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @PatchMapping("/{id}/read")
    public Notification markAsRead(@PathVariable Long id) {
        Notification notification = repository.findById(id)
                .orElseThrow(() ->
                    new RuntimeException("Notification not found: " + id));

        notification.setRead(true);
        return repository.save(notification);
    }
}
