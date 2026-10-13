
package com.campusaction.backend.controller;

import com.campusaction.backend.entity.Circular;
import com.campusaction.backend.service.CircularService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/circulars")
@CrossOrigin(origins = "http://localhost:5173")
public class CircularController {

    private final CircularService service;

    public CircularController(CircularService service) {
        this.service = service;
    }

    @PostMapping
    public Circular createCircular(@RequestBody Circular circular) {
        return service.createCircular(circular);
    }

    @GetMapping
    public List<Circular> getAllCirculars() {
        return service.getAllCirculars();
    }

    @GetMapping("/{id}")
    public Circular getCircularById(@PathVariable Long id) {
        return service.getCircularById(id);
    }

    @PutMapping("/{id}")
    public Circular updateCircular(
            @PathVariable Long id,
            @RequestBody Circular circular) {
        return service.updateCircular(id, circular);
    }

    @DeleteMapping("/{id}")
    public String deleteCircular(@PathVariable Long id) {
        service.deleteCircular(id);
        return "Circular deleted successfully";
    }
}
