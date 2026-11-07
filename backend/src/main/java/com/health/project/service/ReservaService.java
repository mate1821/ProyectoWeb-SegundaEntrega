
package com.health.project.service;

import java.util.Collection;
import java.util.List;

import org.springframework.stereotype.Service;

import com.health.project.entitys.Reserva;




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

}


