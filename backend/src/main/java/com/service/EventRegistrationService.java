
package com.campusaction.backend.service;

import com.campusaction.backend.dto.AdminDashboardResponse;
import com.campusaction.backend.dto.EventRegistrationCountResponse;
import com.campusaction.backend.dto.EventRegistrationResponse;

import com.campusaction.backend.entity.ActionItem;
import com.campusaction.backend.entity.Circular;
import com.campusaction.backend.entity.EventRegistration;
import com.campusaction.backend.entity.Notification;
import com.campusaction.backend.entity.User;

import com.campusaction.backend.repository.ActionItemRepository;
import com.campusaction.backend.repository.CircularRepository;
import com.campusaction.backend.repository.EventRegistrationRepository;
import com.campusaction.backend.repository.NotificationRepository;
import com.campusaction.backend.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class EventRegistrationService {

    private final EventRegistrationRepository registrationRepository;
    private final UserRepository userRepository;
    private final CircularRepository circularRepository;
    private final NotificationRepository notificationRepository;
    private final ActionItemRepository actionItemRepository;

    public EventRegistrationService(
            EventRegistrationRepository registrationRepository,
            UserRepository userRepository,
            CircularRepository circularRepository,
            NotificationRepository notificationRepository,
            ActionItemRepository actionItemRepository) {

        this.registrationRepository = registrationRepository;
        this.userRepository = userRepository;
        this.circularRepository = circularRepository;
        this.notificationRepository = notificationRepository;
        this.actionItemRepository = actionItemRepository;
    }

    // Register a student and notify Admins.
    // Create one pending Admin action for each new registration.
    @Transactional
    public EventRegistrationResponse register(
            String email, Long circularId) {

        User student = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"));

        if (!"STUDENT".equalsIgnoreCase(student.getRole())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only students can register for events");
        }

        Circular circular = circularRepository.findById(circularId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Event not found"));

        if (!"PUBLISHED".equalsIgnoreCase(circular.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only published events can be registered for");
        }

        if (registrationRepository.existsByStudentIdAndCircularId(
                student.getId(), circular.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "You have already registered for this event");
        }

        EventRegistration registration = new EventRegistration();
        registration.setStudent(student);
        registration.setCircular(circular);

        EventRegistration saved =
                registrationRepository.save(registration);

        // Notify all Admin accounts.
        List<User> admins = userRepository.findAll()
                .stream()
                .filter(user ->
                        "ADMIN".equalsIgnoreCase(user.getRole()))
                .toList();

        for (User admin : admins) {
            Notification notification = new Notification();
            notification.setUserId(admin.getId());
            notification.setCircularId(circular.getId());
            notification.setMessage(
                    student.getName()
                            + " registered for "
                            + circular.getTitle()
                            + "."
            );

            notificationRepository.save(notification);

            // Create a review task assigned to this Admin.
            ActionItem adminAction = new ActionItem();
            adminAction.setStudentId(admin.getId());
            adminAction.setCircularId(circular.getId());
            adminAction.setActionText(
                    "Review registration: "
                            + student.getName()
                            + " registered for "
                            + circular.getTitle()
            );
            adminAction.setDeadline(circular.getDeadline());
            adminAction.setStatus("PENDING");

            actionItemRepository.save(adminAction);
        }

        return toResponse(saved);
    }

    // Return registrations for the logged-in student.
    @Transactional(readOnly = true)
    public List<EventRegistrationResponse> getMyRegistrations(
            String email) {

        User student = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"));

        return registrationRepository.findByStudentId(student.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // Return registration statistics and details for Admins.
    @Transactional(readOnly = true)
    public AdminDashboardResponse getAdminDashboard() {

        long totalStudents =
                userRepository.countByRoleIgnoreCase("STUDENT");

        long totalRegistrations =
                registrationRepository.count();

        long uniqueRegisteredStudents =
                registrationRepository.countDistinctRegisteredStudents();

        List<EventRegistrationCountResponse> eventCounts =
                registrationRepository.getRegistrationCountsByEvent()
                        .stream()
                        .map(row -> new EventRegistrationCountResponse(
                                ((Number) row[0]).longValue(),
                                (String) row[1],
                                ((Number) row[2]).longValue()))
                        .toList();

        List<EventRegistrationResponse> registrations =
                registrationRepository.findAllWithStudentAndCircular()
                        .stream()
                        .map(this::toResponse)
                        .toList();

        return new AdminDashboardResponse(
                totalStudents,
                totalRegistrations,
                uniqueRegisteredStudents,
                eventCounts,
                registrations);
    }

    // Convert registration entity to response DTO.
    private EventRegistrationResponse toResponse(
            EventRegistration registration) {

        User student = registration.getStudent();
        Circular circular = registration.getCircular();

        return new EventRegistrationResponse(
                registration.getId(),
                student.getId(),
                student.getName(),
                student.getEmail(),
                student.getDepartment(),
                student.getYear(),
                student.getRole(),
                circular.getId(),
                circular.getTitle(),
                registration.getRegisteredAt());
    }
}
