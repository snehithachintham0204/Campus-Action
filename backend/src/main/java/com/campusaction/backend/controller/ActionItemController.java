
package com.campusaction.backend.controller;

import com.campusaction.backend.entity.ActionItem;
import com.campusaction.backend.repository.ActionItemRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/actions")
@CrossOrigin(origins = "http://localhost:5173")
public class ActionItemController {

    private final ActionItemRepository repository;

    public ActionItemController(ActionItemRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public ActionItem createAction(@RequestBody ActionItem action) {
        return repository.save(action);
    }

    @GetMapping
    public List<ActionItem> getAllActions() {
        return repository.findAll();
    }

    @GetMapping("/student/{studentId}")
    public List<ActionItem> getStudentActions(
            @PathVariable Long studentId) {
        return repository.findByStudentId(studentId);
    }

    @PatchMapping("/{id}/complete")
    public ActionItem completeAction(@PathVariable Long id) {
        ActionItem action = repository.findById(id)
                .orElseThrow(() ->
                    new RuntimeException("Action item not found: " + id));

        action.setStatus("COMPLETED");
        return repository.save(action);
    }
}
