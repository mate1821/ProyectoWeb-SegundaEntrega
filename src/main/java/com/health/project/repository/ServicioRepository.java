package com.health.project.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.health.project.entitys.Servicio;

public interface ServicioRepository extends JpaRepository<Servicio, Long> {
     @Query("""
        SELECT ser.nombre, COUNT(r) 
        from Reserva as r
        join r.servicios as ser
        group by ser.nombre, ser.id
        order by COUNT(r) DESC 
            """)
    List<Object[]> serviciosEnOrden();

}
