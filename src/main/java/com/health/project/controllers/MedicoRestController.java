package com.health.project.controllers;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.health.project.entitys.Medico;
import com.health.project.errors.MedicoNoSeleccionadoException;
import com.health.project.service.MedicoService;

@RestController
@RequestMapping("/api/medicos")
@CrossOrigin(origins = "http://localhost:4200")
public class MedicoRestController {

    private final MedicoService medicoService;

    public MedicoRestController(MedicoService med) {
        this.medicoService = med;
    }

    /**
     * GET /api/medicos                    -> todos los médicos
     * GET /api/medicos?especialidadId=3   -> solo los de esa especialidad
     *
     * Devuelve MedicoResumen y no Medico porque Medico hereda de Usuario:
     * enviaría también cédula, correo y contraseña.
     */
    @GetMapping
    public List<MedicoResumen> consultarMedicos(@RequestParam(required = false) Long especialidadId) {
        List<Medico> medicos;
        if (especialidadId == null) {
            medicos = medicoService.buscarTodos();
        } else {
            try {
                medicos = medicoService.buscarPorEspecialidad(especialidadId);
            } catch (MedicoNoSeleccionadoException e) {
                // En Thymeleaf esta excepción muestra una página HTML; para Angular basta una lista vacía
                medicos = List.of();
            }
        }
        return medicos.stream()
                .map(m -> new MedicoResumen(m.getId(), m.getNombre()))
                .toList();
    }

    /** JSON que recibe Angular: {"id": 8, "nombre": "Laura Gómez"} */
    public record MedicoResumen(Long id, String nombre) {
    }
}