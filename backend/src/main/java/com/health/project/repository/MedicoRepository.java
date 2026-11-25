package com.health.project.repository;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.health.project.entitys.Medico;


public interface MedicoRepository extends JpaRepository<Medico, Long> {
        @Query("""
        SELECT m.nombre, e.nombreEspecialidad, COUNT(r) 
        from Reserva as r
        join r.medico as m
        join m.especialidad as e
        group by m.id, m.nombre, e.nombreEspecialidad
        order by COUNT(r) DESC 
            """)
    List<Object[]> medicosMasCotizados();

        @Query("""
                SELECT m
                FROM Medico m
                WHERE m.especialidad.id = :especialidadId
                """)
            List<Medico> findByEspecialidadId(@Param("especialidadId") Long especialidadId);
}


