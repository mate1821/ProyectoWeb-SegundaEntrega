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
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
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

    /**
     * GET /api/medicos/directorio -> médicos activos con su especialidad y su
     * espacio (clínica). Lo usa la pantalla de búsqueda de Angular (issue #24),
     * que filtra la lista con pipes por nombre de médico o clínica y por especialidad.
     *
     * Igual que MedicoResumen, no envía cédula, correo ni contraseña.
     */
    @GetMapping("/directorio")
    public List<MedicoDirectorio> directorio() {
        return medicoService.buscarTodos().stream()
                .filter(m -> !Boolean.FALSE.equals(m.getActivo()))
                .map(MedicoDirectorio::desde)
                .toList();
    }

    /** JSON que recibe Angular: {"id": 8, "nombre": "Laura Gómez"} */
    public record MedicoResumen(Long id, String nombre) {
    }

    /**
     * Un médico para la búsqueda:
     * {"id": 8, "nombre": "Laura Gómez", "especialidadId": 3, "especialidad": "Pediatría",
     *  "espacioId": 1, "espacio": "Clínica Shaio", "ubicacion": "Diagonal 115A # 70C-75"}
     */
    public record MedicoDirectorio(Long id, String nombre, Long especialidadId, String especialidad,
            Integer espacioId, String espacio, String ubicacion) {

        static MedicoDirectorio desde(Medico m) {
            var esp = m.getEspecialidad();
            var lugar = m.getEspacio();
            return new MedicoDirectorio(
                    m.getId(),
                    m.getNombre(),
                    esp != null ? esp.getId() : null,
                    esp != null ? esp.getNombreEspecialidad() : null,
                    lugar != null ? lugar.getId() : null,
                    lugar != null ? lugar.getNombre() : null,
                    lugar != null ? lugar.getUbicacion() : null);
        }
    }
}
