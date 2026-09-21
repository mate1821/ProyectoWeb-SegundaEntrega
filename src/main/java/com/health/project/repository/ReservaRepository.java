package com.health.project.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

import com.health.project.entitys.Medico;
import com.health.project.entitys.Reserva;
import java.time.LocalDate;
import java.time.LocalTime;


public interface ReservaRepository extends JpaRepository<Reserva, Long>{

@Query("""
    SELECT r
    FROM Reserva r
    WHERE r.usuario.id = :usuarioId
    """)
List<Reserva> findMisReservas(@Param("usuarioId") Long usuarioId);

@Query("""
    SELECT r
    FROM Reserva r
    WHERE r.medico.id = :medicoId
    """)
List<Reserva> findByMedicoId(@Param("medicoId") Long medicoId);

public boolean existsByMedicoAndFechaAndHoraInicio(Medico medico, LocalDate fecha, LocalTime horaInicio);

List<Reserva> findByMedicoAndFecha(Medico medico, LocalDate fecha);

}

