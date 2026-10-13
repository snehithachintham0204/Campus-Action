
package com.campusaction.backend.repository;

import com.campusaction.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByRoleAndDepartmentIgnoreCaseAndYear(
            String role,
            String department,
            Integer year
    );
}
