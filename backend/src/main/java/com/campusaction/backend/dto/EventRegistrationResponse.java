
package com.campusaction.backend.dto;

import java.time.LocalDateTime;

public record EventRegistrationResponse(
        Long registrationId,
        Long studentId,
        String studentName,
        String email,
        String department,
        Integer year,
        String role,
        Long eventId,
        String eventTitle,
        LocalDateTime registeredAt
) {
}
