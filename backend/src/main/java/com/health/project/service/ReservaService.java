
package com.health.project.service;

import java.util.Collection;
import java.util.List;

import org.springframework.stereotype.Service;

import com.health.project.entitys.Reserva;
import java.time.LocalDate;
import java.time.LocalTime;
import com.health.project.controllers.ReservaRequest;
import com.health.project.entitys.Servicio;




@Service
public interface ReservaService {

    List<Reserva> buscarReservas();

    Reserva buscarPorId(Long id);

    void guardar(Reserva reserva);

    void cancelar(Long id);

    void confirmar(Long id);

    List<Reserva> misReservas(Long id);

    List<Reserva> reservasDelMedico(Long medicoId);

    void cambiarEstado(Long idReserva, Long idEstado);
    List<LocalTime> horasDisponibles(Long medicoId, LocalDate fecha);

    void completarReserva(Reserva reserva,ReservaRequest datos,List<Servicio> serviciosPorDefecto);



}


