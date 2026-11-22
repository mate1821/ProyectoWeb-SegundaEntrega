package com.health.project.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.health.project.entitys.CalificacionMedico;

public interface CalificacionMedicoRepository extends JpaRepository<CalificacionMedico, Long> {

    List<CalificacionMedico> findByMedicoId(Long medicoId);

    Optional<CalificacionMedico> findByUsuarioIdAndMedicoId(Long usuarioId, Long medicoId);

    boolean existsByUsuarioIdAndMedicoId(Long usuarioId, Long medicoId);

    @Query("SELECT AVG(c.puntuacion) FROM CalificacionMedico c WHERE c.medico.id = :medicoId")
    Double promedioPorMedico(@Param("medicoId") Long medicoId);
}