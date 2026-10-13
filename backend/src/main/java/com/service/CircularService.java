package com.campusaction.backend.service;

import com.campusaction.backend.entity.ActionItem;
import com.campusaction.backend.entity.Circular;
import com.campusaction.backend.entity.Notification;
import com.campusaction.backend.entity.User;

import com.campusaction.backend.repository.ActionItemRepository;
import com.campusaction.backend.repository.CircularRepository;
import com.campusaction.backend.repository.NotificationRepository;
import com.campusaction.backend.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

@Service
public class CircularService {

    private final CircularRepository circularRepository;
    private final UserRepository userRepository;
    private final ActionItemRepository actionItemRepository;
    private final NotificationRepository notificationRepository;

    public CircularService(
            CircularRepository circularRepository,
            UserRepository userRepository,
            ActionItemRepository actionItemRepository,
            NotificationRepository notificationRepository) {

        this.circularRepository = circularRepository;
        this.userRepository = userRepository;
        this.actionItemRepository = actionItemRepository;
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public Circular createCircular(Circular circular) {

        normalizeTargetYears(circular);

        Circular savedCircular = circularRepository.save(circular);

        if (isPublished(savedCircular)) {
            generateStudentActionsAndNotifications(savedCircular);
        }

        return savedCircular;
    }

    @Transactional
    public Circular updateCircular(Long id, Circular updated) {

        Circular existing = circularRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Circular not found: " + id));

        existing.setTitle(updated.getTitle());
        existing.setContent(updated.getContent());
        existing.setTargetDepartment(updated.getTargetDepartment());
        existing.setTargetYear(updated.getTargetYear());
        existing.setTargetYears(updated.getTargetYears());
        existing.setRequiredAction(updated.getRequiredAction());
        existing.setDeadline(updated.getDeadline());
        existing.setRequiredDocuments(updated.getRequiredDocuments());
        existing.setStatus(updated.getStatus());

        normalizeTargetYears(existing);

        Circular savedCircular = circularRepository.save(existing);

        if (isPublished(savedCircular)) {
            generateStudentActionsAndNotifications(savedCircular);
        }

        return savedCircular;
    }

    private void normalizeTargetYears(Circular circular) {

        if (circular.getTargetYears() == null
                || circular.getTargetYears().trim().isEmpty()) {

            if (circular.getTargetYear() != null) {
                circular.setTargetYears(
                        String.valueOf(circular.getTargetYear()));
            }
        }
    }

    private boolean isPublished(Circular circular) {

        return circular.getStatus() != null
                && circular.getStatus().trim()
                        .equalsIgnoreCase("PUBLISHED");
    }

    @Transactional
    public void generateStudentActionsAndNotifications(
            Circular circular) {

        if (!isPublished(circular)) {
            return;
        }

        List<User> students = userRepository.findAll()
                .stream()
                .filter(user -> user.getRole() != null)
                .filter(user -> user.getRole().trim()
                        .replace("ROLE_", "")
                        .equalsIgnoreCase("STUDENT"))
                .filter(user -> matchesDepartment(
                        user.getDepartment(),
                        circular.getTargetDepartment()))
                .filter(user -> matchesYear(
                        user.getYear(),
                        circular.getTargetYears(),
                        circular.getTargetYear()))
                .toList();

        for (User student : students) {

            Long studentId = student.getId();
            Long circularId = circular.getId();

            if (studentId == null || circularId == null) {
                continue;
            }

            if (!actionItemRepository
                    .existsByStudentIdAndCircularId(
                            studentId, circularId)) {

                ActionItem action = new ActionItem();

                action.setStudentId(studentId);
                action.setCircularId(circularId);

                String actionText = circular.getRequiredAction();

                if (actionText == null || actionText.trim().isEmpty()) {
                    actionText = "Review circular: "
                            + circular.getTitle();
                }

                action.setActionText(actionText);
                action.setDeadline(circular.getDeadline());
                action.setStatus("PENDING");

                actionItemRepository.save(action);
            }

            if (!notificationRepository
                    .existsByUserIdAndCircularId(
                            studentId, circularId)) {

                Notification notification = new Notification();

                notification.setUserId(studentId);
                notification.setCircularId(circularId);
                notification.setMessage(
                        "New circular: " + circular.getTitle());
                notification.setRead(false);

                notificationRepository.save(notification);
            }
        }
    }

    private boolean matchesDepartment(
            String studentDepartment,
            String targetDepartments) {

        if (targetDepartments == null
                || targetDepartments.trim().isEmpty()
                || targetDepartments.trim().equalsIgnoreCase("ALL")) {
            return true;
        }

        if (studentDepartment == null) {
            return false;
        }

        return Arrays.stream(targetDepartments.split(","))
                .map(String::trim)
                .anyMatch(department ->
                        department.equalsIgnoreCase(
                                studentDepartment.trim()));
    }

    private boolean matchesYear(
            Integer studentYear,
            String targetYears,
            Integer targetYear) {

        if ((targetYears == null || targetYears.trim().isEmpty())
                && targetYear == null) {
            return true;
        }

        if (studentYear == null) {
            return false;
        }

        if (targetYears != null && !targetYears.trim().isEmpty()) {
            return Arrays.stream(targetYears.split(","))
                    .map(String::trim)
                    .filter(value -> !value.isEmpty())
                    .map(value -> {
                        try {
                            return Integer.valueOf(value);
                        } catch (NumberFormatException exception) {
                            return null;
                        }
                    })
                    .anyMatch(year ->
                            year != null && year.equals(studentYear));
        }

        return targetYear != null && targetYear.equals(studentYear);
    }

    public List<Circular> getAllCirculars() {
        return circularRepository.findAll();
    }

    public Circular getCircularById(Long id) {
        return circularRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Circular not found: " + id));
    }

    @Transactional
    public void deleteCircular(Long id) {
        circularRepository.deleteById(id);
    }
}
