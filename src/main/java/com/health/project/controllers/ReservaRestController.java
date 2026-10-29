package com.health.project.controllers;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.health.project.entitys.Medico;
import com.health.project.entitys.Reserva;
import com.health.project.entitys.Servicio;
import com.health.project.entitys.Usuario;
import com.health.project.errors.HorarioNoDisponibleException;
import com.health.project.errors.ReservaNoEncontradaException;
import com.health.project.service.EstadoResService;
import com.health.project.service.MedicoService;
import com.health.project.service.ReservaService;
import com.health.project.service.ServicioService;
import com.health.project.service.UsuarioService;

import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/api/reservas")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class ReservaRestController {

    // Mismo id de estado "Confirmada" que usa ReservaController al crear una
    // reserva
    private static final Long ID_CONFIRMADA = 1L;

    @Autowired
    private ReservaService reservaService;
    @Autowired
    private UsuarioService usuarioService;
    @Autowired
    private MedicoService medicoService;
    @Autowired
    private EstadoResService estadoService;
    @Autowired
    private ServicioService servicioService;

    // 1. GET /api/reservas -> lista todas las reservas
    @GetMapping
    public List<Reserva> listar() {
        return reservaService.buscarReservas();
    }

    /*
     * @GetMapping("/mias")
     * public List<Reserva> misReservas(HttpSession session) {
     * Long usuarioId = (Long) session.getAttribute("usuarioId");
     * if (usuarioId == null) {
     * throw error(HttpStatus.UNAUTHORIZED, "Debe primero iniciar sesión");
     * }
     * return reservaService.misReservas(usuarioId);
     * }
     */

    @GetMapping("/usuario/{usuarioId}")
    public List<Reserva> misReservas(@PathVariable Long usuarioId) {
        return reservaService.misReservas(usuarioId);
    }

    @GetMapping("/{id}")
    public Reserva buscar(@PathVariable Long id) {
        Reserva r = reservaService.buscarPorId(id);
        if (r == null)
            throw new ReservaNoEncontradaException(id);
        return r;
    }

    @PutMapping("/{id}/estado")
    public Reserva cambiarEstado(@PathVariable Long id, @RequestBody ReservaRequest.Referencia estado) {
        if (estado == null || estado.id() == null) {
            throw error(HttpStatus.BAD_REQUEST, "Debe indicar el estado (id)");
        }
        if (estadoService.buscarPorId(estado.id()) == null) {
            throw error(HttpStatus.BAD_REQUEST, "No existe el estado con id " + estado.id());
        }
        reservaService.cambiarEstado(id, estado.id());
        return reservaService.buscarPorId(id);
    }

    // 2. POST /api/reservas -> crea una reserva (siempre queda "Confirmada")
    @PostMapping("/usuario/{pacienteId}")
    @ResponseStatus(HttpStatus.CREATED)
    public Reserva crear(@PathVariable Long pacienteId, @RequestBody ReservaRequest datos) {
        Usuario paciente = usuarioService.buscarPorId(pacienteId);
        if (paciente == null) {
            throw error(HttpStatus.NOT_FOUND, "No existe el usuario con id " + pacienteId);
        }
        Reserva reserva = new Reserva();
        reserva.setFechaSolicitud(LocalDateTime.now());
        reserva.setEstado(estadoService.buscarPorId(ID_CONFIRMADA));
        reserva.setUsuario(paciente);
        completarReserva(reserva, datos, new ArrayList<>());
        reservaService.guardar(reserva);
        return reserva;
    }

    // 3. PUT /api/reservas/{id} -> actualiza una reserva existente
    @PutMapping("/{id}")
    public Reserva actualizar(@PathVariable Long id, @RequestBody ReservaRequest datos) {
        Reserva existente = reservaService.buscarPorId(id);
        if (existente == null) {
            throw new ReservaNoEncontradaException(id);
        }
        Reserva reserva = new Reserva();
        reserva.setIdReserva(id);
        reserva.setFechaSolicitud(existente.getFechaSolicitud());

        // Si el JSON no trae estado o servicios, se conservan los que ya tenía la
        // reserva
        if (datos.estado() == null || datos.estado().id() == null) {
            reserva.setEstado(existente.getEstado());
        } else {
            var estado = estadoService.buscarPorId(datos.estado().id());
            if (estado == null) {
                throw error(HttpStatus.BAD_REQUEST, "No existe el estado con id " + datos.estado().id());
            }
            reserva.setEstado(estado);
        }
        List<Servicio> serviciosActuales = existente.getServicios() == null
                ? new ArrayList<>()
                : new ArrayList<>(existente.getServicios());

        completarReserva(reserva, datos, serviciosActuales);
        reserva.setUsuario(existente.getUsuario());
        reservaService.guardar(reserva);
        return reserva;
    }

    // 4. DELETE /api/reservas/{id} -> cancela la reserva (no se borra: pasa al
    // estado "Cancelada")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cancelar(@PathVariable Long id) {
        if (reservaService.buscarPorId(id) == null) {
            throw new ReservaNoEncontradaException(id);
        }
        reservaService.cancelar(id);
    }

    /**
     * Valida el JSON recibido y completa la reserva igual que
     * ReservaController.guardarReserva:
     * paciente y médico reales, servicios reales, hora fin (+1 hora) y total
     * (costo de la especialidad + servicios).
     *
     * @param serviciosPorDefecto servicios que se usan si el JSON no trae la lista
     *                            "servicios"
     */
    private void completarReserva(Reserva reserva, ReservaRequest datos, List<Servicio> serviciosPorDefecto) {
        if (datos.fecha() == null || datos.horaInicio() == null) {
            throw error(HttpStatus.BAD_REQUEST, "La fecha y la hora de inicio son obligatorias");
        }

        if (datos.medico() == null || datos.medico().id() == null) {
            throw error(HttpStatus.BAD_REQUEST, "Debe indicar el médico (medico.id)");
        }

        Medico medico = medicoService.buscarPorId(datos.medico().id());
        if (medico == null) {
            throw error(HttpStatus.NOT_FOUND, "No existe el médico con id " + datos.medico().id());
        }
        if (medico.getEspecialidad() == null) {
            throw error(HttpStatus.BAD_REQUEST, "El médico seleccionado no tiene una especialidad asignada");
        }

        // Los servicios llegan como [{"id": 1}, ...]: se cambian por los servicios
        // reales de la base de datos
        List<Servicio> servicios;
        if (datos.servicios() == null) {
            servicios = serviciosPorDefecto;
        } else {
            List<Long> idsServicios = datos.servicios().stream()
                    .map(ReservaRequest.Referencia::id)
                    .filter(Objects::nonNull)
                    .distinct()
                    .toList();
            servicios = new ArrayList<>(servicioService.buscarPorIds(idsServicios));
            if (servicios.size() != idsServicios.size()) {
                throw error(HttpStatus.BAD_REQUEST, "Alguno de los servicios indicados no existe");
            }
        }

        double total = medico.getEspecialidad().getCosto();
        for (Servicio s : servicios) {
            if (s.getCosto() != null) {
                total += s.getCosto();
            }
        }

        reserva.setMedico(medico);
        reserva.setFecha(datos.fecha());
        reserva.setHoraInicio(datos.horaInicio());
        reserva.setHoraFin(datos.horaInicio().plusHours(1));
        reserva.setObservaciones(datos.observaciones());
        reserva.setServicios(servicios);
        reserva.setTotal(total);
    }

    private ResponseStatusException error(HttpStatus status, String mensaje) {
        return new ResponseStatusException(status, mensaje);
    }

    @GetMapping("/medico/{medicoId}")
    public List<Reserva> reservasDelMedico(@PathVariable Long medicoId) {
        return reservaService.reservasDelMedico(medicoId);
    }

    // ---- Manejo de errores en JSON (tienen prioridad sobre el
    // GlobalHandlerException) ----

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> manejarError(ResponseStatusException ex) {
        return ResponseEntity.status(ex.getStatusCode()).body(Map.of("error", String.valueOf(ex.getReason())));
    }

    @ExceptionHandler(HorarioNoDisponibleException.class)
    public ResponseEntity<Map<String, String>> manejarHorarioNoDisponible(HorarioNoDisponibleException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", ex.getMessage()));
    }

    // JSON ilegible (formato de fecha/hora incorrecto, cuerpo vacío, etc.): se
    // responde 400 en JSON
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, String>> manejarJsonInvalido(HttpMessageNotReadableException ex) {
        return ResponseEntity.badRequest().body(Map.of("error",
                "El cuerpo de la petición no es válido (revise el JSON, la fecha yyyy-MM-dd y la hora HH:mm)"));
    }

    @ExceptionHandler(ReservaNoEncontradaException.class)
    public ResponseEntity<Map<String, String>> manejarReservaNoEncontrada(ReservaNoEncontradaException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", ex.getMessage()));
    }
}
