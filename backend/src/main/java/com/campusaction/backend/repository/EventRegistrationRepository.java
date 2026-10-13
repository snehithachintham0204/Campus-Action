
package com.campusaction.backend.repository;

import com.campusaction.backend.entity.EventRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface EventRegistrationRepository
        extends JpaRepository<EventRegistration, Long> {

    boolean existsByStudentIdAndCircularId(
            Long studentId, Long circularId);

    long countByCircularId(Long circularId);

    @Query("""
        SELECT er.circular.id, er.circular.title, COUNT(er.id)
        FROM EventRegistration er
        GROUP BY er.circular.id, er.circular.title
        ORDER BY er.circular.title
        """)
    List<Object[]> getRegistrationCountsByEvent();

    @Query("""
        SELECT COUNT(DISTINCT er.student.id)
        FROM EventRegistration er
        """)
    long countDistinctRegisteredStudents();

    @Query("""
        SELECT er
        FROM EventRegistration er
        JOIN FETCH er.student
        JOIN FETCH er.circular
        ORDER BY er.registeredAt DESC
        """)
    List<EventRegistration> findAllWithStudentAndCircular();

    @Query("""
        SELECT er
        FROM EventRegistration er
        WHERE er.student.id = :studentId
        ORDER BY er.registeredAt DESC
        """)
    List<EventRegistration> findByStudentId(
            @Param("studentId") Long studentId);
}
