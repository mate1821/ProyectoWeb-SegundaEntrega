package com.health.project.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.health.project.entitys.CalificacionEspacio;

public interface CalificacionEspacioRepository extends JpaRepository<CalificacionEspacio, Long> {

    List<CalificacionEspacio> findByEspacioId(Integer espacioId);

    Optional<CalificacionEspacio> findByUsuarioIdAndEspacioId(Long usuarioId, Integer espacioId);

    // espacioId es Integer porque el id de Espacio es Integer (con Long Hibernate rechaza el parámetro)
    boolean existsByUsuarioIdAndEspacioId(Long usuarioId, Integer espacioId);

    @Query("SELECT AVG(c.puntuacion) FROM CalificacionEspacio c WHERE c.espacio.id = :espacioId")
    Double promedioPorEspacio(@Param("espacioId") Integer espacioId);
}