
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
import com.health.project.errors.UsuarioDuplicado;

@Service
public class ReservaServiceImpl implements ReservaService {

    private static final Long ID_CANCELADA = 2L;
    private static final Long ID_CONFIRMADA = 1L;
    
    @Autowired
    private ReservaRepository repo;

    @Autowired 
    private EstadoReservaRepository estadoRepo;

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
        if (reserva.getIdReserva() == null && repo.existsByMedicoAndFechaAndHoraInicio(reserva.getMedico(), reserva.getFecha(), reserva.getHoraInicio()) ) {
        throw new HorarioNoDisponibleException(reserva.getMedico(), reserva.getFecha(), reserva.getHoraInicio());
    }
    List<Reserva> reservasExistentes = repo.findByMedicoAndFecha(
        reserva.getMedico(), 
        reserva.getFecha()
    );

    for (Reserva existente : reservasExistentes) {
        if (reserva.getIdReserva() != null && reserva.getIdReserva().equals(existente.getIdReserva())) {
            continue;
        }
        boolean seCruzan = reserva.getHoraInicio().isBefore(existente.getHoraFin()) && reserva.getHoraFin().isAfter(existente.getHoraInicio());
        if (seCruzan) {
            throw new HorarioNoDisponibleException(reserva.getMedico(), reserva.getFecha(), reserva.getHoraInicio());
        }
    }
        repo.save(reserva);
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
            reserva.setEstado(estado);;
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

}