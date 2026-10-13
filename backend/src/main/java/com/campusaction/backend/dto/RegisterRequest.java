
package com.campusaction.backend.dto;

public record RegisterRequest(
    String name,
    String email,
    String password,
    String department,
    Integer year
) {}
