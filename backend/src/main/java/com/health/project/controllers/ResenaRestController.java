package com.health.project.controllers;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.health.project.repository.CalificacionEspacioRepository;
import com.health.project.repository.CalificacionMedicoRepository;
import com.health.project.service.EspacioService;
import com.health.project.service.MedicoService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/resenas")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
@RequiredArgsConstructor
public class ResenaRestController {

    private final CalificacionMedicoRepository calificacionesMedico;
    private final CalificacionEspacioRepository calificacionesEspacio;
    private final MedicoService medicos;
    private final EspacioService espacios;

    @GetMapping("/medico/{id}")
    public Listado resenasMedico(@PathVariable Long id) {
        var medico = medicos.buscarPorId(id);
        if (medico == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        return new Listado(medico.getNombre(), calificacionesMedico.findByMedicoId(id).stream()
                .map(c -> new Resena(c.getPuntuacion(), c.getComentario(), c.getFecha()))
                .sorted(Comparator.comparing(Resena::fecha).reversed())
                .toList());
    }

    @GetMapping("/espacio/{id}")
    public Listado resenasEspacio(@PathVariable Integer id) {
        var espacio = espacios.buscarPorId(id.longValue());
        if (espacio == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        return new Listado(espacio.getNombre(), calificacionesEspacio.findByEspacioId(id).stream()
                .map(c -> new Resena(c.getPuntuacion(), c.getComentario(), c.getFecha()))
                .sorted(Comparator.comparing(Resena::fecha).reversed())
                .toList());
    }

    public record Listado(String nombre, List<Resena> resenas) {}

    public record Resena(int puntuacion, String comentario, LocalDateTime fecha) {}
}
