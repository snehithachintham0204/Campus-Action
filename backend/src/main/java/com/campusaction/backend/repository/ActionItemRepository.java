
package com.campusaction.backend.repository;

import com.campusaction.backend.entity.ActionItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ActionItemRepository
        extends JpaRepository<ActionItem, Long> {

    List<ActionItem> findByStudentId(Long studentId);

    boolean existsByStudentIdAndCircularId(
            Long studentId,
            Long circularId
    );
}
