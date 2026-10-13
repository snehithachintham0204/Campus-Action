
package com.campusaction.backend.dto;

import java.util.List;

public record AdminDashboardResponse(
        long totalStudents,
        long totalEventRegistrations,
        long uniqueRegisteredStudents,
        List<EventRegistrationCountResponse> eventCounts,
        List<EventRegistrationResponse> registrations
) {
}

