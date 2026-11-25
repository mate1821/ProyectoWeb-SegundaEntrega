package com.health.project.controllers;

import java.time.LocalDateTime;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.health.project.entitys.Reserva;
import com.health.project.service.CalificacionService;
import com.health.project.service.ReservaService;

@RestController
@RequestMapping("/api/reservas/{id}")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class CalificacionRestController {

    private static final String DUENO_RESERVA ="@reservaService.buscarPorId(#id)?.usuario?.correo == authentication.name";

    @Autowired
    private ReservaService reservaService;

    @Autowired
    private CalificacionService calificacionService;

    @GetMapping("/calificaciones")
    @PreAuthorize(DUENO_RESERVA)
    public Map<String, Boolean> estado(@PathVariable Long id) {
        Reserva reserva = buscarReserva(id);
        return Map.of(  "medico", calificacionService.yaCalificoMedico(reserva),"espacio", reserva.getMedico().getEspacio() != null && calificacionService.yaCalificoEspacio(reserva));
    }

    @PostMapping("/calificacion-medico")
    @PreAuthorize(DUENO_RESERVA)
    public ResponseEntity<Map<String, String>> calificarMedico(@PathVariable Long id,
            @RequestBody CalificacionRequest datos) {
        Reserva reserva = buscarReserva(id);
        validar(reserva, datos);
        if (calificacionService.yaCalificoMedico(reserva)) {
            throw error(HttpStatus.CONFLICT, "Ya calificaste a este médico");
        }
        calificacionService.calificarMedico(reserva, datos.puntuacion(), limpiar(datos.comentario()));
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("mensaje", "Calificación del médico guardada"));
    }

    @PostMapping("/calificacion-espacio")
    @PreAuthorize(DUENO_RESERVA)
    public ResponseEntity<Map<String, String>> calificarEspacio(@PathVariable Long id,
            @RequestBody CalificacionRequest datos) {
        Reserva reserva = buscarReserva(id);
        validar(reserva, datos);
        if (reserva.getMedico().getEspacio() == null) {
            throw error(HttpStatus.BAD_REQUEST, "Esta reserva no tiene un espacio asignado");
        }
        if (calificacionService.yaCalificoEspacio(reserva)) {
            throw error(HttpStatus.CONFLICT, "Ya calificaste este espacio");
        }
        calificacionService.calificarEspacio(reserva, datos.puntuacion(), limpiar(datos.comentario()));
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("mensaje", "Calificación del espacio guardada"));
    }

    private Reserva buscarReserva(Long id) {
        Reserva reserva = reservaService.buscarPorId(id);
        if (reserva == null || reserva.getMedico() == null) {
            throw error(HttpStatus.NOT_FOUND, "No existe la reserva con id " + id);
        }
        return reserva;
    }

    private void validar(Reserva reserva, CalificacionRequest datos) {
        if (datos == null || datos.puntuacion() == null || datos.puntuacion() < 1 || datos.puntuacion() > 5) {
            throw error(HttpStatus.BAD_REQUEST, "La puntuación debe estar entre 1 y 5");
        }
        if (datos.comentario() != null && datos.comentario().length() > 255) {
            throw error(HttpStatus.BAD_REQUEST, "El comentario no puede tener más de 255 caracteres");
        }
        if (reserva.getEstado() != null && "Cancelada".equalsIgnoreCase(reserva.getEstado().getNombre())) {
            throw error(HttpStatus.BAD_REQUEST, "No se puede calificar una cita cancelada");
        }
        LocalDateTime fin = LocalDateTime.of(reserva.getFecha(), reserva.getHoraFin());
        if (LocalDateTime.now().isBefore(fin)) {
            throw error(HttpStatus.BAD_REQUEST, "Solo puedes calificar cuando la cita haya terminado");
        }
    }

    private String limpiar(String comentario) {
        return (comentario == null || comentario.isBlank()) ? null : comentario.trim();
    }

    private ResponseStatusException error(HttpStatus status, String mensaje) {
        return new ResponseStatusException(status, mensaje);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> manejarError(ResponseStatusException ex) {
        return ResponseEntity.status(ex.getStatusCode()).body(Map.of("error", String.valueOf(ex.getReason())));
    }
}