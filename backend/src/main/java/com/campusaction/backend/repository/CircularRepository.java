
package com.campusaction.backend.repository;

import com.campusaction.backend.entity.Circular;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CircularRepository
        extends JpaRepository<Circular, Long> {
}
