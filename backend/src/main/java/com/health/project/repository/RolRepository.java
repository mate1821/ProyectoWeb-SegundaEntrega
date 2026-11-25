package com.health.project.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.health.project.entitys.Reserva;
import com.health.project.entitys.Rol;

public interface RolRepository extends JpaRepository<Rol, Long>{

}