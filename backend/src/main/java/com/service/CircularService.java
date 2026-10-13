
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
        Circular savedCircular = circularRepository.save(circular);

        if ("PUBLISHED".equalsIgnoreCase(savedCircular.getStatus())) {
            generateStudentActionsAndNotifications(savedCircular);
        }

        return savedCircular;
    }

    @Transactional
    public Circular updateCircular(Long id, Circular updated) {
        Circular circular = getCircularById(id);

        circular.setTitle(updated.getTitle());
        circular.setContent(updated.getContent());
        circular.setTargetDepartment(updated.getTargetDepartment());
        circular.setTargetYear(updated.getTargetYear());
        circular.setRequiredAction(updated.getRequiredAction());
        circular.setDeadline(updated.getDeadline());
        circular.setRequiredDocuments(updated.getRequiredDocuments());
        circular.setStatus(updated.getStatus());

        Circular savedCircular = circularRepository.save(circular);

        if ("PUBLISHED".equalsIgnoreCase(savedCircular.getStatus())) {
            generateStudentActionsAndNotifications(savedCircular);
        }

        return savedCircular;
    }

    private void generateStudentActionsAndNotifications(Circular circular) {
        List<User> students =
                userRepository.findByRoleAndDepartmentIgnoreCaseAndYear(
                        "STUDENT",
                        circular.getTargetDepartment(),
                        circular.getTargetYear()
                );

        for (User student : students) {

            if (!actionItemRepository.existsByStudentIdAndCircularId(
                    student.getId(), circular.getId())) {

                ActionItem action = new ActionItem();
                action.setStudentId(student.getId());
                action.setCircularId(circular.getId());
                action.setActionText(circular.getRequiredAction());
                action.setDeadline(circular.getDeadline());

                actionItemRepository.save(action);
            }

            if (!notificationRepository.existsByUserIdAndCircularId(
                    student.getId(), circular.getId())) {

                Notification notification = new Notification();
                notification.setUserId(student.getId());
                notification.setCircularId(circular.getId());
                notification.setMessage(
                        "New circular: " + circular.getTitle()
                );

                notificationRepository.save(notification);
            }
        }
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
        Circular circular = getCircularById(id);
        circularRepository.delete(circular);
    }
}
