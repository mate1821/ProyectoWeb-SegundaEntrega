package com.health.project.service;

import java.util.Collection;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.health.project.entitys.EstadoReserva;
import com.health.project.entitys.Reserva;
import com.health.project.repository.EstadoReservaRepository;
import com.health.project.repository.ReservaRepository;
import java.util.List;

import com.health.project.errors.HorarioNoDisponibleException;
import com.health.project.errors.ReservaNoEncontradaException;
import com.health.project.controllers.ReservaRequest;
import com.health.project.entitys.Servicio;
import com.health.project.errors.UsuarioDuplicado;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Set;
import java.util.Objects;
import com.health.project.entitys.Medico;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@Service("reservaService")
public class ReservaServiceImpl implements ReservaService {

    private static final Long ID_CANCELADA = 2L;
    private static final Long ID_CONFIRMADA = 1L;

    private static final LocalTime HORA_APERTURA = LocalTime.of(7, 0);
    private static final LocalTime HORA_CIERRE = LocalTime.of(18, 0);

    @Autowired
    private ReservaRepository repo;

    @Autowired
    private EstadoReservaRepository estadoRepo;

    @Autowired
    private NotificacionService notificacionService;

    @Autowired
    private ServicioService servicioService;

    @Autowired
    private MedicoService medicoService;

    @Override
    public List<Reserva> buscarReservas() {
        return repo.findAll();
    }

    @Override
    public Reserva buscarPorId(Long id) {
        return repo.findById(id).orElse(null);
    }

    @Override
    public void guardar(Reserva reserva) {
        boolean esNueva = reserva.getIdReserva() == null; // guardar() también se usa para editar
        if (reserva.getIdReserva() == null && repo.existsByMedicoAndFechaAndHoraInicio(reserva.getMedico(),
                reserva.getFecha(), reserva.getHoraInicio())) {
            throw new HorarioNoDisponibleException(reserva.getMedico(), reserva.getFecha(), reserva.getHoraInicio());
        }
        List<Reserva> reservasExistentes = repo.findByMedicoAndFecha(
                reserva.getMedico(),
                reserva.getFecha());

        for (Reserva existente : reservasExistentes) {
            if (reserva.getIdReserva() != null && reserva.getIdReserva().equals(existente.getIdReserva())) {
                continue;
            }
            boolean seCruzan = reserva.getHoraInicio().isBefore(existente.getHoraFin())
                    && reserva.getHoraFin().isAfter(existente.getHoraInicio());
            if (seCruzan) {
                throw new HorarioNoDisponibleException(reserva.getMedico(), reserva.getFecha(),
                        reserva.getHoraInicio());
            }
        }
        repo.save(reserva);

        if (esNueva) {
            notificacionService.enviarConfirmacionReserva(reserva);
        }
    }

    @Override
    public void cancelar(Long id) {
        Reserva reserva = buscarPorId(id);
        if (reserva != null) {
            EstadoReserva estado = estadoRepo.findById(ID_CANCELADA).orElse(null);
            reserva.setEstado(estado);
            repo.save(reserva);
        }
    }

    @Override
    public void confirmar(Long id) {
        Reserva reserva = buscarPorId(id);
        if (reserva != null) {
            EstadoReserva estado = estadoRepo.findById(ID_CONFIRMADA).orElse(null);
            reserva.setEstado(estado);
            ;
            repo.save(reserva);
        }
    }

    @Override
    public void cambiarEstado(Long idReserva, Long idEstado) {
        Reserva reserva = buscarPorId(idReserva);
        if (reserva == null) {
            throw new ReservaNoEncontradaException(idReserva);
        }
        reserva.setEstado(estadoRepo.findById(idEstado).orElse(null));
        repo.save(reserva);
    }

    @Override
    public List<Reserva> misReservas(Long id) {
        return repo.findMisReservas(id);

    }

    @Override
    public List<Reserva> reservasDelMedico(Long medicoId) {
        return repo.findByMedicoId(medicoId);
    }

    @Override
    public List<LocalTime> horasDisponibles(Long medicoId, LocalDate fecha) {

        Set<LocalTime> ocupadas = new HashSet<>(repo.findHorasInicioOcupadas(medicoId, fecha));

        List<LocalTime> disponibles = new ArrayList<>();
        LocalTime hora = HORA_APERTURA;

        while (hora.isBefore(HORA_CIERRE)) {
            if (!ocupadas.contains(hora)) {
                disponibles.add(hora);
            }
            hora = hora.plusHours(1);
        }

        return disponibles;
    }

    public void completarReserva(Reserva reserva, ReservaRequest datos, List<Servicio> serviciosPorDefecto) {

        if (datos.fecha() == null || datos.horaInicio() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La fecha y la hora de inicio son obligatorias");
        }

        if (datos.medico() == null || datos.medico().id() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debe indicar el médico (medico.id)");
        }

        Medico medico = medicoService.buscarPorId(datos.medico().id());

        if (medico == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "No existe el médico con id " + datos.medico().id());
        }

        if (medico.getEspecialidad() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El médico seleccionado no tiene una especialidad asignada");
        }

        List<Servicio> servicios;

        if (datos.servicios() == null) {
            servicios = serviciosPorDefecto;
        } else {
            List<Long> idsServicios = datos.servicios().stream()
                    .map(ReservaRequest.Referencia::id)
                    .filter(Objects::nonNull)
                    .distinct()
                    .toList();

            servicios = new ArrayList<>(
                    servicioService.buscarPorIds(idsServicios));

            if (servicios.size() != idsServicios.size()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Alguno de los servicios indicados no existe");
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
}
