package com.health.project.repository;


import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.health.project.entitys.Especialidad;
import com.health.project.entitys.Servicio;
import com.health.project.entitys.Usuario;






public interface EspecialidadRepository extends JpaRepository<Especialidad, Long> {

    @Query("""
            SELECT e.nombreEspecialidad, COUNT(r) as conteo
            from Reserva as r 
            join r.medico m 
            join m.especialidad e 
            group by e.id, e.nombreEspecialidad
            order by conteo DESC
            """)
    List<Object[]> conteoDeCitasporEspecialidad();
    
}
