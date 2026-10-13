
package com.campusaction.backend.controller;

import com.campusaction.backend.dto.AdminDashboardResponse;
import com.campusaction.backend.dto.EventRegistrationResponse;
import com.campusaction.backend.service.EventRegistrationService;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class EventRegistrationController {

    private final EventRegistrationService service;

    public EventRegistrationController(
            EventRegistrationService service) {
        this.service = service;
    }

    @PostMapping("/event-registrations/{circularId}")
    public EventRegistrationResponse register(
            @PathVariable Long circularId,
            Authentication authentication) {

        return service.register(
                authentication.getName(), circularId);
    }

    @GetMapping("/event-registrations/my")
    public List<EventRegistrationResponse> getMyRegistrations(
            Authentication authentication) {

        return service.getMyRegistrations(authentication.getName());
    }

    @GetMapping("/admin/dashboard")
    public AdminDashboardResponse getAdminDashboard() {
        return service.getAdminDashboard();
    }
}
