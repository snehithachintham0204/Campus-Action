
package com.campusaction.backend.dto;

public record EventRegistrationCountResponse(
        Long eventId,
        String eventTitle,
        Long registrationCount
) {
}

